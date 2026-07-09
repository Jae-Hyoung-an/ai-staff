-- A2. WoW 트렌드 — 전주 동기간 대비 증감률 (물량타입 3분류 + 전체) — Line
-- day: 일자별 전주 동요일 대비 / week: 주차별 전주 대비 (둘 다 7일 전 버킷과 비교)
-- 시간 기준: CREATED_AT(상점 주문 시점). 진행 중 버킷(오늘/이번주)은 부분 데이터라 제외.
-- 기간 필터: 조회·표시 범위를 버킷(일/주) 경계로 정렬. week에서 주 중간 날짜를 선택해도
--   시작/종료가 속한 주 전체 + 비교용 직전 주 전체를 조회하고, 표시는 선택 구간의 버킷만.
WITH base AS (
  SELECT
    DATE_TRUNC({{granularity}}, o.CREATED_AT) AS bkt,
    CASE
      WHEN s.SALES_TYPE='직영센터' THEN 'G4'
      WHEN s.MANAGEMENT_TYPE='요기요OD' THEN 'OD'
      WHEN s.MANAGEMENT_TYPE='메쉬프라임' THEN '법인'
      WHEN s.MANAGEMENT_TYPE='로컬세일즈' THEN '로컬'
      ELSE '기타'
    END AS vol_type
  FROM VROONG.DATAMART.ORDERS o
  JOIN VROONG.RAW_SALESMANAGEMENT.ZONES z
    ON TO_VARCHAR(o.MONITORING_PARTNER_ID) = z.EXTERNAL_PARTNER_ID AND z.IS_ACTIVE = '1'
  LEFT JOIN VROONG.DATAMART.STORES s ON o.STORE_ID = s.STORE_ID
  WHERE z.ZONE_NAME NOT ILIKE '%QA%' AND z.ZONE_NAME NOT ILIKE '%테스트%' AND z.ZONE_NAME NOT ILIKE '%test%'
    AND o.CREATED_AT < DATE_TRUNC({{granularity}}, CURRENT_DATE)   -- 진행 중 버킷 제외
    [[AND z.ZONE_NAME = {{zone}}]]
    [[AND o.CREATED_AT >= DATEADD(day, -7, DATE_TRUNC({{granularity}}, {{start_date}}::date))]]  -- 시작 버킷 경계 -7일 (전주 전체 포함)
    [[AND o.CREATED_AT < DATEADD(day, 7, DATE_TRUNC({{granularity}}, {{end_date}}::date))]]       -- 종료 버킷 전체 포함 (초과분은 표시에서 제외)
),
agg AS (
  SELECT bkt, vol_type, COUNT(*) AS cnt FROM base WHERE vol_type IN ('법인','OD','G4') GROUP BY 1, 2
  UNION ALL
  SELECT bkt, '전체', COUNT(*) FROM base GROUP BY 1
)
SELECT
  c.bkt AS "기간",
  c.vol_type AS "물량타입",
  c.cnt AS "물량",
  p.cnt AS "전주물량",
  ROUND((c.cnt - p.cnt) / NULLIF(p.cnt, 0) * 100, 1) AS "WoW_증감율"
FROM agg c
LEFT JOIN agg p ON p.vol_type = c.vol_type AND p.bkt = DATEADD(day, -7, c.bkt)
WHERE 1=1
  [[AND c.bkt >= DATE_TRUNC({{granularity}}, {{start_date}}::date)]]   -- 표시: 시작일이 속한 버킷부터
  [[AND c.bkt <= DATE_TRUNC({{granularity}}, {{end_date}}::date)]]     -- 표시: 종료일이 속한 버킷까지
ORDER BY 1, 2
