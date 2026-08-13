# Claude 작업 가이드 (이 repo용)

> Cursor → Claude Desktop(클로드 PC) 이전용 진입점.
> **새 세션 시작 시 이 파일을 먼저 읽고**, 아래 순서로 컨텍스트를 복원하세요.

---

## 필수 읽기 순서 (5분)

1. **이 파일** (`CLAUDE.md`)
2. `AGENTS.md` — AI 협업 규칙·금지사항·폴더 구조
3. `rules/user.md` — 사용자(안재형) 프로필·선호
4. `knowledge/handoff/README.md` — 최신 핸드오프 인덱스
5. `TASKS.md` — 현재 할 일 보드 (오늘/이번주/진행중/대기/백로그)
6. 진행 중인 작업 스레드의 핵심 파일 (핸드오프에 경로 명시)

데이터 조회가 필요하면 추가로 `rules/data_query.md`, MCP 설정은 `rules/mcp.md`를 봅니다.

---

## 이 repo가 하는 일

부릉(Vroong) PO(안재형)의 **개인 업무 파트너 워크스페이스**입니다.

| 폴더 | 역할 |
|------|------|
| `knowledge/` | AI가 읽는 지식 베이스 (Input) |
| `projects/` | AI와 만든 산출물 (Output) |
| `rules/` | 협업·데이터·도구·MCP 규칙 |
| `tools/` | 재사용 스크립트 |
| `inbox/` | 외부 문서 임시 보관 → knowledge로 정리 |
| `resources/` | PDF 등 바이너리 원본 |
| `docs/` | GitHub Pages 공유용 |

> 할 일 관리는 루트 `TASKS.md`에서 합니다 (상태별 보드 + `[개발]/[개인]/[팀]/[정기]` 태그).

---

## 핵심 행동 원칙

- **모든 응답은 한글**
- **So What**: 분석/정리에 "그래서 뭘 해야 하는가" 포함
- **비판적 분석 + 대안 제시**
- **대량 변경·Git commit·user.md 수정은 사용자 승인 후**
- 기술 용어는 괄호로 바로 설명

상세는 `AGENTS.md`를 따릅니다.

---

## Cursor와 다른 점 (주의)

| Cursor | Claude Desktop |
|--------|----------------|
| Canvas (`.canvas.tsx`) | 미지원 → Markdown/HTML로 대체 |
| Browser Automation (인트라 조회) | 미지원 → 수동 확인 또는 별도 브라우저 |
| Skills / Automations | Claude 쪽 별도 설정 필요 |
| MCP `user-*` 접두사 | 설정명 그대로 (`metabase`, `Notion` 등) |

Cursor 전용 기능이 필요한 작업은 핸드오프 문서의 "Cursor 잔여 의존" 섹션을 확인하세요.

---

## MCP (외부 도구 연결)

설정 가이드: `rules/mcp.md`  
템플릿: `knowledge/handoff/templates/claude_desktop_mcp.template.json`  
마이그레이션 전체: `knowledge/handoff/20260806_Cursor_to_Claude_PC_마이그레이션.md`

현재 사용 MCP: **Metabase**(Snowflake 쿼리), **Notion**, **GitHub**, **Atlassian**(Jira/Confluence), **Slack**, **context7**(선택).

> 시크릿(API 키·토큰)은 repo에 넣지 않습니다. 로컬 Claude 설정 파일에만 보관하세요.

---

## 첫 메시지 예시 (복붙용)

```
이 워크스페이스의 CLAUDE.md와 AGENTS.md, rules/user.md,
knowledge/handoff/README.md를 읽고 컨텍스트를 복원해줘.
현재 주력 작업은 존/권역 구조 개편 PRD v1.4 멀티팀 리뷰야.
```
