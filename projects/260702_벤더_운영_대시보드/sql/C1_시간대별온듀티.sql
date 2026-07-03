-- C1+C2. 시간대별 온듀티 기사 (벤더 DP-S / 프렌즈전환 DP-F) — Area(Stacked)/Line
-- audit_events 이벤트 리플레이. 세션 종료 이벤트 없는 기사는 18시간 캡. 테스트/미매핑 기사 제외(inner join amap).
WITH ev AS (
  SELECT
    TO_NUMBER(PARSE_JSON(PAYLOAD):agent_id) AS agent_id,
    OCCURRED_AT AS ts,
    CASE WHEN EVENT_TYPE='DEACTIVATED' THEN 'OFF' ELSE PARSE_JSON(PAYLOAD):new_mode::string END AS mode
  FROM VROONG.RAW_VENDORSET.AUDIT_EVENTS
  WHERE AGGREGATE_TYPE='VENDOR_AGENT' AND EVENT_TYPE IN ('ACTIVATED','DEACTIVATED','MODE_CHANGED')
),
state AS (
  SELECT
    agent_id, ts AS start_at,
    COALESCE(LEAD(ts) OVER (PARTITION BY agent_id ORDER BY ts), DATEADD(hour, 18, ts)) AS end_eff,
    mode
  FROM ev
),
amap AS (   -- 기사 → 벤더 → zone (현재 매핑, 테스트 제외)
  SELECT TO_NUMBER(va.AGENT_ID) AS agent_id, z.ZONE_NAME
  FROM VROONG.RAW_VENDORSET.VENDOR_AGENTS va
  JOIN VROONG.RAW_VENDORSET.VENDORS v ON va.VENDOR_ID = v.ID
   AND v.BUSINESS_NAME NOT ILIKE '%QA%' AND v.BUSINESS_NAME NOT ILIKE '%테스트%' AND v.BUSINESS_NAME NOT ILIKE '%test%'
  LEFT JOIN VROONG.RAW_SALESMANAGEMENT.ZONES z ON v.ZONE_UUID = z.UUID
  WHERE va.IS_DELETED = '0'
  QUALIFY ROW_NUMBER() OVER (PARTITION BY va.AGENT_ID ORDER BY va.ACTIVATED_AT DESC NULLS LAST) = 1
),
hours AS (   -- 최근 14일 시간축 (필요 시 조정)
  SELECT DATEADD(hour, ROW_NUMBER() OVER (ORDER BY SEQ4()) - 1,
                 DATE_TRUNC('hour', DATEADD(day, -14, CURRENT_TIMESTAMP))) AS hr
  FROM TABLE(GENERATOR(ROWCOUNT => 336))
)
SELECT
  h.hr AS "시각",
  CASE s.mode WHEN 'SET' THEN '벤더(DP-S)' WHEN 'FRIENDS' THEN '프렌즈전환(DP-F)' END AS "모드",
  COUNT(DISTINCT s.agent_id) AS "온듀티기사수"
FROM hours h
JOIN state s ON s.start_at <= h.hr AND s.end_eff > h.hr AND s.mode <> 'OFF'
JOIN amap a ON s.agent_id = a.agent_id
WHERE 1=1
  [[AND a.ZONE_NAME = {{zone}}]]
GROUP BY 1, 2
ORDER BY 1, 2
