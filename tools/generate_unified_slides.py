"""통일된 스타일의 슬라이드 이미지 생성"""
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

# 통일된 스타일 가이드
STYLE_GUIDE = """
Style requirements (MUST follow for visual consistency):
- Color palette: Primary blue (#2563EB), secondary light blue (#60A5FA), accent white, soft gray background (#F8FAFC)
- Illustration style: Modern flat design, clean geometric shapes, subtle gradients
- Composition: Centered subject, clean negative space, 16:9 aspect ratio
- Mood: Professional, modern, optimistic
- No text, no people's faces, abstract/conceptual representation
- Consistent line weight and corner radius across all elements
"""

slides = [
    {
        'name': 'slide_01_ai_transformation_v2',
        'title': 'AI 시대의 업무 변화',
        'prompt': f'''Generate an image:
        Concept: AI transformation in workplace
        Visual elements: Abstract brain with circuit patterns, floating holographic UI elements, 
        connected nodes forming a neural network, subtle glow effects
        {STYLE_GUIDE}'''
    },
    {
        'name': 'slide_02_speed_agility_v2',
        'title': '속도의 중요성',
        'prompt': f'''Generate an image:
        Concept: Speed and agility in business
        Visual elements: Sleek arrow or rocket moving forward, motion blur lines, 
        speedometer dial, dynamic flowing curves suggesting movement
        {STYLE_GUIDE}'''
    },
    {
        'name': 'slide_03_collaboration_v2',
        'title': '협업의 새로운 방식',
        'prompt': f'''Generate an image:
        Concept: Modern teamwork and collaboration
        Visual elements: Connected puzzle pieces, overlapping circles forming unity,
        abstract hands reaching together, cloud with connection lines
        {STYLE_GUIDE}'''
    }
]

output_dir = 'projects/_scratch/slide_images'
os.makedirs(output_dir, exist_ok=True)

print("=" * 50)
print("통일된 스타일 슬라이드 이미지 생성")
print("=" * 50)
print("\n[스타일 가이드]")
print("  - 메인 컬러: Blue (#2563EB)")
print("  - 스타일: Modern flat design")
print("  - 분위기: Professional, clean")

for i, slide in enumerate(slides, 1):
    print(f"\n[{i}/3] {slide['title']}")
    print(f"    생성 중...")
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp-image-generation',
            contents=slide['prompt'],
            config=types.GenerateContentConfig(
                response_modalities=['IMAGE', 'TEXT']
            )
        )
        
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                output_path = f"{output_dir}/{slide['name']}.png"
                with open(output_path, 'wb') as f:
                    f.write(part.inline_data.data)
                print(f"    저장 완료: {output_path}")
                
    except Exception as e:
        print(f"    오류 발생: {e}")

print("\n" + "=" * 50)
print("완료! 저장 위치: projects/_scratch/slide_images/")
print("파일명: *_v2.png (통일된 버전)")
print("=" * 50)
