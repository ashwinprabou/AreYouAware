import sounddevice as sd
from scipy.io.wavfile import write

def record_to_wav(filename="gm.wav", duration=30, fs=16000):
    print(f"🎙️ Recording for {duration} seconds...")
    audio = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='int16')
    sd.wait()
    write(filename, fs, audio)
    print(f"💾 Saved as {filename}")
