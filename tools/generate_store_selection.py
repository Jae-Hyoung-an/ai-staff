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

# ========== Option A ==========
opt_a_ids = [
    (48734, 37.593551, 127.075380),
    (253736, 37.589968, 127.073148),
    (255821, 37.595683, 127.083936),
    (252667, 37.587949, 127.087621),
    (95551, 37.602089, 127.079718),
]

print('=== OPTION A FINAL ===')
a_total = {'h11': 0, 'h12': 0, 'h13': 0, 'total': 0}
for sid, lat, lng in opt_a_ids:
    for e in rows:
        if e['store_id'] == sid and abs(e['lat'] - lat) < 0.001 and abs(e['lng'] - lng) < 0.001:
            d = haversine(37.593551, 127.075380, e['lat'], e['lng'])
            print(f"{e['store_id']}|{e['dong']}|{e['lat']}|{e['lng']}|{e['h11']}|{e['h12']}|{e['h13']}|{e['total']}|{d:.2f}")
            a_total['h11'] += e['h11']
            a_total['h12'] += e['h12']
            a_total['h13'] += e['h13']
            a_total['total'] += e['total']
            break
print(f"합계|||||{a_total['h11']}|{a_total['h12']}|{a_total['h13']}|{a_total['total']}")

# ========== Option B ==========
c = (37.596, 127.086)
print('\n=== OPTION B FINAL ===')
b_stores = []
for e in rows:
    d = haversine(c[0], c[1], e['lat'], e['lng'])
    if d <= 1.0 and not (e['store_id'] == 48734 and abs(e['lat'] - 37.593551) < 0.001):
        b_stores.append({**e, 'dist': round(d, 2)})
b_stores.sort(key=lambda x: x['dist'])

b_total = {'h11': 0, 'h12': 0, 'h13': 0, 'total': 0}
for s in b_stores:
    print(f"{s['store_id']}|{s['dong']}|{s['lat']}|{s['lng']}|{s['h11']}|{s['h12']}|{s['h13']}|{s['total']}|{s['dist']}")
    b_total['h11'] += s['h11']
    b_total['h12'] += s['h12']
    b_total['h13'] += s['h13']
    b_total['total'] += s['total']
print(f"합계|{len(b_stores)}개||||{b_total['h11']}|{b_total['h12']}|{b_total['h13']}|{b_total['total']}")

# ========== Option B Zone Assignment ==========
print('\n=== OPTION B ZONE ANALYSIS ===')
zones = {'Z1': [], 'Z2': [], 'Z3': []}
for s in b_stores:
    if s['dist'] < 0.35:
        zone = 'Z1'
    elif s['lng'] < 127.084:
        zone = 'Z2'
    else:
        zone = 'Z3'
    zones[zone].append(s)
    print(f"{zone}|{s['store_id']}|{s['dong']}|{s['total']}|{s['dist']}")

print('\n=== ZONE SUMMARY ===')
for zname, zstores in zones.items():
    zt = sum(s['total'] for s in zstores)
    zh11 = sum(s['h11'] for s in zstores)
    zh12 = sum(s['h12'] for s in zstores)
    zh13 = sum(s['h13'] for s in zstores)
    print(f"{zname}|{len(zstores)}개|h11={zh11}|h12={zh12}|h13={zh13}|합계={zt}")

# ========== Option A Zone Assignment ==========
print('\n=== OPTION A ZONE ANALYSIS ===')
a_center = (37.593551, 127.075380)
a_zones = {'1조': [], '2조': [], '3조': []}
for sid, lat, lng in opt_a_ids:
    for e in rows:
        if e['store_id'] == sid and abs(e['lat'] - lat) < 0.001 and abs(e['lng'] - lng) < 0.001:
            if sid == 48734:
                a_zones['1조'].append(e)
                a_zones['2조'].append(e)
            elif sid in (253736, 255821):
                a_zones['2조'].append(e)
            else:
                a_zones['3조'].append(e)
            break

print("1조: store 48734 전담 (주력)")
print("2조: store 48734 보조 + 253736 + 255821")
print("3조: store 252667 + 95551 + 유동 지원")
