#!/usr/bin/env python3
"""
이미지 생성 도구 (Gemini API)

Gemini API를 사용하여 텍스트 프롬프트로 이미지를 생성합니다.
"""

import os
import sys
import base64
from pathlib import Path
from datetime import datetime

import click
from dotenv import load_dotenv
from PIL import Image
import io

# 프로젝트 루트의 .env 파일 로드
project_root = Path(__file__).parent.parent.parent
load_dotenv(project_root / ".env")

# Gemini API 설정 (새로운 google.genai 패키지 사용)
from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("[ERROR] GEMINI_API_KEY가 설정되지 않았습니다.")
    print("        프로젝트 루트의 .env 파일에 GEMINI_API_KEY를 추가해주세요.")
    sys.exit(1)

# 클라이언트 생성
client = genai.Client(api_key=GEMINI_API_KEY)

# 기본 출력 경로
DEFAULT_OUTPUT_DIR = project_root / "resources" / "generated"


def ensure_output_dir(output_dir: Path) -> None:
    """출력 디렉토리가 없으면 생성"""
    output_dir.mkdir(parents=True, exist_ok=True)


def generate_filename(prompt: str, output_name: str | None = None) -> str:
    """파일명 생성"""
    if output_name:
        return output_name if output_name.endswith('.png') else f"{output_name}.png"
    
    # 프롬프트에서 파일명 생성
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_prompt = "".join(c if c.isalnum() or c in " _-" else "" for c in prompt[:30])
    safe_prompt = safe_prompt.strip().replace(" ", "_")
    return f"{timestamp}_{safe_prompt}.png"


@click.group()
def cli():
    """Gemini API 이미지 생성 도구"""
    pass


@cli.command()
@click.option("--prompt", "-p", required=True, help="이미지 생성 프롬프트")
@click.option("--output", "-o", default=None, help="출력 파일명 (기본: 자동 생성)")
@click.option("--output-dir", "-d", default=None, help="출력 디렉토리 (기본: resources/generated)")
def generate(prompt: str, output: str | None, output_dir: str | None):
    """Imagen 3를 사용한 이미지 생성
    
    예시:
        python main.py generate -p "a serene mountain landscape at sunset"
        python main.py generate -p "modern logo design" -o company_logo.png
    """
    try:
        print(f"[*] 이미지 생성 중...")
        print(f"    프롬프트: {prompt}")
        print(f"    모델: imagen-4.0-generate-001")
        
        # Imagen 4 모델로 이미지 생성
        response = client.models.generate_images(
            model="imagen-4.0-generate-001",
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1",
            )
        )
        
        # 출력 경로 설정
        out_dir = Path(output_dir) if output_dir else DEFAULT_OUTPUT_DIR
        ensure_output_dir(out_dir)
        
        filename = generate_filename(prompt, output)
        output_path = out_dir / filename
        
        # 이미지 저장
        if response.generated_images:
            image = response.generated_images[0]
            # base64 디코딩하여 저장
            image_bytes = base64.b64decode(image.image.image_bytes)
            img = Image.open(io.BytesIO(image_bytes))
            img.save(output_path)
            print(f"[OK] 이미지 저장 완료: {output_path}")
            return str(output_path)
        else:
            print("[ERROR] 이미지 생성에 실패했습니다.")
            return None
            
    except Exception as e:
        print(f"[ERROR] 오류 발생: {e}")
        if "imagen" in str(e).lower() or "not found" in str(e).lower() or "not supported" in str(e).lower():
            print("\n[TIP] Imagen 모델이 API에서 지원되지 않을 수 있습니다.")
            print("      Gemini 2.0 Flash의 이미지 생성 기능을 시도해보세요:")
            print("      python main.py generate-with-gemini -p \"your prompt\"")
        return None


@cli.command()
@click.option("--prompt", "-p", required=True, help="이미지 생성 프롬프트")
@click.option("--output", "-o", default=None, help="출력 파일명")
@click.option("--output-dir", "-d", default=None, help="출력 디렉토리")
def generate_with_gemini(prompt: str, output: str | None, output_dir: str | None):
    """Gemini 2.0 Flash를 사용한 이미지 생성
    
    Gemini 2.0 Flash의 multimodal 기능을 활용하여 이미지를 생성합니다.
    """
    try:
        print(f"[*] Gemini 2.0으로 이미지 생성 중...")
        print(f"    프롬프트: {prompt}")
        
        # Gemini 이미지 생성 모델 사용
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"]
            )
        )
        
        # 출력 경로 설정
        out_dir = Path(output_dir) if output_dir else DEFAULT_OUTPUT_DIR
        ensure_output_dir(out_dir)
        
        filename = generate_filename(prompt, output)
        output_path = out_dir / filename
        
        # 응답에서 이미지 추출 및 저장
        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith('image/'):
                image_bytes = part.inline_data.data
                img = Image.open(io.BytesIO(image_bytes))
                img.save(output_path)
                print(f"[OK] 이미지 저장 완료: {output_path}")
                return str(output_path)
        
        # 텍스트 응답이 있으면 출력
        for part in response.candidates[0].content.parts:
            if hasattr(part, 'text') and part.text:
                print(f"[INFO] 모델 응답: {part.text}")
        
        print("[ERROR] 응답에 이미지가 포함되어 있지 않습니다.")
        return None
        
    except Exception as e:
        print(f"[ERROR] 오류 발생: {e}")
        return None


@cli.command()
def check_api():
    """API 연결 상태 확인"""
    print("[*] Gemini API 연결 확인 중...")
    
    try:
        # 사용 가능한 모델 목록 확인
        models = client.models.list()
        print("[OK] API 연결 성공!")
        print("\n[INFO] 사용 가능한 이미지 관련 모델:")
        
        image_models = []
        for model in models:
            name = model.name if hasattr(model, 'name') else str(model)
            if any(keyword in name.lower() for keyword in ['imagen', 'image', 'gemini-2']):
                image_models.append(name)
                print(f"       - {name}")
        
        if not image_models:
            print("       (이미지 관련 모델을 찾지 못했습니다)")
        
        return True
    except Exception as e:
        print(f"[ERROR] API 연결 실패: {e}")
        return False


@cli.command()
def help_prompts():
    """이미지 생성 프롬프트 작성 가이드"""
    guide = """
========================================
  이미지 생성 프롬프트 가이드
========================================

1. 구체적으로 작성하세요
   X: "고양이 그림"
   O: "햇살이 비치는 창가에 앉아 있는 주황색 줄무늬 고양이, 따뜻한 톤"

2. 스타일을 명시하세요
   - "in watercolor style" (수채화)
   - "digital art" (디지털 아트)
   - "photorealistic" (사실적)
   - "minimalist" (미니멀)
   - "flat design" (플랫 디자인)

3. 구도와 앵글
   - "bird's eye view" (조감도)
   - "close-up shot" (클로즈업)
   - "wide angle" (광각)

4. 분위기/감정
   - "warm and cozy" (따뜻하고 아늑한)
   - "professional and clean" (전문적이고 깔끔한)
   - "playful and colorful" (발랄하고 컬러풀한)

예시 프롬프트:
- 로고: "Modern tech company logo, geometric shapes, blue gradient, minimalist, vector style"
- 배경: "Abstract gradient background, soft purple and blue tones, subtle wave patterns"
- 아이콘: "Set of business icons, flat design, consistent stroke width, professional blue color"
"""
    print(guide)


if __name__ == "__main__":
    cli()
