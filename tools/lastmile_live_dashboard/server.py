"""
라스트마일 라이브 대시보드 서버 (방식 B)

내 PC를 서버 삼아, 브라우저가 접속할 때마다 메타베이스 HTTP API를 통해
Snowflake(DATAMART)를 실시간 조회해서 최신 데이터를 반환한다.

- 데이터 소스: 메타베이스(prod) → Snowflake (database_id=12)
- 조회 방식: 메타베이스 REST API  POST /api/dataset  (native SQL)
- 자격증명: .env 의 METABASE_URL / METABASE_API_KEY 사용 (절대 코드에 하드코딩하지 않음)
"""

import os
import datetime
import requests
from flask import Flask, jsonify, send_from_directory
from dotenv import load_dotenv

load_dotenv()

METABASE_URL = (os.getenv("METABASE_URL") or "").rstrip("/")
METABASE_API_KEY = os.getenv("METABASE_API_KEY") or ""
DATABASE_ID = int(os.getenv("METABASE_DATABASE_ID", "12"))  # 12 = Snowflake Admin
PORT = int(os.getenv("PORT", "8000"))

if not METABASE_URL or not METABASE_API_KEY:
    raise SystemExit(
        "[설정 오류] .env 파일에 METABASE_URL 과 METABASE_API_KEY 를 넣어주세요. "
        "(.env.example 참고)"
    )

app = Flask(__name__, static_folder=".", static_url_path="")

# ----- 대시보드에서 사용할 Snowflake 쿼리 (모두 DATAMART 사전집계 마트 기반) -----
QUERIES = {
    # 최근 30일 일별 주문/매출
    "daily": """
        SELECT PARTITIONAL_DATE AS d,
               COUNT(*)            AS orders,
               SUM(BILLING_AMOUNT) AS revenue
        FROM VROONG.DATAMART.ORDERS
        WHERE PARTITIONAL_DATE >= DATEADD(day, -30, CURRENT_DATE)
        GROUP BY 1
        ORDER BY 1
    """,
    # 어제 상태별 분포
    "status": """
        SELECT ORDER_STATUS AS name, COUNT(*) AS orders
        FROM VROONG.DATAMART.ORDERS
        WHERE PARTITIONAL_DATE = DATEADD(day, -1, CURRENT_DATE)
        GROUP BY 1
        ORDER BY 2 DESC
    """,
    # 어제 출발지 시·도별 Top 10
    "region": """
        SELECT COALESCE(ORIGIN_SI_DO, '(미지정)') AS region, COUNT(*) AS orders
        FROM VROONG.DATAMART.ORDERS
        WHERE PARTITIONAL_DATE = DATEADD(day, -1, CURRENT_DATE)
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 10
    """,
}


def mb_query(sql: str):
    """메타베이스 /api/dataset 으로 native SQL 실행 후 rows 반환."""
    resp = requests.post(
        f"{METABASE_URL}/api/dataset",
        headers={
            "x-api-key": METABASE_API_KEY,
            "Content-Type": "application/json",
        },
        json={
            "database": DATABASE_ID,
            "type": "native",
            "native": {"query": sql},
        },
        timeout=60,
    )
    resp.raise_for_status()
    payload = resp.json()
    if payload.get("status") and payload["status"] != "completed":
        raise RuntimeError(payload.get("error", "query failed"))
    return payload["data"]["rows"]


@app.route("/api/dashboard")
def dashboard():
    try:
        daily_rows = mb_query(QUERIES["daily"])
        status_rows = mb_query(QUERIES["status"])
        region_rows = mb_query(QUERIES["region"])
    except requests.HTTPError as e:
        return jsonify({"error": f"메타베이스 호출 실패: {e}"}), 502
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": str(e)}), 500

    daily = [
        {"d": str(r[0])[:10], "orders": int(r[1]), "revenue": int(r[2] or 0)}
        for r in daily_rows
    ]
    status = [{"name": r[0], "v": int(r[1])} for r in status_rows]
    region = [{"region": r[0], "orders": int(r[1])} for r in region_rows]

    return jsonify({
        "generatedAt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "daily": daily,
        "status": status,
        "region": region,
    })


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


if __name__ == "__main__":
    print(f"\n  라스트마일 라이브 대시보드 실행 중")
    print(f"  → 브라우저에서 http://localhost:{PORT}  접속")
    print(f"  → 데이터: 메타베이스 → Snowflake (db id={DATABASE_ID})")
    print(f"  종료하려면 이 창에서 Ctrl + C\n")
    app.run(host="127.0.0.1", port=PORT, debug=False)
