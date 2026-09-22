# MCP 레지스트리

> Cursor / Claude Desktop에서 쓰는 MCP(Model Context Protocol) 서버 목록.
> **시크릿(API 키·토큰)은 이 파일에 적지 않는다.** 로컬 설정 파일에만 보관한다.
> 마이그레이션 상세: `knowledge/handoff/20260806_Cursor_to_Claude_PC_마이그레이션.md`

---

## 로컬 설정 위치

| 앱 | 파일 |
|----|------|
| Cursor | `%USERPROFILE%\.cursor\mcp.json` |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` |
| Claude Desktop (MSIX) | `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` |

템플릿(시크릿 없음): `knowledge/handoff/templates/claude_desktop_mcp.template.json`

---

## 서버 목록

### metabase ⭐ 핵심

- **목적**: Snowflake/운영 DB 조회, Metabase 카드·대시보드
- **트리거**: 상점/지점/오더 조회, KPI 검증, 할증·원가 조사
- **유형**: stdio — `npx -y @cognitionai/metabase-mcp-server`
- **필요 env**: `METABASE_URL`, `METABASE_API_KEY`
- **규칙**: `rules/data_query.md` (Snowflake `database_id=12` 우선, 시간축=`CREATED_AT`)
- **주의**: 한글 컬럼 별칭은 `"따옴표"`, 결과 행 제한 있음

### Notion

- **목적**: 노션 페이지 검색·읽기·작성·댓글
- **트리거**: PRD 노션 동기화, 리뷰 페이지 업데이트
- **유형**: HTTP — `https://mcp.notion.com/mcp`
- **인증**: OAuth (헤더 비어 있어도 클라이언트 인증 플로우)
- **참고 URL**: 존/권역 리뷰 허브 등은 핸드오프 문서에 정리

### github

- **목적**: 이슈/PR/파일/릴리즈
- **트리거**: GitHub Pages 배포 확인, PR 생성, 코드 검색
- **유형**: HTTP — `https://api.githubcopilot.com/mcp/`
- **인증**: `Authorization` 헤더에 PAT(`ghp_...`). `Bearer` 접두어 없이 raw 토큰. (Cursor 기준)
- **⚠️ Claude Desktop/Cowork 주의**: 이 클라이언트의 config는 원격 HTTP 항목(`url`+`headers`)을 로드하지 않는다. **`mcp-remote` 브리지(stdio)로 감싸야 뜬다** (아래 "Claude Desktop config 로더 제약" 참고). 2026-08-12 이 방식으로 연결 확인(`get_me`).
- **주의**: PAT를 repo에 커밋하지 말 것. 유출 의심 시 즉시 rotate

### Gmail (Google)

- **목적**: 메일 검색·읽기·라벨·초안 작성
- **트리거**: 메일 확인, 회신 초안, 스레드 검색, 라벨 정리
- **유형**: 앱 커넥터(OAuth) — Claude 커넥터 디렉터리에서 연결
- **비고**: 2026-08-12 신규 연결. 발송·삭제 등 side-effect 액션은 사용자 승인 후

### Google Calendar

- **목적**: 일정 조회·생성·수정, 참석자 응답, 시간 제안
- **트리거**: 일정 확인, 미팅 준비, 회의실/가용시간 조회
- **유형**: 앱 커넥터(OAuth) — Claude 커넥터 디렉터리에서 연결
- **비고**: 2026-08-12 신규 연결. 본인 외 캘린더 다수 접근 가능(팀·회의실·공휴일)

### Atlassian-MCP-Server

- **목적**: Jira 이슈, Confluence 페이지
- **트리거**: 티켓 조회/생성, 컨플루언스 문서 검색
- **유형**: HTTP — `https://mcp.atlassian.com/v1/mcp`
- **인증**: OAuth

### Slack

- **목적**: 슬랙 메시지/채널 연동
- **트리거**: 팀 공지 초안, 스레드 검색 (사용 빈도 낮을 수 있음)
- **유형**: HTTP — Smithery Slack MCP
- **인증**: OAuth / Smithery

### 인트라 라이트 (VROONG intra-lite) ⭐ 실시간 조회

