# 상용(Prime DB) 조회 결과 JSON 2개(매핑, 전체상점수)를 기존 3-3 포맷 CSV로 조립
# 사용법: python tools_build_live_fee_csv.py <매핑_JSON> <전체상점수_JSON> <출력_CSV>
import csv
import json
import sys
from collections import defaultdict

map_json, cnt_json, out_csv = sys.argv[1], sys.argv[2], sys.argv[3]
store_csv = "projects/260720_성북성동_b존_전환/3-1_이관대상_상점목록.csv"

with open(map_json, encoding="utf-8") as f:
    rows = json.load(f)["data"]["rows"]
with open(cnt_json, encoding="utf-8") as f:
    total_cnt = {str(r[0]): r[1] for r in json.load(f)["data"]["rows"]}

stores = {}
with open(store_csv, encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        stores[row["상점ID"]] = row

zone_stores = defaultdict(set)
for r in rows:
    zone_stores[str(r[1])].add(str(r[0]))

with open(out_csv, "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["구", "상점ID", "상점명", "관제지점코드", "할증ID", "할증명", "할증유형", "대상",
                "판가할증액", "원가할증액", "시작일", "종료일", "프렌즈적용",
                "권역내_적용상점수", "전체_적용상점수", "권역내_적용상점ID"])
    for r in rows:
        sid, fid = str(r[0]), str(r[1])
        st = stores.get(sid, {})
        ids = ";".join(sorted(zone_stores[fid], key=int))
        w.writerow([st.get("구", ""), sid, st.get("상점명", ""), st.get("관제지점코드", ""),
                    fid, r[2], r[3], r[4], r[5], r[6], r[7] or "", r[8] or "", r[9],
                    len(zone_stores[fid]), total_cnt.get(fid, ""), ids])

print(f"saved {out_csv}: {len(rows)} rows, {len(zone_stores)} unique fees")
