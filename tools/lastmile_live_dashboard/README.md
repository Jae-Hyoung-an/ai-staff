# 라스트마일 라이브 대시보드

## 한 줄 설명
내 PC를 서버로 띄워, 브라우저에 접속/새로고침할 때마다 **메타베이스 → Snowflake(DATAMART)** 를 실시간 조회해 인터랙티브 대시보드로 보여주는 도구입니다.

## 동작 구조 (방식 B · 라이브)
```
브라우저  →  내 PC 로컬 서버(server.py)  →  메타베이스 REST API  →  Snowflake DWH
                                          (x-api-key 인증)        (VROONG.DATAMART.ORDERS)
```
- 메타베이스 MCP는 Cursor 안에서만 동작하므로 로컬 서버가 직접 쓸 수 없습니다.
- 대신 동일한 메타베이스 **API 키**로 REST API(`/api/dataset`)를 호출해 같은 경로로 Snowflake를 조회합니다.
- prod MySQL에 직접 붙지 않고, 메타베이스 권한/거버넌스를 그대로 따릅니다.

## 사용 방법
1. 최초 1회: `.env.example` 을 복사해 `.env` 로 만들고 메타베이스 API 키를 채웁니다.
   (값은 `%USERPROFILE%\.cursor\mcp.json` 의 `metabase` 항목에 있습니다.)
2. `run.bat` 더블클릭 (또는 터미널에서 아래 실행)
   ```powershell
   pip install -r requirements.txt
   python server.py
   ```
3. 브라우저에서 `http://localhost:8000` 접속
4. 페이지를 새로고침하거나 `↻ 새로고침` 버튼을 누르면 그 시점의 최신 데이터로 갱신됩니다.
   `60초 자동 갱신` 체크 시 자동으로 주기 갱신됩니다.

## 표시 지표 (어제 기준 + 최근 30일)
- 어제 주문 건수 / 매출(청구금액 합) / 완료율 / 최근 7일 누적
- 일별 주문 추세 (최근 30일 라인 차트)
- 어제 상태별 분포 (도넛)
- 어제 출발지 시·도별 Top 10 (바 차트 + 정렬 테이블)

## 표시 지표 바꾸기
`server.py` 의 `QUERIES` 딕셔너리에 있는 SQL만 수정하면 됩니다. 모두 `VROONG.DATAMART.ORDERS` 기반입니다.

## 주의사항
- `.env` 에는 메타베이스 API 키가 들어갑니다. **절대 커밋/공유하지 마세요.** (`.gitignore` 에 이미 등록됨)
- 이 서버는 `127.0.0.1`(내 PC)에서만 접속되도록 떠 있습니다. 외부 공개 시 인증을 반드시 추가하세요.
- 메타베이스 API 키가 만료/회수되면 조회가 실패합니다. 그때는 `.env` 의 키를 갱신하세요.