- **목적**: 인트라 실시간 데이터 조회 전용 — 오더 상태·타임라인, 기사, 지점, 상점, 관제 현황
- **트리거**: "이 오더 지금 상태", "관제 현황 몇 건", 기사코드·지점 필터 조회, 오더번호(`20260824235952#1203` 형식) 조회
- **유형**: 조직 MCP (`intra_lite` 단일 도구, `action`으로 기능 선택). 시작은 `action='capabilities'`
- **규칙**: 조회 전용. 수정·등록·발송은 `action='validate_change'`로 검증만 하고 웹 화면으로 안내. 집계·순위·추세는 Metabase(또는 #ask-vroong-data-agent). 403은 "현재 계정 권한 밖"
- **비고**: 8/6 문서의 "인트라 자동화는 Claude에서 불가"를 대체. Cursor Browser 의존 해소 (2026-09 확인)

### 도라에몽

- **목적**: 배송 실패 로그·접수 실패 원인·API 원문·취소 이력·연동사 조회
- **트리거**: "왜 접수가 안 됐지", "이 오더 배송 실패 로그", "연동사 조회"
- **유형**: 조직 MCP
- **규칙**: 창구 선택은 `vroong-data-routing` 스킬이 판단 (아래)

### context7 (선택)

- **목적**: 라이브러리·프레임워크 최신 문서 조회
- **트리거**: 도구/스크립트 개발 시 API 문서 확인
- **유형**: stdio — `npx -y @upstash/context7-mcp@latest`
- **비고**: PO 일상 업무 비중은 낮음

---

## Claude Desktop config 로더 제약 (2026-08-12 확인)

Claude Desktop/Cowork의 `claude_desktop_config.json` `mcpServers`는 **`command` 기반(stdio) 서버만 실제로 띄운다.** `url`+`headers`로 정의한 원격 HTTP 서버는 무시된다.

| 서버 유형 | config 로드 | 붙이는 법 |
|-----------|-------------|-----------|
| stdio (`command: npx ...`) | ✅ 로드됨 | config에 그대로 (예: metabase, context7) |
| 원격 HTTP (`url`+`headers`) | ❌ 무시됨 | **① 앱 커넥터 UI(OAuth)** 또는 **② `mcp-remote` 브리지** |

- **OAuth로 붙는 것**: Atlassian, Notion, Slack, Gmail, Calendar → 커넥터 디렉터리에서 연결 (config 불필요)
- **브리지가 필요한 것**: github처럼 헤더 인증 원격 HTTP 서버. 아래처럼 stdio로 감싼다:

```json
"github": {
  "command": "npx",
  "args": ["-y", "mcp-remote", "https://api.githubcopilot.com/mcp/", "--header", "Authorization:${GH_TOKEN}"],
  "env": { "GH_TOKEN": "ghp_..." }
}
```

> config 파일 병합 시 기존 `preferences`·`coworkUserFilesPath`·`localAgentModeTrustedFolders`·`remoteSessionFolderGrants`는 **절대 덮어쓰지 말 것**. `mcpServers` 키만 추가한다.

---

## 조직 스킬 (Claude Desktop)

| 스킬 | 언제 | 하는 일 |
|------|------|---------|
| `vroong-data-routing` | 오더·배송·기사·지점·상점·정산·물량 질문 전부 | 인트라 라이트 / 도라에몽 / VDA 중 창구를 고르고 **직접 호출**. 커넥터 미설치면 설치 안내 |
| `vooster-review` | 기획서·PRD·배포 계획·SOP 등 문서 작성·검토 시 | 조직 렌즈 갭 리포트. "검토해줘"라도 먼저 적용 여부를 묻고, "부스터로"라고 콕 집으면 바로 적용 |
| `korean-rrn-protection` | 개인정보 포함 가능 자료 | 주민등록번호 등 감지 시 작업 거부 (조직 정책) |

---

## Cursor 전용 (2026-08-12 이후 미사용)

| 서버 | 대체 |
|------|------|
| `cursor-ide-browser` | **인트라 라이트 MCP**로 조회 가능. 수정·발송은 인트라 웹 화면 |
| `cursor-app-control` | 불필요 |

---

## AI 행동 규칙

1. 데이터 조회 → 창구는 `vroong-data-routing`이 판단. 집계·분석은 **metabase** + `rules/data_query.md`, 실시간 단건은 **인트라 라이트**
2. 노션 동기화 → **Notion**. **존/권역 PRD는 노션 v2.0이 정본**(로컬은 v1.4까지). 목업·덱·체크리스트는 repo가 정본
3. Jira/Confluence → **Atlassian**
4. MCP 실패 시 → 사용자에게 설정/인증 재연결 안내 (시크릿을 채팅에 출력하지 않음)
5. 새 MCP 추가 시 → 이 문서에 **목적/트리거/유형**만 등록, 키 값은 로컬만
6. **config·토큰을 채팅에 붙여넣지 않는다** — Cowork 세션 감사 로그에 평문으로 남는다 (2026-08-12 PAT 노출 사례 → rotate 필요)

---

## 스모크 테스트 (이전 직후)

| 순서 | 테스트 | 기대 | 2026-08-12 결과 |
|------|--------|------|-----------------|
| 1 | Metabase `execute_query`로 `SELECT 1` (db_id=12) | 결과 행 반환 | ✅ 통과 |
| 2 | Notion 검색 (존/권역) | 리뷰 허브 페이지 노출 | ✅ 연결 |
| 3 | GitHub `get_me` | 계정/권한 확인 | ✅ `Jae-Hyoung-an` |
| 4 | Atlassian 접근 가능 리소스 | 사이트/클라우드 목록 | ✅ 연결 |
| 5 | Slack | 채널/메시지 조회 | ✅ 연결 |
| 6 | Gmail / Calendar | 라벨·캘린더 목록 | ✅ 연결 |

> Snowflake는 db_id=12(`Snowflake Admin`). 그 외 조회 가능 DB: (MySQL) lastmile=2, Prime DB=3, PointDB=6.

*마지막 업데이트: 2026-09-22 (인트라 라이트·도라에몽·조직 스킬 등록, Cursor 전용 표 정정, SoT 규칙 갱신)*
