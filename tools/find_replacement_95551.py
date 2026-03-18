import pandas as pd
import sys
from math import radians, cos, sin, asin, sqrt

sys.stdout.reconfigure(encoding='utf-8')

df = pd.read_excel(r'c:\Users\jaehyoung.an\Downloads\store_orders.xlsx')
col_orders = 'order count'
col_lat = 'origin_address_latlng_latitude'
col_lng = 'origin_address_latlng_longitude'
col_dong = 'origin_address_eupmyundong'
col_hour = 'created hour'

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return 2 * R * asin(sqrt(a))

loc = df.groupby(['store_id', col_dong, col_lat, col_lng]).agg(
    total_orders=(col_orders, 'sum'),
).reset_index()

rows = []
for _, r in loc.iterrows():
    entry = {
        'store_id': int(r['store_id']),
        'dong': r[col_dong],
        'lat': round(r[col_lat], 6),
        'lng': round(r[col_lng], 6),
        'total': int(r['total_orders']),
    }
    for h in [11, 12, 13]:
        mask = (df['store_id'] == r['store_id']) & (df[col_lat] == r[col_lat]) & (df[col_lng] == r[col_lng]) & (df[col_hour] == h)
        entry[f'h{h}'] = int(df.loc[mask, col_orders].sum())
    rows.append(entry)

# Updated Option A: 252667 -> 254290
new_a = {48734, 253736, 255821, 254290, 95551}
anchor = (37.593551, 127.075380)

# Other stores in new Option A (excluding 95551)
other_stores = [
    (48734, 37.593551, 127.075380),
    (253736, 37.589968, 127.073148),
    (255821, 37.595683, 127.083936),
    (254290, 37.595630, 127.086037),
]

print("=== 95551 대체 후보 (2건 이상, 기준점 2km 이내) ===")
print(f"{'store_id':>8} | {'동':>6} | {'건수':>4} | {'기준점거리':>8} | 11시 | 12시 | 13시 | 기존상점과 최대거리")
print("-" * 95)

candidates = []
for e in rows:
    if e['store_id'] in new_a:
        continue
    if e['total'] < 2:
        continue
    d_anchor = haversine(anchor[0], anchor[1], e['lat'], e['lng'])
    if d_anchor > 2.0:
        continue
    max_d = max(
        haversine(lat, lng, e['lat'], e['lng'])
        for _, lat, lng in other_stores
    )
    candidates.append({**e, 'd_anchor': d_anchor, 'max_d': max_d})

candidates.sort(key=lambda x: (-x['total'], x['d_anchor']))

for c in candidates:
    print(f"{c['store_id']:>8} | {c['dong']:>6} | {c['total']:>3}건 | {c['d_anchor']:>6.2f}km | {c['h11']:>3}  | {c['h12']:>3}  | {c['h13']:>3}  | {c['max_d']:.2f}km")

print(f"\n참고: 제외 대상 store 95551 (중화동, 2건, 기준점 1.02km)")
print(f"현재 Option A: 48734(21건) + 253736(7건) + 255821(5건) + 254290(2건) = 35건")
