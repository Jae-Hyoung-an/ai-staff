-- D2. 기사원가 트렌드 (일/주, 벤더세트/프렌즈 + 전체) — Line 2장 (총액 / 오더당 평균). 완료건 기준.
-- 원가 = AGENT_FEE + AGENT_EXTRA_FEE (기사 지급분만, VAT 미포함 금액 확인 완료).
-- ⚠️ 벤더세트 실원가는 주간 세트 정산 기준이라 기사원가와 다를 수 있음 (벤더 원가 정의는 논의 중, 잠정으로 기사원가 사용).
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
       ROUND(SUM(cost), 0) AS "원가총액",
       ROUND(AVG(cost), 0) AS "오더당평균원가"
FROM base WHERE performer IN ('벤더세트','프렌즈') GROUP BY 1, 2
UNION ALL
SELECT bkt, '전체', ROUND(SUM(cost), 0), ROUND(AVG(cost), 0)
FROM base GROUP BY 1
ORDER BY 1, 2
