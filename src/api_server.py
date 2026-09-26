import sys
import os
import shutil
from pathlib import Path

# Ensure the current directory (src/) is in Python's search path
sys.path.append(str(Path(__file__).resolve().parent))

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from text_parser import english_to_gloss
from gloss_indexer import How2SignIndexer
from speech_to_text import SpeechTranscriber

app = FastAPI(title="English to SASL Translation API")

# Enable CORS so web_avatar/index.html can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize modules
indexer = How2SignIndexer()
transcriber = None  # Lazy-loaded on Google Colab

class TextPayload(BaseModel):
    text: str

@app.get("/")
def home():
    return {"status": "online", "message": "English-to-SASL Translation API is active"}

@app.post("/translate_text")
def translate_text(payload: TextPayload):
    """Processes typed English text into Glosses and keypoint mappings."""
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Empty text input")
        
    glosses = english_to_gloss(payload.text)
    
    # Retrieve keypoints for each Gloss
    keypoint_matches = {}
    for gloss in glosses:
        clip_name = indexer.find_clip_for_gloss(gloss)
        keypoint_matches[gloss] = clip_name
        
    return {
        "original_text": payload.text,
        "glosses": glosses,
        "keypoint_matches": keypoint_matches
    }

@app.post("/transcribe_audio")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribes uploaded spoken audio via Whisper and returns Glosses."""
    global transcriber
    if transcriber is None:
        transcriber = SpeechTranscriber(model_size="base")
        
    temp_audio_path = f"temp_{file.filename}"
    with open(temp_audio_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        transcribed_text = transcriber.transcribe_audio(temp_audio_path)
        glosses = english_to_gloss(transcribed_text)
        
        os.remove(temp_audio_path)
        return {
            "transcribed_text": transcribed_text,
            "glosses": glosses
        }
    except Exception as e:
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        raise HTTPException(status_code=500, detail=str(e))