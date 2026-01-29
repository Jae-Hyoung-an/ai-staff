# 이미지 생성 도구 (Image Generator)

Gemini API를 사용하여 텍스트 프롬프트로 이미지를 생성합니다.

## 한 줄 설명

텍스트 설명만으로 AI 이미지를 생성하는 도구

## 사전 준비

### 1. API 키 설정

프로젝트 루트의 `.env` 파일에 Gemini API 키가 설정되어 있어야 합니다:

```
GEMINI_API_KEY=your_api_key_here
```

### 2. 환경 설정

```powershell
# 프로젝트 루트에서 실행
cd tools/image-generator

# 가상환경 생성 (최초 1회)
python -m venv venv

# 가상환경 활성화
.\venv\Scripts\Activate.ps1

# 패키지 설치
pip install -r requirements.txt
```

## 사용 방법

### API 연결 확인

```powershell
python main.py check-api
```

### 이미지 생성

```powershell
# 기본 사용
python main.py generate -p "a serene mountain landscape at sunset"

# 파일명 지정
python main.py generate -p "modern logo design" -o company_logo.png

# 출력 디렉토리 지정
python main.py generate -p "abstract background" -d ./outputs
```

### Gemini 2.0 Flash로 생성 (실험적)

```powershell
python main.py generate-with-gemini -p "futuristic city skyline"
```

### 프롬프트 작성 가이드

```powershell
python main.py help-prompts
```

## 출력 위치

기본적으로 생성된 이미지는 `resources/generated/` 폴더에 저장됩니다.

## 프롬프트 작성 팁

### 좋은 프롬프트의 특징

1. **구체적**: 색상, 스타일, 분위기를 명시
2. **명확한 스타일**: "watercolor", "digital art", "photorealistic" 등
3. **구도 설명**: "wide angle", "close-up", "isometric" 등

### 예시

| 목적 | 프롬프트 |
|------|----------|
| 로고 | "Modern tech company logo, geometric shapes, blue gradient, minimalist, vector style" |
| 배경 | "Abstract gradient background, soft purple and blue, subtle wave patterns" |
| 아이콘 | "Business icons set, flat design, consistent style, professional blue" |
| 일러스트 | "Team collaboration illustration, diverse people, modern office, warm colors" |

## 주의사항

- Imagen 3.0 모델은 일부 API 티어에서 사용 제한이 있을 수 있습니다
- 생성된 이미지의 저작권 정책을 확인하세요
- API 사용량에 따른 비용이 발생할 수 있습니다

## 트러블슈팅

### "GEMINI_API_KEY가 설정되지 않았습니다"

→ 프로젝트 루트에 `.env` 파일이 있는지 확인하세요.

### "Imagen 모델을 찾을 수 없습니다"

→ `generate-with-gemini` 명령어로 Gemini 2.0 Flash를 사용해보세요.

### 이미지가 생성되지 않음

→ 프롬프트가 콘텐츠 정책을 위반하지 않는지 확인하세요.
