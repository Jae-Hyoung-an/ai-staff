# heatmap-builder

## 한 줄 설명
상점 위치/주문수 CSV를 받아, 지도를 확대·이동하며 볼 수 있는 **인터랙티브 오더 히트맵(단일 HTML)** 을 만드는 도구입니다.

## 무엇을 해주나요
- CSV의 위경도·주문수를 읽어 주문 밀집 지역을 색으로 보여주는 히트맵을 생성합니다.
- 행정동 경계와 자치구(구) 경계를 공개 데이터에서 자동으로 받아 데이터가 있는 영역만 잘라 넣습니다.
- 결과는 **HTML 파일 하나**로, 인터넷만 연결되어 있으면 더블클릭으로 바로 열립니다. (별도 서버 불필요)

## 입력 CSV 형식
컬럼명은 한글 헤더 기준입니다. 인코딩은 `cp949`(엑셀 기본) / `utf-8` 모두 자동 인식합니다.

| 컬럼 | 설명 | 예시 |
|------|------|------|
| 위도 | 위도(WGS84) | 37.6131654 |
| 경도 | 경도(WGS84) | 127.0767934 |
| 상호명 | 상점 이름 | 금용각 |
| 가게배달유무 | Y/N | Y |
| 최근주문수 | 최근 주문 건수 | 45000 |

## 사용 방법

```powershell
# 1) (최초 1회) 의존성 설치
pip install -r tools/heatmap_builder/requirements.txt

# 2) 실행 (기본값: 다운로드 폴더의 성북구_데이터.csv → projects/260617_.../index.html)
python tools/heatmap_builder/build_heatmap.py

# 3) 다른 CSV / 다른 위치로 만들기
python tools/heatmap_builder/build_heatmap.py --csv "C:\경로\데이터.csv" --out "C:\경로\map.html" --title "강남구 오더 히트맵"
```

## 결과 화면에서 할 수 있는 것 (우측 상단 패널)
- **히트맵 강도 기준**: `최근주문수 가중`(주문 많은 곳일수록 진하게) ↔ `상점 밀도(균등)`
- **표시 대상**: `전체 상점` ↔ `가게배달 Y만`
- **경계 표시**: `행정동 경계` on/off, `자치구(구) 경계` on/off
- **상점 위치 점 표시**: 개별 상점을 점으로 표시(클릭 시 상호명·주문수 팝업)

## 데이터 출처
- 행정동 경계: [vuski/admdongkor](https://github.com/vuski/admdongkor) (통계청 기반, EPSG:4326)
- 자치구 경계: [southkorea/seoul-maps](https://github.com/southkorea/seoul-maps)
- 다운로드한 경계 원본은 `tools/heatmap_builder/.cache/` 에 캐시됩니다(재실행 시 빠름).

## 주의사항
- 지도 타일(CartoDB)과 Leaflet 라이브러리를 CDN에서 불러오므로 **인터넷 연결**이 필요합니다.
- 법정동 경계는 무료로 바로 받을 수 있는 GeoJSON이 없어 기본 제공하지 않습니다. 필요 시 법정동 GeoJSON을 확보해 `GU_URL`처럼 소스를 추가하면 동일 방식으로 토글을 늘릴 수 있습니다.
- 경계는 데이터 영역(bbox)에 걸치는 것만 포함하므로, 인접 자치구 일부 경계가 함께 보일 수 있습니다(맥락 파악용).
