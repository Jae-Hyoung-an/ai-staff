# 핸드오프 인덱스

> 세션/PC를 바꿔도 작업을 이어가기 위한 문서 모음.
> **새 환경(Claude PC 포함)에서는 이 파일을 먼저 보고**, 날짜가 가장 최근인 문서로 이동하세요.

---

## 지금 읽을 문서

| 우선 | 문서 | 용도 |
|------|------|------|
| 1 | [20260806 Cursor → Claude PC 마이그레이션](./20260806_Cursor_to_Claude_PC_마이그레이션.md) | MCP·설정·폴더·체크리스트 |
| 2 | [20260803 작업 컨텍스트 핸드오프](./20260803_작업_컨텍스트_핸드오프.md) | 스레드별 목표·상태·미결 (8/5 기준) |
| 3 | [Agent 대화 인덱스](./agent_conversations_index.md) | Cursor Agent 제목·ID 매핑 (**전문 아님**) |
| 참고 | [20260730 이전 핸드오프](./20260730_작업_컨텍스트_핸드오프.md) | 과거 스냅샷 (필요 시만) |

> **Agent 채팅 전문은 git에 넣지 않습니다.**  
> repo 밖 백업: `C:\Users\jaehyoung.an\Claude\cursor-agent-transcripts-backup\20260812_ax-leadership-sample\`  
> repo에는 요약·인덱스만 둡니다. 폴더 이관 ≠ Claude 자동 복원.

---

## 템플릿·설정

| 경로 | 설명 |
|------|------|
| `templates/claude_desktop_mcp.template.json` | Claude Desktop용 MCP 설정 템플릿 (**시크릿 없음**) |
| `../rules/mcp.md` | MCP 서버별 용도·트리거·이전 주의사항 |
| `../../CLAUDE.md` | Claude 세션 진입점 |
| `../../AGENTS.md` | AI 협업 규칙 본체 |
| `../rules/user.md` | 사용자 프로필 |

---

## 복원 루틴 (다른 PC / Claude)

```
1. 이 repo clone 또는 동기화
2. CLAUDE.md → AGENTS.md → rules/user.md
3. knowledge/handoff/README.md (이 파일)
4. 최신 작업 컨텍스트 핸드오프
5. rules/mcp.md 보고 Claude에 MCP 연결
6. 주력 스레드 핵심 파일만 열기
```

---

## 갱신 규칙

- 큰 작업 마무리·PC 이전·커밋 직전에 **작업 컨텍스트 핸드오프**를 갱신
- 파일명은 가능하면 기존 최신 파일을 날짜만 바꿔 유지 (스레드가 많으면 새 날짜 파일 OK)
- 완결된 스레드는 "완결"로 표시하고 축약

*마지막 업데이트: 2026-08-06*
