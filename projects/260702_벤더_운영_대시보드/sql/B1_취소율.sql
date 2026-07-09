-- B1. 취소율 트렌드 (일/주, 물량타입 3분류 + 전체) — Line. 권역 기준, CREATED_AT 시점.
-- 취소건 절대량 카드는 제거(2026-07-09). 필요 시 KPI 줄에 취소건 스코어카드 추가.
WITH base AS (
  SELECT
    DATE_TRUNC({{granularity}}, o.CREATED_AT) AS bkt,
    CASE
      WHEN s.SALES_TYPE='직영센터' THEN 'G4'
      WHEN s.MANAGEMENT_TYPE='요기요OD' THEN 'OD'
      WHEN s.MANAGEMENT_TYPE='메쉬프라임' THEN '법인'
      WHEN s.MANAGEMENT_TYPE='로컬세일즈' THEN '로컬'
      ELSE '기타'
    END AS vol_type,
    o.ORDER_STATUS AS status
  FROM VROONG.DATAMART.ORDERS o
  JOIN VROONG.RAW_SALESMANAGEMENT.ZONES z
    ON TO_VARCHAR(o.MONITORING_PARTNER_ID) = z.EXTERNAL_PARTNER_ID AND z.IS_ACTIVE = '1'
  LEFT JOIN VROONG.DATAMART.STORES s ON o.STORE_ID = s.STORE_ID
  WHERE z.ZONE_NAME NOT ILIKE '%QA%' AND z.ZONE_NAME NOT ILIKE '%테스트%' AND z.ZONE_NAME NOT ILIKE '%test%'
    [[AND z.ZONE_NAME = {{zone}}]]
    [[AND o.CREATED_AT >= {{start_date}}]]
    [[AND o.CREATED_AT < DATEADD(day, 1, {{end_date}})]]
)
SELECT bkt AS "기간", vol_type AS "물량타입",
       ROUND(COUNT_IF(status='취소') / NULLIF(COUNT(*), 0) * 100, 2) AS "취소율"
FROM base WHERE vol_type IN ('법인','OD','G4') GROUP BY 1, 2
UNION ALL
SELECT bkt, '전체', ROUND(COUNT_IF(status='취소') / NULLIF(COUNT(*), 0) * 100, 2)
FROM base GROUP BY 1
ORDER BY 1, 2
