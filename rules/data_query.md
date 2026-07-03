# 데이터 조회 규칙

> 부릉 데이터를 Metabase MCP로 조회할 때 따르는 규칙.
> AI는 상점/지점/오더 관련 데이터를 조회할 때 이 문서를 우선 참조한다.

---

## 핵심 원칙

### 1. Snowflake 우선 (가장 중요)

데이터 처리는 **우선 Snowflake DB(`database_id=12`, `VROONG`)에 미러 혹은 정리된 테이블이 있는지 먼저 확인**하고 사용한다.

- 운영 DB(MySQL)에 직접 무거운 쿼리를 날리기 전에 Snowflake 미러/정리 테이블을 먼저 찾는다.
- 확인 순서:
  1. `VROONG.DATAMART.*` — 정리·가공된 테이블 (컬럼 주석 충실, 조인 편함) → **1순위**
  2. `VROONG.RAW_PRIME.*`, `VROONG.RAW_LASTMILE.*` 등 `RAW_*` — 원본 미러
  3. 위에 없을 때만 운영 DB 직접 조회
- 테이블 탐색: `SELECT TABLE_SCHEMA, TABLE_NAME, ROW_COUNT FROM INFORMATION_SCHEMA.TABLES WHERE LOWER(TABLE_NAME) LIKE '%키워드%'`

### 2. 상점(Store) 정보

- 원천: **Prime DB** (`database_id=3`, 테이블 `stores`)
- Snowflake 정리 테이블: **`VROONG.DATAMART.STORES`** (1순위)
  - `STORE_ID` (상점 ID/코드)
  - `STORE_NAME` (상점명), `REFINED_STORE_NAME` (관리용)
  - `MONITORING_PARTNER_ID` (관제 지점 ID, FK → lastmile Partner)
  - 그 외: 주소(SI_DO/SI_GUN_GU/EUP_MYEON_DONG), 위경도(LAT/LNG), 프랜차이즈, G채널, 요금제, 운영상태 등

### 3. 관제 지점(Monitoring Partner)

- **관제 지점 = `monitoring_partner_id`** (상점의 관제를 담당하는 지점)
- 추가 정보(지점명 등)는 **lastmile DB의 `partner` 테이블** 참조
- Snowflake 정리 테이블: **`VROONG.DATAMART.PARTNERS`** (1순위)
  - `PARTNER_ID` (숫자 ID, stores.MONITORING_PARTNER_ID와 조인)
  - `PARTNER_NAME` (지점명)
  - `PARTNER_NUMBER` (지점코드, `p`로 시작. 예: `p626A`. 사용자가 `p`코드 언급 시 이 컬럼으로 검색, 코드 전체 사용)
  - `PARTNER_TYPE`(라스트마일/풀필먼트/부릉프렌즈/직영라이더), `OPERATION_TYPE`(위탁/제휴/직영 등)

---

## 표준 조회 패턴

### store_id 목록 → 상점명 + 관제 지점

```sql
SELECT
    s.STORE_ID,
    s.STORE_NAME,
    s.MONITORING_PARTNER_ID,
    p.PARTNER_NAME   AS MONITORING_PARTNER_NAME,
    p.PARTNER_NUMBER AS MONITORING_PARTNER_NUMBER
FROM VROONG.DATAMART.STORES s
LEFT JOIN VROONG.DATAMART.PARTNERS p
       ON s.MONITORING_PARTNER_ID = p.PARTNER_ID
WHERE s.STORE_ID IN (...)
ORDER BY p.PARTNER_NAME, s.STORE_ID;
```

---

## Metabase 데이터베이스 ID 참고

| ID | 이름 | 엔진 | 용도 |
|----|------|------|------|
| 12 | Snowflake Admin | snowflake | **데이터 처리 1순위** (미러/정리 테이블) |
| 3 | (Mysql) Prime DB | mysql | 상점(stores) 원천 |
| 2 | (MySQL) lastmile | mysql | 오더(orders), partner 원천 |
| 6 | (MySQL) PointDB | mysql | 포인트/정산 |

---

## 주의사항

- `execute_query`(Metabase) 기본 2,000행 제한. 큰 결과는 집계·기간 분할로 행수 축소.
- Snowflake `STORE_ID`는 TEXT 타입이지만 숫자 `IN (...)`도 매칭됨.
- 운영 DB의 `partners`/`stores` 마스터가 단일 DB에 모두 있지 않으므로(상점=Prime, partner=lastmile), 크로스 DB 조인이 필요할 땐 Snowflake 미러를 쓰는 것이 가장 간단하다.

---

## 벤더(세트) 운영 데이터 — `RAW_VENDORSET` (벤더 대시보드용)

> 벤더관리 시스템(NVP-B, 세트 운영)의 라이브 원천은 운영 MySQL `vendorset` DB.
> Metabase 커넥션에는 노출 안 되어 있어, **Snowflake 미러 `VROONG.RAW_VENDORSET.*`** 를 사용한다.
> 관련 PRD: `knowledge/2_planning/prd/벤더관리시스템/`

### 핵심 테이블

