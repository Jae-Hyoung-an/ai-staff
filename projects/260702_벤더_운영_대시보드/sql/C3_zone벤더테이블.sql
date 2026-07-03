-- C3. Zone × 벤더 운영 테이블 — Table(조건부 서식: 완료율↓·거절률↑ 빨강)
-- 거절률(PRD SD2-5/6) = 거절건(적극거절20 + 만료30 + 수락후취소60) / 완료오더(DISPATCH_STATUS='20')
WITH oar AS (
  SELECT
    ZONE_UUID, VENDOR_ID,
    COUNT(*) AS "수행오더",
    COUNT_IF(DISPATCH_STATUS='30') AS "취소건",
    COUNT_IF(DISPATCH_STATUS='20') AS "완료오더",
    COUNT(DISTINCT CASE WHEN DISPATCH_STATUS='20'
          THEN WEEK_ANCHOR_DATE::string || '|' || DAY_OF_WEEK || '|' || SLOT_INDEX END) AS "달성세트수",
    ROUND(COUNT_IF(DISPATCH_STATUS='20' AND DATEDIFF('second', DISPATCHED_AT, COMPLETED_AT) <= 2400)
          / NULLIF(COUNT_IF(DISPATCH_STATUS='20'),0) * 100, 1) AS "완료율_40분"
  FROM VROONG.RAW_VENDORSET.ORDER_ASSIGNMENT_RECORDS
  WHERE 1=1
    [[AND DISPATCHED_AT >= {{start_date}}]]
    [[AND DISPATCHED_AT < DATEADD(day, 1, {{end_date}})]]
  GROUP BY 1, 2
),
rej AS (
  SELECT ZONE_UUID, VENDOR_ID, COUNT_IF(OUTCOME IN ('20','30','60')) AS "거절건"
  FROM VROONG.RAW_VENDORSET.DISPATCH_OFFER_RECORDS
  WHERE 1=1
    [[AND OFFERED_AT >= {{start_date}}]]
    [[AND OFFERED_AT < DATEADD(day, 1, {{end_date}})]]
  GROUP BY 1, 2
)
SELECT
  z.ZONE_NAME     AS "Zone",
  v.BUSINESS_NAME AS "벤더",
  oar."수행오더",
  oar."취소건",
  ROUND(rej."거절건" / NULLIF(oar."완료오더",0) * 100, 1) AS "거절률",
  oar."달성세트수",
  oar."완료율_40분"
FROM oar
LEFT JOIN rej ON oar.ZONE_UUID = rej.ZONE_UUID AND oar.VENDOR_ID = rej.VENDOR_ID
LEFT JOIN VROONG.RAW_VENDORSET.VENDORS v ON oar.VENDOR_ID = v.ID
LEFT JOIN VROONG.RAW_SALESMANAGEMENT.ZONES z ON oar.ZONE_UUID = z.UUID
WHERE v.BUSINESS_NAME NOT ILIKE '%QA%' AND v.BUSINESS_NAME NOT ILIKE '%테스트%' AND v.BUSINESS_NAME NOT ILIKE '%test%'
  [[AND z.ZONE_NAME = {{zone}}]]
ORDER BY oar."수행오더" DESC
