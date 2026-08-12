# Cursor Agent 대화 인덱스 (요약만)

> 작성일: 2026-08-06 · 갱신: 2026-08-12  
> **전체 채팅 로그는 이 repo에 들어가지 않습니다.**  
> 원문 백업(폴더 이관)은 repo 밖 `Claude\cursor-agent-transcripts-backup\`에 있습니다.

---

## 결론 (먼저)

| 질문 | 답 |
|------|----|
| Agent별 대화 전문이 인계파일에 들어가나? | **아니오** (git 비포함) |
| 폴더 이관하면 전부 파악 가능한가? | **원문 보관은 가능, Claude가 자동 파악은 불가** (아래 §전문 이관) |
| 그럼 뭐가 넘어가나? | 핸드오프 **스레드 요약** + 이 **인덱스** + (선택) repo 밖 원문 백업 |
| 전문 백업 위치 (2026-08-12) | `C:\Users\jaehyoung.an\Claude\cursor-agent-transcripts-backup\20260812_ax-leadership-sample\` |

Claude Desktop은 Cursor 채팅을 이어서 열 수 없습니다.  
**결정·미결·파일 경로**는 `20260803_작업_컨텍스트_핸드오프.md`를 SoT로 보세요.

---

## 전문 이관 — 가능한 것 / 불가능한 것

| 가능 | 불가능 |
|------|--------|
| `.jsonl` 104개(~8.7MB) 파일 복사·보관 | Claude가 채팅 UI로 이어서 열기 |
| ID·날짜로 특정 대화 파일 찾기 | 폴더만 두고 “전부 파악해줘”에 자동 복원 |
| 필요 시 사람이 열어 복기 / AI에 일부 붙여넣기 | Cursor `SearchConversations` 인덱스까지 이식 |

원문 형식은 `role` + `message`(텍스트·tool_use 혼합)라 **읽기 부담이 큽니다.**  
업무 연속성은 핸드오프 요약이 맞고, 원문은 “증거·복기용 아카이브”로 두는 것이 맞습니다.

---

## 원문 백업 (2026-08-12 archive)

| 항목 | 값 |
|------|-----|
| 원본 (Cursor 로컬) | `%USERPROFILE%\.cursor\projects\c-Users-jaehyoung-an-Downloads-ax-leadership-sample-ax-leadership-sample\agent-transcripts\` |
| 백업 | `C:\Users\jaehyoung.an\Claude\cursor-agent-transcripts-backup\20260812_ax-leadership-sample\agent-transcripts\` |
| 목록 | 같은 폴더의 `README.md` (파일 104개, ~8.7MB) |
| git | **비포함** (repo 밖 · 시크릿/수치 혼입 가능) |

---

## 왜 전문을 커밋하지 않나

1. 중간중간 **토큰·개인정보·사내 수치**가 섞일 수 있음  
2. Claude Desktop이 Cursor `.jsonl`을 네이티브로 이어받지 못함  
3. 인계에 필요한 것은 대화 전문이 아니라 **목표 / 확정 / 미결 / 파일 경로**
---

## 최근 주요 Agent ↔ 핸드오프 스레드 매핑

| Agent 제목 (Cursor) | ID (앞 8자) | 대략 일자 | 핸드오프 스레드 |
|---------------------|-------------|-----------|-----------------|
| Document handover for MCP | `d7c8881b` | 2026-08-06 | 마이그레이션 (본 패키지) |
| PRD document review | `7327ce4b` | 2026-08-05 | **B** 존/권역 v1.4 멀티팀 리뷰 |
| Excel file content review | `6167f429` | 2026-08-04 | **D** B존 물량 목표 |
| Order statistics by location | `a1c55bb1` | 2026-08-04 | 강남구 지점×타입 (scratch) |
| Branch information for p1054A | `b588ef9d` | 2026-08-03 | **C** 할증 149835 |
| Order statistics for July | `aeb34713` | 2026-08-03 | **A/D** 성북·성동 물량 |
| Zone 요금제 개선 사항 | `1f8200f0` | 2026-07-30 | **B** (v1.3~) |
| PRD document review updates | `83c5e021` | 2026-07-30 | **B** |
| Zone 권역정책 조회 화면 | `4413bd30` | 2026-07-29 | **B** AS-IS |
| Document for zone conversion | `0d9b5b8e` | 2026-07-22 | **A** B존 전환 |

> Cursor UI에서 과거 대화를 열려면 위 제목/ID로 검색.  
> 로컬 파일: `agent-transcripts/<uuid>/<uuid>.jsonl`

---

## Claude에서 이어가는 방법

1. `CLAUDE.md` → 작업 컨텍스트 핸드오프 → 해당 스레드 핵심 파일  
2. “예전에 Cursor Agent `7327ce4b`에서 리뷰 트랙 잡았던 건”처럼 **ID만 참고**  
3. 대화 전문이 꼭 필요하면 **이 PC Cursor에서** 해당 채팅을 열고 요약만 다시 붙여넣기

---

## So What

- Claude로 옮긴 뒤에도 **업무 연속성은 핸드오프 문서**로 충분  
- Agent 채팅 전문 백업이 필요하면 별도 요청 시, 민감정보 제거한 **요약본만** `knowledge/handoff/`에 추가하는 방식을 권장
