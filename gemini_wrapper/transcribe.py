import whisper

model = whisper.load_model("tiny.en")

def transcribe_audio(file_path):
    print("📝 Transcribing audio...")
    result = model.transcribe(file_path)
    return result["text"]
