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
- **필요**: `Authorization: Bearer <GITHUB_PAT>` (또는 호스트가 요구하는 형식)
- **주의**: PAT를 repo에 커밋하지 말 것. 유출 의심 시 즉시 rotate

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

### context7 (선택)

- **목적**: 라이브러리·프레임워크 최신 문서 조회
- **트리거**: 도구/스크립트 개발 시 API 문서 확인
- **유형**: stdio — `npx -y @upstash/context7-mcp@latest`
- **비고**: PO 일상 업무 비중은 낮음

---

## Cursor 전용 (Claude로 이전 안 함)

| 서버 | 이유 |
|------|------|
| `cursor-ide-browser` | Cursor 내장 브라우저. 인트라 자동화는 Claude에서 불가 → 수동 |
| `cursor-app-control` | Cursor UI 제어용 |

---

## AI 행동 규칙

1. 데이터 조회 → **metabase** + `rules/data_query.md`
2. 노션 동기화 → **Notion** (로컬 SoT 먼저 수정 후 배포)
3. Jira/Confluence → **Atlassian**
4. MCP 실패 시 → 사용자에게 설정/인증 재연결 안내 (시크릿을 채팅에 출력하지 않음)
5. 새 MCP 추가 시 → 이 문서에 **목적/트리거/유형**만 등록, 키 값은 로컬만

---

## 스모크 테스트 (이전 직후)

| 순서 | 테스트 | 기대 |
|------|--------|------|
| 1 | Metabase `execute_query`로 간단한 SELECT | 결과 행 반환 |
| 2 | Notion 검색 (존/권역) | 리뷰 허브 페이지 노출 |
| 3 | GitHub `get_me` 또는 repo 조회 | 계정/권한 확인 |
| 4 | Atlassian 접근 가능 리소스 | 사이트/클라우드 목록 |

*마지막 업데이트: 2026-08-06*
