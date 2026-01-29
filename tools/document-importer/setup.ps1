# Document Importer 설치 스크립트
# PowerShell에서 실행: .\setup.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Document Importer 설치" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 스크립트 위치로 이동
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# ========================================
# 1. Python 확인
# ========================================
Write-Host "[1/3] Python 확인 중..." -ForegroundColor Yellow

try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ $pythonVersion 발견" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python이 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "    https://www.python.org/downloads/ 에서 Python 3.10+ 설치 후 다시 시도하세요." -ForegroundColor Red
    exit 1
}

# ========================================
# 2. Python 패키지 설치
# ========================================
Write-Host ""
Write-Host "[2/3] Python 패키지 설치 중..." -ForegroundColor Yellow

pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Python 패키지 설치 완료" -ForegroundColor Green
} else {
    Write-Host "  ✗ Python 패키지 설치 실패" -ForegroundColor Red
    exit 1
}

# ========================================
# 3. Poppler 설치 (PDF 이미지 변환용)
# ========================================
Write-Host ""
Write-Host "[3/3] Poppler 확인 중..." -ForegroundColor Yellow

# Poppler 설치 여부 확인
$popplerPaths = @(
    "C:\Program Files\poppler\Library\bin",
    "C:\Program Files\poppler-24.02.0\Library\bin",
    "C:\poppler\Library\bin",
    "$env:USERPROFILE\poppler\Library\bin"
)

$popplerFound = $false
foreach ($path in $popplerPaths) {
    if (Test-Path $path) {
        Write-Host "  ✓ Poppler 발견: $path" -ForegroundColor Green
        $popplerFound = $true
        
        # 환경변수 설정 안내
        if (-not $env:POPPLER_PATH) {
            Write-Host "  → 환경변수 설정을 권장합니다:" -ForegroundColor Yellow
            Write-Host "    `$env:POPPLER_PATH = '$path'" -ForegroundColor Gray
        }
        break
    }
}

if (-not $popplerFound) {
    Write-Host "  ! Poppler가 설치되지 않았습니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  [Poppler 설치 방법]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  방법 1: Chocolatey 사용 (관리자 권한 필요)" -ForegroundColor White
    Write-Host "    choco install poppler" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  방법 2: 수동 설치" -ForegroundColor White
    Write-Host "    1. https://github.com/oschwartz10612/poppler-windows/releases 에서 다운로드" -ForegroundColor Gray
    Write-Host "    2. C:\Program Files\poppler 에 압축 해제" -ForegroundColor Gray
    Write-Host "    3. 환경변수 PATH에 C:\Program Files\poppler\Library\bin 추가" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  ※ Poppler 없이도 텍스트 추출은 가능합니다." -ForegroundColor Yellow
    Write-Host "    PDF 이미지 변환만 불가능합니다." -ForegroundColor Yellow
}

# ========================================
# 4. PowerPoint 확인 (PPTX 이미지 변환용)
# ========================================
Write-Host ""
Write-Host "[추가] PowerPoint 확인 중..." -ForegroundColor Yellow

try {
    $ppt = New-Object -ComObject PowerPoint.Application -ErrorAction Stop
    $ppt.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
    Write-Host "  ✓ Microsoft PowerPoint 발견" -ForegroundColor Green
} catch {
    Write-Host "  ! PowerPoint가 설치되지 않았습니다." -ForegroundColor Yellow
    Write-Host "    PPTX 이미지 변환은 PowerPoint가 필요합니다." -ForegroundColor Yellow
    Write-Host "    텍스트 추출은 PowerPoint 없이도 가능합니다." -ForegroundColor Yellow
}

# ========================================
# 완료
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 설치 완료!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[사용 방법]" -ForegroundColor White
Write-Host "  프로젝트 루트에서:" -ForegroundColor Gray
Write-Host "  python tools/document-importer/main.py inbox/파일명.pdf" -ForegroundColor Gray
Write-Host ""
