# Document Importer

PDF, PPTX, PPT 파일을 분석하여 마크다운으로 변환하는 도구입니다.

## 한 줄 설명

문서에서 텍스트와 이미지를 추출하여 Cursor AI가 분석할 수 있도록 준비합니다.

## 사전 요구사항

| 항목 | 필수 여부 | 용도 |
|------|----------|------|
| Python 3.10+ | 필수 | 스크립트 실행 |
| Poppler | 선택 | PDF 이미지 변환 |
| Microsoft PowerPoint | 선택 | PPTX 이미지 변환 |

> Poppler나 PowerPoint가 없어도 텍스트 추출은 가능합니다.

## 설치

프로젝트 루트에서:

```powershell
# PowerShell에서 실행
cd tools/document-importer
.\setup.ps1
```

또는 수동 설치:

```powershell
pip install -r tools/document-importer/requirements.txt
```

## 사용 방법

### 1단계: 스크립트 실행

프로젝트 루트에서:

```powershell
python tools/document-importer/main.py inbox/파일명.pdf
python tools/document-importer/main.py inbox/발표자료.pptx
```

### 2단계: Cursor AI에게 분석 요청

스크립트 실행 후 생성된 임시 폴더를 AI에게 전달:

```
"@inbox/_temp_파일명 분석해줘"
```

### 3단계: 리뷰 및 확정

AI가 종합 마크다운을 생성하면 리뷰 후:
- 수정할 내용이 있으면 피드백
- 완료되면 "확정" 또는 "정리해줘"

## 예시

```powershell
# PDF 파일 처리
python tools/document-importer/main.py inbox/분기보고서.pdf

# PPTX 파일 처리
python tools/document-importer/main.py resources/발표자료.pptx
```

## 출력 구조

```
inbox/_temp_파일명/
├── pages_text/           # 페이지별 텍스트
│   ├── page_01.md
│   ├── page_02.md
│   └── ...
├── pages_images/         # 페이지별 이미지
│   ├── page_01.png
│   ├── page_02.png
│   └── ...
└── all_text.md           # 전체 텍스트 병합본
```

## AI 워크플로우

이 도구는 Cursor AI의 기본 워크플로우와 연동됩니다:

1. **추출** → 스크립트가 텍스트 + 이미지 추출
2. **분석** → AI가 이미지 분석하여 내용 파악
3. **종합** → 텍스트 + 이미지 분석 결과 통합
4. **재구조화** → 페이지 개념 없이 논리적으로 정리
5. **리뷰** → 사용자 확인 및 피드백
6. **정리** → knowledge/ 저장, 원본 이동, 임시 파일 삭제

## 문제 해결

### Poppler 관련 오류

```
[오류] PDF 이미지 변환 실패
```

해결:
1. https://github.com/oschwartz10612/poppler-windows/releases 에서 다운로드
2. `C:\Program Files\poppler`에 압축 해제
3. 환경변수 PATH에 `C:\Program Files\poppler\Library\bin` 추가

### PowerPoint 관련 오류

```
[오류] PPTX 이미지 변환 실패
```

해결:
- Microsoft PowerPoint가 설치되어 있는지 확인
- 다른 PowerPoint 인스턴스가 실행 중이면 종료

## 주의사항

- 대용량 파일(50페이지+)은 처리 시간이 오래 걸릴 수 있습니다
- 이미지 변환 실패 시에도 텍스트 추출은 진행됩니다
- 임시 파일은 "정리" 단계에서 AI가 삭제합니다

## 버전

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-01-29 | 초기 버전 |
