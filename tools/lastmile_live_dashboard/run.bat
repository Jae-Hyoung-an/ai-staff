@echo off
chcp 65001 >nul
cd /d %~dp0
echo ============================================
echo  라스트마일 라이브 대시보드 시작
echo ============================================
echo.
echo [1/2] 필요한 패키지 확인/설치 중...
pip install -q -r requirements.txt
echo.
echo [2/2] 서버 실행. 브라우저에서 http://localhost:8000 접속하세요.
echo  (종료하려면 이 창에서 Ctrl + C)
echo.
python server.py
pause
