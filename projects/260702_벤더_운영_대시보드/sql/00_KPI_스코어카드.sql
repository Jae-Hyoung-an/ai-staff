-- KPI 스코어카드 (Number). 권역(관제지점) 기준 = 해당 권역의 총 오더(수행주체 무관).
-- 시간 기준: CREATED_AT(상점이 오더를 넣은 시점). SUBMITTED_AT은 미배정 시 전체공개 전환 시점이므로 사용 금지.
-- 40분 완료율 = 생성→배달완료 40분 이내 (상점 체감 SLA).
-- 스코어카드 4개는 이 쿼리를 복제해 카드별 컬럼 1개만 남긴다.
SELECT
  COUNT(*) AS "총물량",
  ROUND(COUNT_IF(o.ORDER_STATUS='취소') / NULLIF(COUNT(*),0) * 100, 2) AS "취소율",
  ROUND(COUNT_IF(o.ORDER_STATUS='배달완료' AND DATEDIFF('second', o.CREATED_AT, o.DELIVERED_AT) <= 2400)
        / NULLIF(COUNT_IF(o.ORDER_STATUS='배달완료'),0) * 100, 1) AS "완료율_40분",
  MAX(o.PARTITIONAL_DATE) AS "데이터기준일"
FROM VROONG.DATAMART.ORDERS o
JOIN VROONG.RAW_SALESMANAGEMENT.ZONES z
  ON TO_VARCHAR(o.MONITORING_PARTNER_ID) = z.EXTERNAL_PARTNER_ID AND z.IS_ACTIVE = '1'
WHERE z.ZONE_NAME NOT ILIKE '%QA%' AND z.ZONE_NAME NOT ILIKE '%테스트%' AND z.ZONE_NAME NOT ILIKE '%test%'
  [[AND z.ZONE_NAME = {{zone}}]]
  [[AND o.CREATED_AT >= {{start_date}}]]
  [[AND o.CREATED_AT < DATEADD(day, 1, {{end_date}})]]
