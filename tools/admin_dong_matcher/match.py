"""
상점 좌표 ↔ 행정동 폴리곤 대조 (point-in-polygon)

입력
- data/HangJeongDong_ver*.geojson : 전국 행정동 경계 (vuski/admdongkor)
- data/stores_*.json              : Metabase execute_query 결과(JSON, data.rows = [STORE_ID, LAT, LNG])

처리
- GeoJSON에서 대상 구(성북구/성동구) 행정동 폴리곤만 추출
- 각 상점 좌표를 폴리곤과 대조해 실제 소속 행정동 판별
- 지정한 권역(TARGET_DONGS)에 속하는 상점만 추려 store_id 목록 저장

출력
- output/matched_stores.csv : store_id, sgg, admin_dong (권역 내 상점)
- output/match_summary.csv  : 행정동별 상점 수
- 표준출력             : 요약 + 미매칭/검증 로그
"""

import csv
import glob
import json
import os
import re
import sys

from shapely.geometry import shape, Point
from shapely.strtree import STRtree

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
OUT = os.path.join(BASE, "output")
os.makedirs(OUT, exist_ok=True)

TARGET_SGG = ["성북구", "성동구"]

# 사용자가 지정한 권역 행정동 (표기는 자유 — 정규화 후 비교)
TARGET_DONGS = {
    "성북구": [
        "길음1동", "길음2동", "정릉1동", "정릉2동", "돈암1동", "돈암2동",
        "종암동", "동선동", "안암동", "보문동", "삼선동", "성북동",
    ],
    "성동구": [
        "마장동", "사근동", "왕십리도선동", "왕십리2동", "행당1동", "행당2동",
        "금호1가동", "금호2,3가동", "금호4가동", "응봉동", "옥수동",
    ],
}


def norm(name: str) -> str:
    """구분자/공백 제거 후 한글·숫자만 남겨 비교용 키 생성. 예: 금호2,3가동 == 금호2.3가동 == 금호2·3가동"""
    return re.sub(r"[^0-9가-힣]", "", name or "")


def load_geojson_polygons():
    path = sorted(glob.glob(os.path.join(DATA, "HangJeongDong_ver*.geojson")))[-1]
    print(f"[geojson] {os.path.basename(path)}")
    with open(path, encoding="utf-8") as f:
        gj = json.load(f)

    geoms, metas = [], []
    for feat in gj["features"]:
        p = feat["properties"]
        if p.get("sggnm") not in TARGET_SGG:
            continue
        adm_nm = p["adm_nm"]            # 예: "서울특별시 성북구 길음1동"
        dong = adm_nm.split()[-1]
        geom = shape(feat["geometry"])
        geoms.append(geom)
        metas.append({"sgg": p["sggnm"], "dong": dong, "adm_cd2": p.get("adm_cd2")})
    print(f"[geojson] 성북/성동 행정동 폴리곤 {len(geoms)}개 로드")
    return geoms, metas


def load_stores():
    stores = []
    for path in sorted(glob.glob(os.path.join(DATA, "stores_*.json"))):
        with open(path, encoding="utf-8") as f:
            res = json.load(f)
        rows = res["data"]["rows"]
        for sid, lat, lng in rows:
            try:
                stores.append((str(sid), float(lat), float(lng)))
            except (TypeError, ValueError):
                pass
        print(f"[stores] {os.path.basename(path)} : {len(rows)}행")
    print(f"[stores] 총 {len(stores)}개 상점 좌표")
    return stores


def main():
    geoms, metas = load_geojson_polygons()
    stores = load_stores()

    tree = STRtree(geoms)

    # 정규화된 타깃 키 집합
    target_keys = {(sgg, norm(d)) for sgg, dongs in TARGET_DONGS.items() for d in dongs}

    assigned = {}          # store_id -> (sgg, dong)
    unmatched = 0          # 어떤 폴리곤에도 안 들어간 상점
    for sid, lat, lng in stores:
        pt = Point(lng, lat)
        hit = None
        for idx in tree.query(pt):
            if geoms[idx].contains(pt):
                hit = metas[idx]
                break
        if hit is None:
            unmatched += 1
            continue
        assigned[sid] = (hit["sgg"], hit["dong"])

    # 권역 필터
    matched = {sid: v for sid, v in assigned.items() if (v[0], norm(v[1])) in target_keys}

    # 행정동별 집계
    per_dong = {}
    for sid, (sgg, dong) in matched.items():
        per_dong.setdefault((sgg, dong), 0)
        per_dong[(sgg, dong)] += 1

    # 타깃인데 매칭 0건인 행정동 점검
    found_keys = {(sgg, norm(dong)) for (sgg, dong) in per_dong}
    missing_targets = [(sgg, d) for sgg, dongs in TARGET_DONGS.items()
                       for d in dongs if (sgg, norm(d)) not in found_keys]

    # 저장
    with open(os.path.join(OUT, "matched_stores.csv"), "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["store_id", "sgg", "admin_dong"])
        for sid in sorted(matched, key=int):
            w.writerow([sid, matched[sid][0], matched[sid][1]])

    with open(os.path.join(OUT, "match_summary.csv"), "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["sgg", "admin_dong", "store_cnt"])
        for (sgg, dong), c in sorted(per_dong.items()):
            w.writerow([sgg, dong, c])

    # store_id 목록 (SQL IN 절용)
    ids_sorted = sorted(matched, key=int)
    with open(os.path.join(OUT, "matched_store_ids.txt"), "w", encoding="utf-8") as f:
        f.write(",".join(ids_sorted))

    print("\n===== 결과 요약 =====")
    print(f"성북/성동 상점 총 {len(stores)}개 중 폴리곤 미매칭(구 경계 밖 좌표): {unmatched}개")
    print(f"폴리곤 기준 행정동 배정 완료: {len(assigned)}개")
    print(f"지정 권역(23개 행정동) 내 상점: {len(matched)}개")
    print("\n[행정동별 상점 수]")
    for (sgg, dong), c in sorted(per_dong.items()):
        print(f"  {sgg} {dong}: {c}")
    if missing_targets:
        print("\n[주의] 지정했으나 매칭 0건인 행정동(표기/경계 확인 필요):")
        for sgg, d in missing_targets:
            print(f"  {sgg} {d}")
    print(f"\n출력: {OUT}")


if __name__ == "__main__":
    main()
