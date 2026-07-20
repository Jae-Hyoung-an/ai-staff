# 정릉동 상점 행정동 경계 검증 (ray casting point-in-polygon)
import json

stores = [
    ("197896", "[정릉동]큰집닭강정(배차후10분) 1층", 37.608568000059, 127.009767007609),
    ("233969", "(선택)파리바게뜨 정릉국민대점", 37.6078195907893, 126.999515052092),
    ("233970", "(선택)파리바게뜨 정릉서경점", 37.6103415131668, 127.014888358128),
    ("234049", "(선택)파리바게뜨 정릉대림점", 37.6002510241826, 127.018315403612),
    ("234050", "(선택)파리바게뜨 정릉풍림점", 37.616442424527, 127.009121176859),
    ("234051", "(선택)파리바게뜨 카페정릉점", 37.6083631669275, 127.010218295973),
    ("234054", "(선택)파리바게뜨 정릉제일점", 37.6032285064084, 127.017866208389),
    ("234117", "(선택)배스킨라빈스 정릉시장점", 37.6081729059815, 127.009889042894),
]

with open("projects/260720_성북성동_b존_전환/seoul_hangjeongdong.json", encoding="utf-8") as f:
    gj = json.load(f)


def point_in_ring(lng, lat, ring):
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > lat) != (yj > lat):
            x_cross = (xj - xi) * (lat - yi) / (yj - yi) + xi
            if lng < x_cross:
                inside = not inside
        j = i
    return inside


def point_in_geom(lng, lat, geom):
    if geom["type"] == "Polygon":
        polys = [geom["coordinates"]]
    else:
        polys = geom["coordinates"]
    for poly in polys:
        if point_in_ring(lng, lat, poly[0]):
            # 구멍(hole) 확인
            if not any(point_in_ring(lng, lat, hole) for hole in poly[1:]):
                return True
    return False


features = gj["features"]
print(f"전체 행정동 피처 수: {len(features)}")

for sid, name, lat, lng in stores:
    found = []
    for ft in features:
        if point_in_geom(lng, lat, ft["geometry"]):
            found.append(ft["properties"].get("name", "?"))
    print(f"{sid}\t{name}\t{lat},{lng}\t=> {', '.join(found) if found else '매칭 없음'}")
