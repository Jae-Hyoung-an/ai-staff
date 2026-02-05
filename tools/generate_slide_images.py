"""슬라이드용 이미지 생성 (16:9 비율)"""
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

slides = [
    {
        'name': 'slide_01_ai_transformation',
        'title': 'AI 시대의 업무 변화',
        'prompt': '''Generate an image in 16:9 aspect ratio (1280x720): 
        Abstract visualization of AI transformation in the workplace. 
        A futuristic office environment with holographic displays, 
        neural network patterns subtly integrated, humans and AI working together.
        Modern, professional, blue and purple gradient tones, clean design.
        No text. Suitable for business presentation cover slide.
        Flat illustration style with subtle gradients.'''
    },
    {
        'name': 'slide_02_speed_agility',
        'title': '속도의 중요성',
        'prompt': '''Generate an image in 16:9 aspect ratio (1280x720):
        Visual metaphor for speed and agility in business.
        Dynamic motion lines, fast-moving elements, sleek aerodynamic shapes.
        A runner or rocket or speedometer concept, showing momentum and velocity.
        Modern corporate style, orange and blue accent colors, energetic.
        No text. Flat illustration style, clean and professional.'''
    },
    {
        'name': 'slide_03_collaboration',
        'title': '협업의 새로운 방식',
        'prompt': '''Generate an image in 16:9 aspect ratio (1280x720):
        Modern collaboration and teamwork concept.
        Connected people, puzzle pieces fitting together, or hands joining.
        Digital connections between diverse team members, cloud collaboration.
        Warm and inclusive feeling, teal and green tones with white.
        No text. Flat illustration style, suitable for business presentation.'''
    }
]

output_dir = 'projects/_scratch/slide_images'
os.makedirs(output_dir, exist_ok=True)

print("=" * 50)
print("슬라이드 이미지 생성 시작")
print("=" * 50)

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
print("=" * 50)
