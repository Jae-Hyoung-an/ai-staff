# Cursor → Claude PC 마이그레이션 핸드오프

> 작성일: 2026-08-06  
> 목적: Cursor에서 Claude Desktop(클로드 PC)으로 작업 환경을 옮길 때, **작업 맥락·MCP·폴더 규칙**을 한곳에서 이어받기 위한 문서.  
> 작업 스레드 상세는 [20260803_작업_컨텍스트_핸드오프.md](./20260803_작업_컨텍스트_핸드오프.md)를 본다.

---

## 1. 한 줄 요약

이 repo(`ai-staff` / `ax-leadership-sample`)는 이미 **텍스트 기반 지식 베이스**로 설계되어 있어 Claude로 옮겨도 핵심 업무는 그대로 이어갈 수 있다.  
남겨야 할 것은 (1) **MCP 재연결**, (2) **로컬 시크릿**, (3) **Cursor 전용 기능 대체** 세 가지다.

---

## 2. Claude에서 처음 할 일 (체크리스트)

### A. 워크스페이스 열기

- [ ] Claude Desktop에서 이 폴더를 프로젝트/작업 폴더로 연다  
  - 현재 Cursor 경로: `C:\Users\jaehyoung.an\Downloads\ax-leadership-sample\ax-leadership-sample`
- [ ] Claude 설정에 `coworkUserFilesPath`가 `C:\Users\jaehyoung.an\Claude`로 잡혀 있음 → 필요하면 해당 폴더를 만들고, **이 repo는 별도 프로젝트로 유지**하는 것을 권장 (업무 SoT는 git repo)

### B. 컨텍스트 복원

- [ ] `CLAUDE.md` 읽기
- [ ] `AGENTS.md` + `rules/user.md` 읽기
- [ ] 이 문서 + `20260803_작업_컨텍스트_핸드오프.md` 읽기
- [ ] 주력 스레드 B: `knowledge/2_planning/prd/zone_권역구조_개편_v1.4/`

### C. MCP 연결

- [x] `rules/mcp.md` 확인
- [x] Cursor `mcp.json` → Claude `claude_desktop_config.json`에 `mcpServers` 병합 (2026-08-06, preferences 유지)
- [x] 로컬 백업: `%APPDATA%\Claude\claude_desktop_config.json.bak_20260806`
- [x] 로컬 사본: `secrets/claude_desktop_mcp.local.json` (gitignore)
- [ ] Claude 완전 종료 후 재시작 → 각 MCP 인증(Notion/Atlassian/Slack OAuth 등) 재로그인
- [ ] Metabase로 `SELECT 1` 수준의 연결 스모크 테스트

### D. 시크릿·보안

- [ ] `.env`는 `.gitignore` 대상 — 다른 PC면 수동 복사
- [ ] GitHub PAT / Metabase API Key는 **절대 knowledge/에 넣지 않음**
- [ ] Cursor `~\.cursor\mcp.json`에 평문 토큰이 있음 → Claude로 옮긴 뒤 **토큰 재발급(rotate) 권장**

---

## 3. MCP 이전 가이드

### 설정 파일 위치

| 앱 | 경로 | 비고 |
|----|------|------|
| **Cursor (현재 SoT)** | `%USERPROFILE%\.cursor\mcp.json` | 지금 쓰는 MCP 정의 |
| **Claude Desktop** | `%APPDATA%\Claude\claude_desktop_config.json` | 현재 preferences만 있고 **mcpServers 없음** |
| Claude Desktop (MSIX 함정) | `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` | Edit Config가 다른 파일을 열 수 있음. MCP가 안 뜨면 이쪽도 확인 |

### Cursor에 연결된 서버 (이전 대상)

| 서버명 | 유형 | 용도 | Claude 이전 시 |
|--------|------|------|----------------|
| `metabase` | stdio (`npx`) | Snowflake 쿼리, 카드/대시보드 | `env`에 URL+API Key 필요. **업무 핵심** |
| `Notion` | HTTP | 노션 페이지 읽기/쓰기/검색 | OAuth 재인증 |
| `github` | HTTP | 이슈/PR/파일 | Authorization 헤더에 PAT |
| `Atlassian-MCP-Server` | HTTP | Jira/Confluence | OAuth 재인증 |
| `Slack` | HTTP (Smithery) | 슬랙 | OAuth/Smithery 재연결 |
| `context7` | stdio (`npx`) | 라이브러리 문서 조회 | 선택 (PO 업무 비중 낮음) |

### Cursor 전용 (이전 불가 / 대체)

| Cursor 기능 | 대체 |
|-------------|------|
| `cursor-ide-browser` (인트라 자동화) | Chrome 수동 + 스크린샷을 inbox에 넣고 분석 |
| `cursor-app-control` | 불필요 |
| Canvas | Markdown 표 / `projects/` HTML |
| Skills / Automations | Claude 쪽 별도 워크플로로 재구성 |

### 병합 시 주의

1. 기존 Claude `preferences` / `coworkUserFilesPath` **절대 덮어쓰지 말 것** — `mcpServers` 키만 추가
2. Windows에서 `npx` 기반 서버가 실패하면 `cmd /c npx ...` 형태를 시도
3. Node.js / npm이 PATH에 있어야 `metabase`, `context7` 동작
4. 상세 템플릿: [`templates/claude_desktop_mcp.template.json`](./templates/claude_desktop_mcp.template.json)

---

