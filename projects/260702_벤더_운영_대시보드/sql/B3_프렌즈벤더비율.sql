-- B3. 프렌즈 vs 벤더 수행 비율 트렌드 (일/주) — Bar(Stack 100%). 권역 기준, CREATED_AT 시점.
-- 분모 = 완료건(배달완료). 미배차는 자동 제외됨(전부 취소 상태로 검증, 2026-07-09).
-- 벤더세트=수행기사가 현재 벤더세트 소속 / 프렌즈=그 외 프렌즈오더 / 기타=일반기사 수행(정합성 경보용, 평시 ~0%).
WITH va AS (
  SELECT TO_NUMBER(a.AGENT_ID) AS agent_id
  FROM VROONG.RAW_VENDORSET.VENDOR_AGENTS a
  JOIN VROONG.RAW_VENDORSET.VENDORS v ON a.VENDOR_ID = v.ID
   AND v.BUSINESS_NAME NOT ILIKE '%QA%' AND v.BUSINESS_NAME NOT ILIKE '%테스트%' AND v.BUSINESS_NAME NOT ILIKE '%test%'
  WHERE a.IS_DELETED = '0'
  QUALIFY ROW_NUMBER() OVER (PARTITION BY a.AGENT_ID ORDER BY a.ACTIVATED_AT DESC NULLS LAST) = 1
)
SELECT
  DATE_TRUNC({{granularity}}, o.CREATED_AT) AS "기간",
  CASE WHEN va.agent_id IS NOT NULL THEN '벤더세트'
       WHEN o.IS_VROONG_FRIENDS_ORDER THEN '프렌즈'
       ELSE '기타' END AS "수행유형",
  COUNT(*) AS "건수"
FROM VROONG.DATAMART.ORDERS o
JOIN VROONG.RAW_SALESMANAGEMENT.ZONES z
  ON TO_VARCHAR(o.MONITORING_PARTNER_ID) = z.EXTERNAL_PARTNER_ID AND z.IS_ACTIVE = '1'
LEFT JOIN va ON o.AGENT_ID = va.agent_id
WHERE o.ORDER_STATUS = '배달완료'
  AND z.ZONE_NAME NOT ILIKE '%QA%' AND z.ZONE_NAME NOT ILIKE '%테스트%' AND z.ZONE_NAME NOT ILIKE '%test%'
  [[AND z.ZONE_NAME = {{zone}}]]
  [[AND o.CREATED_AT >= {{start_date}}]]
  [[AND o.CREATED_AT < DATEADD(day, 1, {{end_date}})]]
GROUP BY 1, 2
ORDER BY 1, 2
