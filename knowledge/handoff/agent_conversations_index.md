# Cursor Agent 대화 인덱스 (요약만)

> 작성일: 2026-08-06  
> **전체 채팅 로그는 이 repo에 들어가지 않습니다.** Cursor Agent 대화는 로컬에만 있습니다.

---

## 결론 (먼저)

| 질문 | 답 |
|------|----|
| Agent별 대화 전문이 인계파일에 들어가나? | **아니오** |
| 그럼 뭐가 넘어가나? | 핸드오프의 **스레드 요약** + 아래 **대화 인덱스**(제목·ID·연결 스레드) |
| 전문은 어디? | 이 PC의 Cursor 로컬: `%USERPROFILE%\.cursor\projects\...\agent-transcripts\` |

Claude PC에서는 Cursor 채팅을 이어서 열 수 없습니다.  
**결정·미결·파일 경로**는 `20260803_작업_컨텍스트_핸드오프.md`를 SoT로 보고, 필요 시 이 인덱스에서 “어떤 Agent에서 뭘 했는지”만 추적하세요.

---

## 왜 전문을 커밋하지 않나

1. 용량이 크고(대화 100개+), 중간중간 **토큰·개인정보·사내 수치**가 섞일 수 있음  
2. Claude Desktop이 Cursor `.jsonl` 대화를 네이티브로 이어받지 못함  
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