| 테이블 | 용도 | 주요 컬럼 |
|--------|------|----------|
| `VENDORS` | 벤더(사업자) 마스터 | `ID`, `BUSINESS_NAME`, `STATUS`, `ZONE_UUID` |
| `VENDOR_AGENTS` | 벤더-기사 매핑 + 출근/모드 상태 | `AGENT_ID`, `VENDOR_ID`, `STATUS`, `IS_ACTIVE`, `IS_SET_AGENT_ACTIVE`, `CURRENT_MODE`, `IS_DELETED`, `ACTIVATED_AT` |
| `VENDOR_ACTIVE_AGENT_COUNTERS` | 벤더별 현재 DP-S 활성 기사 수(카운터) | `VENDOR_ID`, `ACTIVE_COUNT` |
| `AGENT_INFO_CACHE` | 기사 정보 캐시(로그인ID/차량) | `AGENT_ID`, `USERNAME`, `VEHICLE_TYPE`, `CACHED_AT` — **AGENT_ID당 다중행** |
| `VENDOR_OPERATORS` | 벤더장(VO) | `AGENT_ID`, `VENDOR_ID`, `STATUS` |
| `VENDOR_SET_ALLOCATIONS` | 세트 할당 | - |
| `OPERATION_POLICY_*` | 권역/슬롯/시간대 운영정책 | - |
| `ORDER_ASSIGNMENT_RECORDS`, `DISPATCH_OFFER_RECORDS` | 배차/제안 기록(수락률·B/O용) | - |

### 상태 코드 (미러는 전부 TEXT → `'10'`처럼 문자열 비교)

- **벤더 상태 `VENDORS.STATUS`**: `10`=STANDBY(대기), `20`=ACTIVE(운영중), `30`=INACTIVE(운영중지), `40`=TERMINATED(해지)
- **매핑 상태 `VENDOR_AGENTS.STATUS`**: `10`=ACTIVE, `20`=INACTIVE
- **현재 모드 `VENDOR_AGENTS.CURRENT_MODE`**: `10`=DP-S(세트), `20`=DP-F(프렌즈), `NULL`=오프라인
- **`IS_ACTIVE`**: `1`=현재 출근중 / **`IS_SET_AGENT_ACTIVE`**: `1`=세트 참여 가능(VO 토글)

### "활성 벤더 기사" 정의 3단계 (혼동 주의)

| 정의 | 조건 | 의미 |
|------|------|------|
| ① 소속 활성 (등록 기사 풀) | `STATUS='10'` | 벤더에 등록된 전체 기사 |
| ② 현재 출근(로그인) | `STATUS='10' AND IS_ACTIVE='1'` | 세트+프렌즈전환 포함 |
| ③ **온듀티(세트수행중)** ✅ 표준 | `CURRENT_MODE='10'` | 실제 세트(DP-S) 뛰는 중 = 정산 대상 |

> **대시보드 "온듀티" 표준 = ③ (`CURRENT_MODE='10'`).** `CURRENT_MODE='10'`이면 출근+세트배정이 논리적으로 포함되므로 `STATUS`/`IS_ACTIVE` 조건 생략 가능.
> ② − ③ = 세트 슬롯 포화로 프렌즈(DP-F)로 밀린 인원 → 세트 부족 경보 지표로 활용 가능.

### 벤더 ↔ 존(Zone) 매핑

- `VENDORS.ZONE_UUID` → `VROONG.RAW_SALESMANAGEMENT.ZONES.UUID` 조인 → `ZONE_NAME`
- `ZONES.EXTERNAL_PARTNER_ID` → lastmile 지점(`DATAMART.PARTNERS.PARTNER_ID`) 연결 가능
- ⚠️ `ZONE_UUID`가 NULL인 ACTIVE 벤더(존 미매핑)는 오더 수행 불가 → 정합성 점검 대상

### 표준 쿼리 — 현재 온듀티 벤더 기사 (존 포함)

```sql
WITH latest_cache AS (  -- AGENT_INFO_CACHE는 시점별 다중행 → 기사별 최신 1건
    SELECT AGENT_ID, USERNAME, VEHICLE_TYPE
    FROM VROONG.RAW_VENDORSET.AGENT_INFO_CACHE
    QUALIFY ROW_NUMBER() OVER (PARTITION BY AGENT_ID ORDER BY CACHED_AT DESC) = 1
)
SELECT
    z.ZONE_NAME,
    v.BUSINESS_NAME AS VENDOR_NAME,
    va.AGENT_ID,
    ai.USERNAME,
    va.ACTIVATED_AT AS 최근_출근시각
FROM VROONG.RAW_VENDORSET.VENDOR_AGENTS va
JOIN VROONG.RAW_VENDORSET.VENDORS v
      ON va.VENDOR_ID = v.ID AND v.STATUS = '20'      -- ACTIVE 벤더
LEFT JOIN VROONG.RAW_SALESMANAGEMENT.ZONES z
      ON v.ZONE_UUID = z.UUID
LEFT JOIN latest_cache ai
      ON va.AGENT_ID = ai.AGENT_ID
WHERE va.IS_DELETED = '0'
  AND va.CURRENT_MODE = '10'                          -- 온듀티 = 세트(DP-S)
ORDER BY z.ZONE_NAME, v.BUSINESS_NAME, va.ACTIVATED_AT;
```

### 라이브 전환 시 주의 (미러 → 운영 `vendorset` MySQL)

1. 테이블명: `VROONG.RAW_VENDORSET.VENDOR_AGENTS` → `vendorset.vendor_agents` (소문자)
2. 비교값: 미러는 전부 TEXT라 `'10'`/`'1'` 문자열 비교 중 → 운영 MySQL은 int/tinyint이므로 `= 10`, `= 1` 로 변경
3. `QUALIFY` 미지원 → `ROW_NUMBER()` 서브쿼리로 래핑, 또는 실시간이면 `lastmile.Agent`에서 이름/차량 직접 조회
