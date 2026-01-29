# 도구 레지스트리

> 이 문서는 프로젝트에서 사용 가능한 도구들의 목록입니다.
> AI는 이 문서를 참조하여 적절한 상황에 도구 사용을 제안합니다.
> 새 도구를 만들면 반드시 이 문서에 등록해주세요.

---

## 도구 등록 형식

```markdown
## {도구명}

- **목적**: 무엇을 해결하는 도구인가
- **트리거**: 언제 이 도구를 사용하면 좋은가
- **사용법**: 실행 명령어 또는 방법
- **위치**: 도구 소스 위치
- **예시**: 실제 사용 예시
```

---

## 등록된 도구 목록

> 아래에 도구를 추가하세요.

---

## document-importer

- **목적**: PDF, PPTX, PPT 파일을 분석하여 마크다운으로 변환
- **트리거**: 
  - "이 PDF/PPT 분석해줘"
  - "inbox/파일명 임포트해줘"
  - "문서 분석해줘"
  - inbox/에 PDF/PPTX 파일이 있을 때
- **사용법**: `python tools/document-importer/main.py <파일경로>`
- **위치**: `tools/document-importer/`
- **예시**: 
  ```powershell
  python tools/document-importer/main.py inbox/보고서.pdf
  # → inbox/_temp_보고서/ 폴더에 텍스트 + 이미지 추출
  # → AI가 분석 후 knowledge/에 최종 마크다운 저장
  ```

---

## image-generator

- **목적**: Gemini API를 사용하여 텍스트 프롬프트로 AI 이미지 생성
- **트리거**:
  - "이미지 만들어줘"
  - "로고 생성해줘"
  - "배경 이미지 필요해"
  - "아이콘 만들어줘"
  - 프레젠테이션/문서에 이미지가 필요할 때
- **사용법**: `python tools/image-generator/main.py generate -p "프롬프트"`
- **위치**: `tools/image-generator/`
- **예시**:
  ```powershell
  # API 연결 확인
  python tools/image-generator/main.py check-api
  
  # 이미지 생성
  python tools/image-generator/main.py generate -p "modern tech logo, blue gradient"
  
  # 파일명 지정
  python tools/image-generator/main.py generate -p "abstract background" -o bg.png
  ```

---

<!-- 예시: 아래 형식으로 도구를 등록합니다

## pdf-converter

- **목적**: PDF 파일을 Markdown으로 변환하여 knowledge/에 저장
- **트리거**: 
  - "이 PDF 정리해줘"
  - inbox/에 PDF 파일이 있을 때
  - "PDF를 텍스트로 변환해줘"
- **사용법**: `pnpm pdf:convert <파일경로>`
- **위치**: `tools/pdf-converter/`
- **예시**: 
  ```bash
  pnpm pdf:convert inbox/report.pdf
  # → knowledge/reports/2026-01-06_report.md 생성
  ```

---

## image-generator

- **목적**: AI 이미지 생성 (로고, 다이어그램, 일러스트 등)
- **트리거**:
  - "이미지 만들어줘"
  - "로고 생성해줘"
  - 프레젠테이션 슬라이드 제작 시
- **사용법**: `pnpm image -- --prompt "설명" --category {카테고리} --output "파일명"`
- **위치**: `tools/image-generator/`
- **예시**:
  ```bash
  pnpm image -- --prompt "Modern tech company logo, blue gradient" --category logos --output "company_logo"
  ```

-->

---

## 버전

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-01-06 | 초기 버전 |
