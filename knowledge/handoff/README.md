# 핸드오프 인덱스

> 세션/PC를 바꿔도 작업을 이어가기 위한 문서 모음.
> **새 환경에서는 이 파일을 먼저 보고**, 날짜가 가장 최근인 문서로 이동하세요.

---

## 지금 읽을 문서

| 우선 | 문서 | 용도 |
|------|------|------|
| 1 | [20260922 작업 컨텍스트 핸드오프](./20260922_작업_컨텍스트_핸드오프.md) | **최신.** 스레드별 목표·상태·미결 (9/22 기준). 정본(SoT) 위치 변경 포함 |
| 2 | [20260806 Cursor → Claude PC 마이그레이션](./20260806_Cursor_to_Claude_PC_마이그레이션.md) | MCP·설정·폴더·체크리스트 (일부 내용은 9/22 문서로 갱신됨) |
| 참고 | [20260803 작업 컨텍스트 핸드오프](./20260803_작업_컨텍스트_핸드오프.md) | 8/5 기준 과거 스냅샷. 스레드 A·C·D 핵심 파일 경로는 여전히 유효 |
| 참고 | [Agent 대화 인덱스](./agent_conversations_index.md) | Cursor Agent 제목·ID 매핑 (**전문 아님**) |

> **Agent 채팅 전문은 git에 넣지 않습니다.**  
> repo 밖 백업: `C:\Users\jaehyoung.an\Claude\cursor-agent-transcripts-backup\20260812_ax-leadership-sample\` (104파일)  
> repo에는 요약·인덱스만 둡니다. 폴더 이관 ≠ Claude 자동 복원.

---

## 정본(SoT) 위치 요약 (2026-09-22)

| 대상 | 위치 |
|------|------|
| 존/권역 PRD 텍스트 | 노션 v2.0 (로컬 `knowledge/2_planning/prd/`는 v1.4까지) |
| 인트라 목업·발표 덱·체크리스트·산출물 | 이 repo (`docs/`, `projects/`) |
| 회의록·일정·주간 S&OP | 노션 DB |

---

## 템플릿·설정

| 경로 | 설명 |
|------|------|
| `templates/claude_desktop_mcp.template.json` | Claude Desktop용 MCP 설정 템플릿 (**시크릿 없음**) |
| `../rules/mcp.md` | MCP 서버·커넥터·스킬 레지스트리 |
| `../../CLAUDE.md` | Claude 세션 진입점 |
| `../../TASKS.md` | 할 일 보드 |
| `../../AGENTS.md` | AI 협업 규칙 본체 |
| `../rules/user.md` | 사용자 프로필 |

---

## 복원 루틴 (다른 PC / Claude)

```
1. 이 repo clone 또는 git pull (사본이 여러 곳이면 원격 기준으로 맞출 것)
2. CLAUDE.md → AGENTS.md → rules/user.md
3. knowledge/handoff/README.md (이 파일)
4. 최신 작업 컨텍스트 핸드오프
5. TASKS.md
6. 주력 스레드 핵심 파일만 열기
```

---

## 갱신 규칙

- 큰 작업 마무리·PC 이전·커밋 직전에 **작업 컨텍스트 핸드오프**를 갱신
- 파일명은 가능하면 기존 최신 파일을 날짜만 바꿔 유지 (스레드가 많으면 새 날짜 파일 OK)
- 완결된 스레드는 "완결"로 표시하고 축약
- **Claude 세션에서 만든 파일은 repo 안 `projects/`에 저장**하고 핸드오프에 스레드로 등록 (repo 밖에 두면 다음 세션이 못 찾는다)

*마지막 업데이트: 2026-09-22*
