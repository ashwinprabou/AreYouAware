import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()  # load from .env
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("❌ No GEMINI_API_KEY found in environment!")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-1.5-flash")  # or try "gemini-1.5-pro"


def prompt_gemini(text):
    response = model.generate_content(text)
    return response.text
