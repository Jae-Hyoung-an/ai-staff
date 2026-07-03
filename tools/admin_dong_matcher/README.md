# admin_dong_matcher

## 한 줄 설명

상점 위경도 좌표를 **행정동 경계 폴리곤과 대조(point-in-polygon)**하여 각 상점이 실제로 어느 행정동에 속하는지 판별하는 도구. 주소의 행정동/법정동 텍스트 컬럼이 비어있거나 표기가 달라도 좌표만으로 정확히 분류한다.

## 왜 필요한가

- 상점 주소의 동(洞) 컬럼은 결측이 많고(예: ~50%), 법정동/행정동 표기가 섞여 있어 동 이름으로 필터하면 누락이 크다.
- 좌표 + 공식 행정동 경계로 대조하면 표기 문제 없이 정확하게 권역 내 상점을 추린다.

## 사용 방법

1. **행정동 경계 GeoJSON** 준비 (`data/HangJeongDong_ver*.geojson`)
   - 출처: https://github.com/vuski/admdongkor (최신 `verYYYYMMDD` 폴더)
   - 다운로드 예:
     ```powershell
     curl.exe -s -o "data/HangJeongDong_ver20260401.geojson" "https://raw.githubusercontent.com/vuski/admdongkor/master/ver20260401/HangJeongDong_ver20260401.geojson"
     ```
2. **상점 좌표** 준비 (`data/stores_*.json`)
   - Metabase `execute_query` 결과 JSON. `data.rows` = `[STORE_ID, LAT, LNG]`.
3. **대조 실행**
   ```powershell
   python tools/admin_dong_matcher/match.py
   ```
   - `match.py` 상단 `TARGET_SGG`(대상 구), `TARGET_DONGS`(권역 행정동) 수정해서 사용.
   - 출력: `output/matched_stores.csv`(store_id, sgg, admin_dong), `output/match_summary.csv`, `output/matched_store_ids.txt`
4. **(선택) 오더 결합**
   - Metabase에서 상점×월 오더 집계를 `data/orders_by_store_month.json`으로 저장 후:
     ```powershell
     python tools/admin_dong_matcher/finalize.py
     ```
   - 출력: `output/final_result.csv` (store_id, store_name, sgg, admin_dong, last_order_at, order_cnt_3m)

## 의존성

```powershell
pip install shapely
```

## 주의사항

- 상점 위경도 정확도에 의존(좌표 오기재 시 오분류 가능).
- Metabase `execute_query`는 기본 2,000행 제한이 있으므로, 큰 결과는 상점×월 등으로 행수를 줄이거나 구별로 나눠 추출할 것.
- 행정동 경계는 시점별로 바뀌므로, 분석 기준 시점에 맞는 `ver` 사용 권장.
