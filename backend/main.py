import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from backend.models import AnalysisResponse, EquityMetrics, SeatAssignment
from backend.diarization import get_available_presets, load_preset_data, run_live_diarization, PRESETS_DIR
from backend.interruption_detector import detect_interruptions
from backend.equity_metrics import compute_equity_metrics
from backend.audio_processor import ensure_wav_16k_mono

app = FastAPI(title="Silence Map API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("/tmp/silence_map_uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "silence-map-api"}

@app.get("/api/presets")
def list_presets():
    return get_available_presets()

@app.api_route("/api/audio/{filename}", methods=["GET", "HEAD"])
def serve_audio(filename: str):
    # Check presets directory first
    preset_path = PRESETS_DIR / filename
    if preset_path.exists():
        return FileResponse(str(preset_path), media_type="audio/wav")
    
    # Check upload directory
    upload_path = UPLOAD_DIR / filename
    if upload_path.exists():
        return FileResponse(str(upload_path), media_type="audio/wav")
    
    raise HTTPException(status_code=404, detail="Audio file not found")

@app.post("/api/analyze/preset/{preset_id}", response_model=AnalysisResponse)
def analyze_preset(preset_id: str):
    try:
        return load_preset_data(preset_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Preset '{preset_id}' not found")

@app.post("/api/analyze/live", response_model=AnalysisResponse)
async def analyze_live(
    file: UploadFile = File(...),
    num_speakers: Optional[int] = Form(None)
):
    session_id = f"live_{uuid.uuid4().hex[:8]}"
    raw_path = UPLOAD_DIR / f"{session_id}_raw_{file.filename}"
    clean_path = UPLOAD_DIR / f"{session_id}.wav"
    
    try:
        with open(raw_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        _, duration = ensure_wav_16k_mono(str(raw_path), str(clean_path))
    except Exception as e:
        return AnalysisResponse(
            session_id=session_id,
            mode="live_failed",
            status="error",
            audio_url="",
            audio_duration=0.0,
            speakers=[],
            segments=[],
            interruptions=[],
            metrics=EquityMetrics(
                total_discussion_time=0.0,
                total_speech_time=0.0,
                total_silence_time=0.0,
                gini_coefficient=0.0,
                gini_interpretation="N/A",
                top_speakers_share_headline="Audio Processing Failed"
            ),
            error_code="AUDIO_DECODE_FAILED",
            error_message=f"Failed to process audio format: {str(e)}"
        )

    # Execute Diarization with explicit failure handling
    try:
        segments = run_live_diarization(str(clean_path), num_speakers=num_speakers)
        interruptions = detect_interruptions(segments)
        metrics = compute_equity_metrics(segments, interruptions, duration)
        speakers = sorted(list({s.speaker_id for s in segments}))
        
        return AnalysisResponse(
            session_id=session_id,
            mode="live",
            status="success",
            audio_url=f"/api/audio/{session_id}.wav",
            audio_duration=duration,
            speakers=speakers,
            segments=segments,
            interruptions=interruptions,
            metrics=metrics
        )
    except RuntimeError as e:
        err_msg = str(e)
        code = "HF_AUTH_REQUIRED" if "HF_AUTH_REQUIRED" in err_msg else "DIARIZATION_FAILED"
        return AnalysisResponse(
            session_id=session_id,
            mode="live_failed",
            status="error",
            audio_url=f"/api/audio/{session_id}.wav",
            audio_duration=duration,
            speakers=[],
            segments=[],
            interruptions=[],
            metrics=EquityMetrics(
                total_discussion_time=duration,
                total_speech_time=0.0,
                total_silence_time=duration,
                gini_coefficient=0.0,
                gini_interpretation="N/A",
                top_speakers_share_headline="Live Analysis Failed"
            ),
            error_code=code,
            error_message=err_msg
        )

@app.post("/api/seat-mapping")
def save_seat_mapping(assignments: List[SeatAssignment]):
    return {
        "status": "success",
        "mapped_count": len([a for a in assignments if a.speaker_id is not None]),
        "assignments": [a.model_dump() for a in assignments]
    }
