# 상용(라이브) vs 스냅샷(7/20) 상점별 할증 매핑 비교
import csv
import json
import sys
from collections import defaultdict

live_json_path = sys.argv[1]
snap_csv = "projects/260720_성북성동_b존_전환/3-3_상점별_적용할증_목록.csv"
out_dir = "projects/260720_성북성동_b존_전환"
TODAY = "2026-07-21"

with open(live_json_path, encoding="utf-8") as f:
    rows = json.load(f)["data"]["rows"]

live = {}
for r in rows:
    key = (str(r[0]), str(r[1]))
    live[key] = {
        "store_id": str(r[0]), "fee_id": str(r[1]), "title": r[2], "type": r[3],
        "target": r[4], "sell": str(r[5]), "cost": str(r[6]),
        "start": r[7] or "", "end": r[8] or "",
    }

snap = {}
with open(snap_csv, encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        snap[(row["상점ID"], row["할증ID"])] = row

removed, expired, added, changed, remained = [], [], [], [], []
for k, s in snap.items():
    if k in live:
        l = live[k]
        if s["원가할증액"] != l["cost"] or s["판가할증액"] != l["sell"]:
            changed.append((s, l))
        else:
            remained.append(s)
    else:
        if s["종료일"] and s["종료일"] < TODAY:
            expired.append(s)
        else:
            removed.append(s)
added = [live[k] for k in live if k not in snap]

print(f"스냅샷(7/20 유효): {len(snap)}건 / 라이브(7/21): {len(live)}건")
print(f"매핑 해제: {len(removed)} / 자연만료: {len(expired)} / 신규: {len(added)} / 금액변경: {len(changed)} / 유지: {len(remained)}")

with open(f"{out_dir}/3-3_변경비교_상세_20260721.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["변경구분", "상점ID", "상점명", "할증ID", "할증명", "할증유형", "판가(전→후)", "원가(전→후)", "종료일"])
    for s in removed:
        w.writerow(["매핑해제", s["상점ID"], s["상점명"], s["할증ID"], s["할증명"], s["할증유형"], s["판가할증액"], s["원가할증액"], s["종료일"]])
    for s in expired:
        w.writerow(["자연만료", s["상점ID"], s["상점명"], s["할증ID"], s["할증명"], s["할증유형"], s["판가할증액"], s["원가할증액"], s["종료일"]])
    for l in added:
        nm = ""
        w.writerow(["신규매핑", l["store_id"], nm, l["fee_id"], l["title"], l["type"], l["sell"], l["cost"], l["end"][:10]])
    for s, l in changed:
        w.writerow(["금액변경", s["상점ID"], s["상점명"], s["할증ID"], s["할증명"], s["할증유형"], f'{s["판가할증액"]}→{l["sell"]}', f'{s["원가할증액"]}→{l["cost"]}', s["종료일"]])

# 요약 리포트 (그룹별)
lines = []


def group_summary(title, items, key_fee=lambda x: x["할증ID"], name=lambda x: x["할증명"], extra=lambda x: ""):
    lines.append(f"\n## {title} ({len(items)}건)")
    g = defaultdict(list)
    for it in items:
        g[key_fee(it)].append(it)
    for fid, its in sorted(g.items(), key=lambda kv: -len(kv[1])):
        lines.append(f"- #{fid} {name(its[0])} : {len(its)}건{extra(its[0])}")


group_summary("매핑 해제 (스냅샷에 있었으나 라이브에서 사라짐)", removed)
group_summary("자연 만료 (종료일 경과, 작업 아님)", expired)
group_summary("신규 매핑", added, key_fee=lambda x: x["fee_id"], name=lambda x: x["title"],
              extra=lambda x: f" (판가={x['sell']}, 원가={x['cost']}, 종료={x['end'][:10] or '상시'})")
lines.append(f"\n## 금액 변경 ({len(changed)}건)")
for s, l in changed:
    lines.append(f"- #{s['할증ID']} {s['할증명']} @상점{s['상점ID']}: 판가 {s['판가할증액']}→{l['sell']}, 원가 {s['원가할증액']}→{l['cost']}")
group_summary("유지 (미변경 잔여 매핑)", remained)

with open(f"{out_dir}/3-3_변경비교_리포트_20260721.md", "w", encoding="utf-8") as f:
    f.write("# 3-3 할증 변경 진행 현황 (상용 vs 7/20 스냅샷)\n")
    from datetime import datetime
    f.write(f"\n- 기준: 라이브 Prime DB 조회 {datetime.now():%Y-%m-%d %H:%M}경, 스냅샷 2026-07-20\n")
    f.write(f"- 스냅샷 {len(snap)}건 → 라이브 {len(live)}건\n")
    f.write(f"- 매핑 해제 {len(removed)} / 자연만료 {len(expired)} / 신규 {len(added)} / 금액변경 {len(changed)} / 유지 {len(remained)}\n")
    f.write("\n".join(lines))
print("saved: 3-3_변경비교_상세_20260721.csv, 3-3_변경비교_리포트_20260721.md")
