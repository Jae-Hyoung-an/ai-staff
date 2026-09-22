# Claude 작업 가이드 (이 repo용)

> Claude Desktop(Code 탭·Cowork) 세션 진입점.
> **새 세션 시작 시 이 파일을 먼저 읽고**, 아래 순서로 컨텍스트를 복원하세요.

---

## 필수 읽기 순서 (5분)

1. **이 파일** (`CLAUDE.md`)
2. `AGENTS.md` — AI 협업 규칙·금지사항·폴더 구조
3. `rules/user.md` — 사용자(안재형) 프로필·선호
4. `knowledge/handoff/README.md` — 최신 핸드오프 인덱스 → 최신 날짜 핸드오프
5. `TASKS.md` — 현재 할 일 보드 (오늘/이번주/진행중/대기/백로그)
6. 진행 중인 작업 스레드의 핵심 파일 (핸드오프에 경로 명시)

데이터 조회가 필요하면 추가로 `rules/data_query.md`, MCP·커넥터·스킬은 `rules/mcp.md`를 봅니다.

---

## 이 repo가 하는 일

부릉(Vroong) PO(안재형)의 **개인 업무 파트너 워크스페이스**입니다.

| 폴더 | 역할 |
|------|------|
| `knowledge/` | AI가 읽는 지식 베이스 (Input) |
| `projects/` | AI와 만든 산출물 (Output). **세션에서 만든 파일은 반드시 여기에** |
| `rules/` | 협업·데이터·도구·MCP 규칙 |
| `tools/` | 재사용 스크립트 |
| `inbox/` | 외부 문서 임시 보관 → knowledge로 정리 |
| `resources/` | PDF 등 바이너리 원본 |
| `docs/` | GitHub Pages 공유용 (`https://jae-hyoung-an.github.io/ai-staff/`) |

> 할 일 관리는 루트 `TASKS.md`에서 합니다 (상태별 보드 + `[개발]/[개인]/[팀]/[정기]` 태그).

### 정본(SoT)이 나뉘어 있음 (2026-09-22)

| 대상 | 정본 |
|------|------|
| 존/권역 PRD 텍스트 | **노션 v2.0** (로컬 `knowledge/2_planning/prd/`는 v1.4까지) |
| 인트라 목업·발표 덱·체크리스트·분석 산출물 | **이 repo** |
| 회의록·프로젝트 일정·주간 S&OP | 노션 DB |

정책을 바꾸면 노션 v2.0을 고치고, 목업(`docs/zone-region-v2.0/`)을 맞춥니다. 상세 링크는 최신 핸드오프.

---

## 핵심 행동 원칙

- **모든 응답은 한글**
- **So What**: 분석/정리에 "그래서 뭘 해야 하는가" 포함
- **비판적 분석 + 대안 제시**
- **대량 변경·Git commit·user.md 수정은 사용자 승인 후**
- 기술 용어는 괄호로 바로 설명
- `docs/*.js` 편집 후 **한글 깨짐(UTF-8) 확인** — 9월에 손상 복구 커밋이 여러 번 있었음

상세는 `AGENTS.md`를 따릅니다.

---

## 데이터·외부 도구

설정 가이드: `rules/mcp.md` · 조회 규칙: `rules/data_query.md`

| 용도 | 창구 |
|------|------|
| 집계·분석 (Snowflake 미러) | **Metabase MCP** `execute_query` (db_id=12) |
| 실시간 오더·기사·지점·상점 | **인트라 라이트 MCP** (`intra_lite`) |
| 배송 실패·API 원문·연동사 | 도라에몽 MCP |
| 창구 선택 | `vroong-data-routing` 스킬이 자동 판단 |
| 문서·협업 | Notion · Atlassian · Slack · Gmail · Calendar 커넥터 |
| 문서 리뷰 | `vooster-review` 스킬 (요청 시) |

> 시크릿(API 키·토큰)은 repo에 넣지 않습니다. 채팅에도 붙여넣지 마세요 (세션 로그에 평문으로 남습니다).

---

## Cursor 시절과 다른 점

Cursor는 2026-08-12 이후 사용하지 않습니다. 참고용:

| Cursor | Claude Desktop |
|--------|----------------|
| Canvas (`.canvas.tsx`) | Markdown/HTML로 대체 (`projects/`) |
| Browser Automation (인트라 조회) | **인트라 라이트 MCP로 조회 가능**. 수정·발송은 웹 화면에서 |
| Skills / Automations | 조직 스킬(`vroong-data-routing`, `vooster-review`) + 예약 작업 |
| MCP `user-*` 접두사 | 설정명 그대로 |

---

## 첫 메시지 예시 (복붙용)

```
CLAUDE.md, AGENTS.md, rules/user.md, TASKS.md,
knowledge/handoff/README.md와 최신 핸드오프를 읽고 컨텍스트를 복원해줘.
주력: 존/권역 구조 개편 v2.0 (노션 정본) + 배포 후 전환 체크리스트.
```
