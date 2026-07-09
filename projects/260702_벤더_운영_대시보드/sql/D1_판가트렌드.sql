-- D1. 판가 트렌드 (일/주, 물량타입 3분류 + 전체) — Line 2장 (총액 / 오더당 평균). 완료건 기준.
-- 판가 = STORE_BILLABLE_FEE ÷ 1.1 (VAT 10% 제외. billable = base + extra 합산 청구액)
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
    o.STORE_BILLABLE_FEE / 1.1 AS price
  FROM VROONG.DATAMART.ORDERS o
  JOIN VROONG.RAW_SALESMANAGEMENT.ZONES z
    ON TO_VARCHAR(o.MONITORING_PARTNER_ID) = z.EXTERNAL_PARTNER_ID AND z.IS_ACTIVE = '1'
  LEFT JOIN VROONG.DATAMART.STORES s ON o.STORE_ID = s.STORE_ID
  WHERE o.ORDER_STATUS = '배달완료'
    AND z.ZONE_NAME NOT ILIKE '%QA%' AND z.ZONE_NAME NOT ILIKE '%테스트%' AND z.ZONE_NAME NOT ILIKE '%test%'
    [[AND z.ZONE_NAME = {{zone}}]]
    [[AND o.CREATED_AT >= {{start_date}}]]
    [[AND o.CREATED_AT < DATEADD(day, 1, {{end_date}})]]
)
SELECT bkt AS "기간", vol_type AS "물량타입",
       ROUND(SUM(price), 0) AS "판가총액",
       ROUND(AVG(price), 0) AS "오더당평균판가"
FROM base WHERE vol_type IN ('법인','OD','G4') GROUP BY 1, 2
UNION ALL
SELECT bkt, '전체', ROUND(SUM(price), 0), ROUND(AVG(price), 0)
FROM base GROUP BY 1
ORDER BY 1, 2