## 4. 폴더·문서 SoT (Source of Truth)

Claude/Cursor 공통으로 **이 git repo가 SoT**다.

```
ax-leadership-sample/
├── CLAUDE.md              ← Claude 진입점 (신규)
├── AGENTS.md              ← 협업 규칙
├── .cursorrules           ← Cursor용 (Claude는 CLAUDE.md 사용)
├── rules/
│   ├── user.md            ← 프로필
│   ├── data_query.md      ← Snowflake/Metabase 규칙
│   ├── mcp.md             ← MCP 레지스트리 (신규)
│   ├── tools.md
│   └── ...
├── knowledge/
│   ├── handoff/           ← 세션 인계 (여기)
│   ├── 1_discovery/
│   ├── 2_planning/prd/    ← 주력 PRD
│   └── ...
├── projects/              ← 산출물
├── tools/
├── docs/                  ← GitHub Pages
├── inbox/                 ← 임시 입고 (비워 둘 것)
└── resources/             ← 바이너리 원본
```

### 이번 정리에서 한 일

| 항목 | 내용 |
|------|------|
| `CLAUDE.md` 추가 | Claude 세션 복원 진입점 |
| `knowledge/handoff/README.md` | 핸드오프 인덱스 |
| `rules/mcp.md` | MCP 용도·이전 규칙 |
| MCP 템플릿 | 시크릿 없는 JSON 샘플 |
| `_scratch` 인덱스 | partner4563 분석 CSV 묶음 안내 |

### 아직 repo 밖 / 로컬만

| 항목 | 위치 | 조치 |
|------|------|------|
| MCP 실키 | `~\.cursor\mcp.json` | Claude 설정으로 수동 복사 후 rotate 권장 |
| `.env` | repo 루트 (gitignore) | 필요 시 다른 PC로 수동 복사 |
| Cursor Canvas | Cursor canvases (repo 밖) | 필요하면 Markdown으로 옮겨 커밋 |
| Claude Cowork 홈 | `C:\Users\jaehyoung.an\Claude` (설정값, 폴더 미생성 가능) | 업무 SoT로 쓰지 말고 repo 유지 |

---

## 5. 현재 주력 작업 (이어갈 것)

상세·미결은 `20260803_작업_컨텍스트_핸드오프.md` 참고. 우선순위만:

| 순위 | 스레드 | 상태 | 다음 액션 |
|------|--------|------|-----------|
| 1 | **B. 존/권역 구조 개편 v1.4** | 독립문서화·멀티팀 리뷰 | 개발팀 트랙 A~D 리뷰 → TBD/E 해소 → 노션 재동기화 |
| 2 | A. 성북·성동 B존 전환 | 할증 이관 실행 중 | 유지 437건 분류 + 재검증 diff |
| 3 | C. p1054A 할증 149835 | 조사 완료, 원인 미확정 | 원가 0 적재 원인 → 에스컬레이션 판단 |
| 4 | D. B존 8~9월 물량 목표 | v2 산출 완료 | 9월 목표 확정 방식 합의 |

노션 리뷰 허브: https://app.notion.com/p/3b2cf5759dc081d090c4d3052ae6096d  
목업: https://jae-hyoung-an.github.io/ai-staff/zone-region-mockup-v1.4.html

---

## 6. Claude 첫 프롬프트 (복붙)

```
CLAUDE.md, AGENTS.md, rules/user.md, rules/mcp.md,
knowledge/handoff/README.md,
knowledge/handoff/20260806_Cursor_to_Claude_PC_마이그레이션.md,
knowledge/handoff/20260803_작업_컨텍스트_핸드오프.md
를 읽고 컨텍스트를 복원해줘.

주력: zone_권역구조_개편_v1.4 멀티팀 리뷰.
MCP는 Metabase/Notion을 우선 쓰고, Cursor Browser/Canvas는 없다고 가정해.
```

---

## 7. Agent 대화 컨텍스트는?

| 포함? | 내용 |
|-------|------|
| ❌ git | Cursor Agent 채팅 전문 (`.jsonl`) |
| ✅ repo 밖 백업 | `C:\Users\jaehyoung.an\Claude\cursor-agent-transcripts-backup\20260812_ax-leadership-sample\` (2026-08-12, 104파일) |
| ✅ | 스레드별 목표·확정·미결·파일 경로 (`20260803_…핸드오프`) |
| ✅ | Agent 제목·ID·스레드 매핑 (`agent_conversations_index.md`) |

**폴더만 이관해도 Claude가 대화를 “전부 파악”하진 않습니다.** 원문 보관용이며, 업무 연속성 SoT는 핸드오프 요약입니다.

---

## 8. So What / Next Step

1. **오늘**: Claude Desktop에 `mcpServers` 병합 → Metabase·Notion 스모크 테스트  
2. **토큰**: GitHub PAT·Metabase Key rotate 후 Cursor/Claude 양쪽 갱신  
3. **작업**: 스레드 B 리뷰 피드백을 로컬 SoT에 반영 → 노션 동기화  
4. Agent 전문이 꼭 필요하면 Cursor에서 해당 채팅을 열고 요약만 붙여넣기

---

## 버전

| 날짜 | 내용 |
|------|------|
| 2026-08-06 | 초안 — Cursor→Claude PC 인계 패키지 |
| 2026-08-06 | Agent 대화 인덱스·미포함 안내 추가, MCP 로컬 병합·푸시 |
