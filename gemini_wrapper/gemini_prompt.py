import google.generativeai as genai
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()  # load from .env
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("❌ No GEMINI_API_KEY found in environment!")

logger.info("Configuring Gemini API...")
genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-1.5-flash")  # or try "gemini-1.5-pro"
logger.info("Gemini model initialized")

def prompt_gemini(text):
    try:
        logger.info(f"Sending prompt to Gemini: {text[:100]}...")  # Log first 100 chars
        response = model.generate_content(text)
        logger.info("Received response from Gemini")
        return response.text
    except Exception as e:
        logger.error(f"Error in prompt_gemini: {str(e)}", exc_info=True)
        raise
