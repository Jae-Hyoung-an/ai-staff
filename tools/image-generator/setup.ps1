# Image Generator 환경 설정 스크립트
# 사용법: .\setup.ps1

Write-Host "=== Image Generator 환경 설정 ===" -ForegroundColor Cyan
Write-Host ""

# 현재 디렉토리 확인
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Python 확인
Write-Host "[1/4] Python 확인 중..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "  ✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "    https://www.python.org/downloads/ 에서 설치해주세요."
    exit 1
}

# 가상환경 생성
Write-Host "[2/4] 가상환경 설정 중..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "  ✓ 가상환경이 이미 존재합니다." -ForegroundColor Green
} else {
    python -m venv venv
    Write-Host "  ✓ 가상환경 생성 완료" -ForegroundColor Green
}

# 가상환경 활성화
Write-Host "[3/4] 가상환경 활성화 중..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "  ✓ 가상환경 활성화 완료" -ForegroundColor Green

# 패키지 설치
Write-Host "[4/4] 패키지 설치 중..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
Write-Host "  ✓ 패키지 설치 완료" -ForegroundColor Green

Write-Host ""
Write-Host "=== 설정 완료! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "사용 방법:" -ForegroundColor White
Write-Host "  1. 가상환경 활성화: .\venv\Scripts\Activate.ps1"
Write-Host "  2. API 확인: python main.py check-api"
Write-Host "  3. 이미지 생성: python main.py generate -p '프롬프트'"
Write-Host ""
Write-Host "프롬프트 작성 가이드: python main.py help-prompts" -ForegroundColor Gray
