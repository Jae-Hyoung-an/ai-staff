-- D3. CM 트렌드 (일/주, 벤더세트/프렌즈 + 전체) — Line 2장 (CMR% / 건당 평균 CM). 완료건 기준.
-- CM = 판가(STORE_BILLABLE_FEE÷1.1) − 기사원가(AGENT_FEE + AGENT_EXTRA_FEE)
-- CMR = Σ CM ÷ Σ 판가 × 100. 관리비·관제비 미포함, 벤더 실원가(주간 세트 정산)는 논의 중이라 기사원가 잠정 사용.
WITH va AS (
  SELECT TO_NUMBER(a.AGENT_ID) AS agent_id
  FROM VROONG.RAW_VENDORSET.VENDOR_AGENTS a
  JOIN VROONG.RAW_VENDORSET.VENDORS v ON a.VENDOR_ID = v.ID
   AND v.BUSINESS_NAME NOT ILIKE '%QA%' AND v.BUSINESS_NAME NOT ILIKE '%테스트%' AND v.BUSINESS_NAME NOT ILIKE '%test%'
  WHERE a.IS_DELETED = '0'
  QUALIFY ROW_NUMBER() OVER (PARTITION BY a.AGENT_ID ORDER BY a.ACTIVATED_AT DESC NULLS LAST) = 1
),
base AS (
  SELECT
    DATE_TRUNC({{granularity}}, o.CREATED_AT) AS bkt,
    CASE WHEN va.agent_id IS NOT NULL THEN '벤더세트'
         WHEN o.IS_VROONG_FRIENDS_ORDER THEN '프렌즈'
         ELSE '기타' END AS performer,
    o.STORE_BILLABLE_FEE / 1.1 AS price,
    COALESCE(o.AGENT_FEE, 0) + COALESCE(o.AGENT_EXTRA_FEE, 0) AS cost
  FROM VROONG.DATAMART.ORDERS o
  JOIN VROONG.RAW_SALESMANAGEMENT.ZONES z
    ON TO_VARCHAR(o.MONITORING_PARTNER_ID) = z.EXTERNAL_PARTNER_ID AND z.IS_ACTIVE = '1'
  LEFT JOIN va ON o.AGENT_ID = va.agent_id
  WHERE o.ORDER_STATUS = '배달완료'
    AND z.ZONE_NAME NOT ILIKE '%QA%' AND z.ZONE_NAME NOT ILIKE '%테스트%' AND z.ZONE_NAME NOT ILIKE '%test%'
    [[AND z.ZONE_NAME = {{zone}}]]
    [[AND o.CREATED_AT >= {{start_date}}]]
    [[AND o.CREATED_AT < DATEADD(day, 1, {{end_date}})]]
)
SELECT bkt AS "기간", performer AS "수행유형",
       ROUND((SUM(price) - SUM(cost)) / NULLIF(SUM(price), 0) * 100, 1) AS "CMR",
       ROUND(AVG(price - cost), 0) AS "건당평균CM"
FROM base WHERE performer IN ('벤더세트','프렌즈') GROUP BY 1, 2
UNION ALL
SELECT bkt, '전체', ROUND((SUM(price) - SUM(cost)) / NULLIF(SUM(price), 0) * 100, 1), ROUND(AVG(price - cost), 0)
FROM base GROUP BY 1
ORDER BY 1, 2
