"""
최종 결과 생성: 권역(폴리곤 매칭) 내 상점의 최근 3개월 오더 집계 + 행정동 라벨

입력
- output/matched_stores.csv         : store_id, sgg, admin_dong (폴리곤 대조 결과, 권역 내 상점)
- data/orders_by_store_day.json     : Metabase 결과 (store_id, store_name, d, max_at, cnt)

출력
- output/final_result.csv : store_id, store_name, sgg, admin_dong, last_order_at, order_cnt_3m
- 표준출력: 요약
"""

import csv
import json
import os
from collections import defaultdict

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
OUT = os.path.join(BASE, "output")


def load_matched():
    m = {}
    with open(os.path.join(OUT, "matched_stores.csv"), encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            m[row["store_id"]] = (row["sgg"], row["admin_dong"])
    return m


def load_orders():
    with open(os.path.join(DATA, "orders_by_store_month.json"), encoding="utf-8") as f:
        res = json.load(f)
    rows = res["data"]["rows"]  # [store_id, store_name, mon, max_at, cnt]
    last_at = {}
    name = {}
    cnt = defaultdict(int)
    for sid, sname, mon, max_at, c in rows:
        sid = str(sid)
        name[sid] = sname
        cnt[sid] += int(c)
        if sid not in last_at or max_at > last_at[sid]:
            last_at[sid] = max_at
    return name, last_at, dict(cnt)


def main():
    matched = load_matched()             # 권역 내 상점 (1,691)
    name, last_at, cnt = load_orders()   # 최근 3개월 오더 발생 상점 (성북/성동 전체)

    rows = []
    for sid in cnt:
        if sid not in matched:           # 권역 밖(타 행정동) 상점 제외
            continue
        sgg, dong = matched[sid]
        rows.append({
            "store_id": sid,
            "store_name": name.get(sid, ""),
            "sgg": sgg,
            "admin_dong": dong,
            "last_order_at": last_at[sid],
            "order_cnt_3m": cnt[sid],
        })

    # 최근 오더일 내림차순
    rows.sort(key=lambda r: r["last_order_at"], reverse=True)

    path = os.path.join(OUT, "final_result.csv")
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=["store_id", "store_name", "sgg", "admin_dong", "last_order_at", "order_cnt_3m"])
        w.writeheader()
        w.writerows(rows)

    # 행정동별 상점 수 요약
    per_dong = defaultdict(int)
    for r in rows:
        per_dong[(r["sgg"], r["admin_dong"])] += 1

    print(f"권역 내 + 최근 3개월 오더 발생 상점: {len(rows)}개")
    print(f"(성북/성동 전체 오더 발생 상점 {len(cnt)}개 중 권역 23개동 소속만 필터)")
    print("\n[행정동별 상점 수]")
    for (sgg, dong), c in sorted(per_dong.items()):
        print(f"  {sgg} {dong}: {c}")
    print(f"\n저장: {path}")


if __name__ == "__main__":
    main()
