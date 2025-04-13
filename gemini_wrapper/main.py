from datetime import date
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import json
from record import record_to_wav
from transcribe import transcribe_audio
from gemini_prompt import prompt_gemini
import os
from typing import Optional

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
    topicId: Optional[str] = None
    description: Optional[str] = None

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
    You are a professional legal assistant helping those inexperienced with the law and legal issues understand their rights.
    Explain everything calmly, clearly, and in simple terms.
    The person does not know much about the law.
    It is currently {today}.

    {conversation_history}

    Here is what the student said:
    \"\"\"{user_input}\"\"\"

    In your explanation:
    - Talk about the law, legal issues, and legal rights that the person has in simple terms.
    - Then, talk about what the person should do in this situation.
    - Then, talk about what the person shouldn't do in this situation.
    - Use bullet points (`-`) for lists and add spacing between sections for readability.
    - Limit your answer to 200 words.
    Ask any follow up questions that may help the person or you out.
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

        # If topic fields are provided, combine them with the message.
        if request.topicId and request.description:
            # You can format the topic as you see fit. Here we concatenate them.
            topic_info = f"Topic: {request.topicId} - {request.description}"
            # If the message is empty, use the topic_info as the main message;
            # if there's already a message, append it or combine as needed.
            full_input = f"{topic_info}\nUser Query: {request.message}" if request.message.strip() else topic_info
        else:
            full_input = request.message

        # Create your context prompt using the full_input (which now may contain topic data)
        context_prompt = create_context_prompt(full_input, request.conversation_history)
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
async def transcribe_voice(request: Request):
    try:
        logger.info("Received audio data for transcription")
        
        # Get raw bytes from request body
        audio_data = await request.body()
        logger.info(f"Received {len(audio_data)} bytes of audio data")
        
        # Save the audio data to a file with proper WAV header
        with open("temp_audio.wav", "wb") as f:
            f.write(audio_data)
        
        # Verify the file exists and has content
        if not os.path.exists("temp_audio.wav"):
            raise HTTPException(status_code=500, detail="Failed to save audio file")
        
        file_size = os.path.getsize("temp_audio.wav")
        if file_size == 0:
            raise HTTPException(status_code=500, detail="Audio file is empty")
        
        logger.info(f"Saved audio file with size: {file_size} bytes")
        
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
