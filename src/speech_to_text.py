import os
import whisper

class SpeechTranscriber:
    def __init__(self, model_size="base"):
        """
        Initializes OpenAI Whisper model.
        Model sizes: 'tiny', 'base', 'small', 'medium', 'large'.
        'base' is ideal for fast local execution without heavy VRAM.
        """
        print(f"Loading Whisper model ({model_size})...")
        self.model = whisper.load_model(model_size)
        print("Whisper model loaded successfully.")

    def transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribes audio files (.wav, .mp3, .m4a) to clean English text.
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")
            
        result = self.model.transcribe(audio_path)
        return result["text"].strip()

if __name__ == "__main__":
    # Test initialization
    transcriber = SpeechTranscriber(model_size="base")
    print("Speech-to-text module is ready.")