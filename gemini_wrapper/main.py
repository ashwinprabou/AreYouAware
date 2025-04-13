from datetime import date
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import json
from record import record_to_wav
from transcribe import transcribe_audio
from gemini_prompt import prompt_gemini

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    conversation_history: str = ""

class ChatResponse(BaseModel):
    response: str

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Received {request.method} request to {request.url}")
    try:
        body = await request.body()
        if body:
            logger.info(f"Request body: {body.decode()}")
    except Exception as e:
        logger.error(f"Error reading request body: {e}")
    response = await call_next(request)
    return response

def create_context_prompt(user_input: str, conversation_history: str = "", is_follow_up: bool = False) -> str:
    today = date.today().strftime("%B %d, %Y")
    context_prompt = f"""
    You are a professional legal assistant helping college students understand their rights.
    Explain everything calmly, clearly, and in simple terms.
    The student does not know much about the law.
    It is currently {today}.

    {conversation_history}

    Here is what the student said:
    \"\"\"{user_input}\"\"\"

    Now respond with what they can and cannot do based on what you understood.
    If you need more information to provide a complete answer, ask ONE clear follow-up question.
    If you don't need more information, provide your complete answer without asking any questions.
    """
    return context_prompt

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Server is running"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        logger.info(f"Received chat request: {request.message}")
        logger.info(f"Conversation history: {request.conversation_history}")
        
        # Create prompt with conversation history
        context_prompt = create_context_prompt(request.message, request.conversation_history)
        logger.info(f"Created context prompt: {context_prompt}")
        
        # Get Gemini's response
        logger.info("Calling Gemini API...")
        response = prompt_gemini(context_prompt)
        logger.info(f"Received Gemini response: {response}")
        
        return ChatResponse(response=response)
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transcribe")
async def transcribe_voice(audio_data: bytes):
    try:
        logger.info("Received audio data for transcription")
        
        # Save the audio data to a file
        with open("temp_audio.wav", "wb") as f:
            f.write(audio_data)
        
        # Transcribe the audio
        transcription = transcribe_audio("temp_audio.wav")
        logger.info(f"Transcribed text: {transcription}")
        
        return {"transcription": transcription}
    except Exception as e:
        logger.error(f"Error in transcribe endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
