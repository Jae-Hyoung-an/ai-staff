import sys
from math import radians, cos, sin, asin, sqrt

sys.stdout.reconfigure(encoding='utf-8')

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return 2 * R * asin(sqrt(a))

stores = [
    (48734, '상봉동', 37.593551, 127.075380, 8, 7, 6, 21),
    (253736, '면목동', 37.589968, 127.073148, 1, 2, 4, 7),
    (255821, '상봉동', 37.595683, 127.083936, 0, 3, 2, 5),
    (254290, '상봉동', 37.595630, 127.086037, 1, 1, 0, 2),
    (253233, '상봉동', 37.596648, 127.088203, 1, 0, 1, 2),
]

anchor = stores[0]
print("=== New Option A ===")
t11 = t12 = t13 = ttotal = 0
for s in stores:
    d = haversine(anchor[2], anchor[3], s[2], s[3])
    t11 += s[4]; t12 += s[5]; t13 += s[6]; ttotal += s[7]
    print(f"{s[0]} | {s[1]} | {s[2]} | {s[3]} | h11={s[4]} h12={s[5]} h13={s[6]} | total={s[7]} | dist={d:.2f}km")
print(f"합계: h11={t11} h12={t12} h13={t13} total={ttotal}")

print("\n=== Distance Matrix ===")
for i, s1 in enumerate(stores):
    for j, s2 in enumerate(stores):
        if j > i:
            d = haversine(s1[2], s1[3], s2[2], s2[3])
            print(f"{s1[0]} <-> {s2[0]}: {d:.2f}km")
