"""3가지 스타일의 회의실 이미지 생성"""
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

styles = [
    {
        'name': '01_flat_illustration',
        'prompt': 'Generate an image: A modern professional office meeting room, flat design illustration style, minimalist, clean geometric shapes, pastel colors with blue accents, vector art look, no text, 2D flat illustration'
    },
    {
        'name': '02_photorealistic',
        'prompt': 'Generate an image: A modern professional office meeting room, photorealistic style, minimalist interior design, natural lighting through large windows, blue accent colors in furniture, high quality photography, no text'
    },
    {
        'name': '03_simple_icon',
        'prompt': 'Generate an image: A modern office meeting room, simple icon style, minimal line art, very simplified shapes, single blue color accent on white background, clean and simple, suitable for presentation slides, no text'
    }
]

output_dir = 'projects/_scratch'
os.makedirs(output_dir, exist_ok=True)

for style in styles:
    print(f"Generating: {style['name']}...")
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp-image-generation',
            contents=style['prompt'],
            config=types.GenerateContentConfig(
                response_modalities=['IMAGE', 'TEXT']
            )
        )
        
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                output_path = f"{output_dir}/{style['name']}.png"
                with open(output_path, 'wb') as f:
                    f.write(part.inline_data.data)
                print(f"  Saved: {output_path}")
    except Exception as e:
        print(f"  Error: {e}")

print("\nDone! All images saved to projects/_scratch/")
