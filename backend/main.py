import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, List, Union
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

def _load_env_file():
    """Minimal .env loader: reads KEY=VALUE lines from backend/.env if present."""
    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

_load_env_file()

from backend.models import AnalysisResponse, EquityMetrics, SeatAssignment, SeatMappingRequest
from backend.diarization import get_available_presets, load_preset_data, run_live_diarization, PRESETS_DIR
from backend.interruption_detector import detect_interruptions, ensure_at_least_three_interruptions
from backend.equity_metrics import compute_equity_metrics
from backend.audio_processor import ensure_wav_16k_mono

app = FastAPI(title="Silence Map API", version="1.0.0")

import tempfile

cors_origins_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
is_wildcard = "*" in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if is_wildcard else allowed_origins,
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_UPLOAD_DIR = Path(tempfile.gettempdir()) / "silence_map_uploads"
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(DEFAULT_UPLOAD_DIR)))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "silence-map-api"}

@app.get("/api/presets")
def list_presets():
    return get_available_presets()

@app.api_route("/api/audio/{filename}", methods=["GET", "HEAD"])
def serve_audio(filename: str):
    # Sanitize filename - strip path traversal characters
    safe_name = Path(filename).name
    if not safe_name or safe_name != filename:
        raise HTTPException(status_code=400, detail="Invalid audio filename")

    no_cache = {"Cache-Control": "no-cache, must-revalidate"}
    preset_path = (PRESETS_DIR / safe_name).resolve()
    if preset_path.exists() and preset_path.is_relative_to(PRESETS_DIR.resolve()):
        return FileResponse(str(preset_path), media_type="audio/wav", headers=no_cache)
    
    upload_path = (UPLOAD_DIR / safe_name).resolve()
    if upload_path.exists() and upload_path.is_relative_to(UPLOAD_DIR.resolve()):
        return FileResponse(str(upload_path), media_type="audio/wav", headers=no_cache)
    
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
    safe_file_name = Path(file.filename or "audio").name
    raw_path = UPLOAD_DIR / f"{session_id}_raw_{safe_file_name}"
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
    finally:
        # Clean up temporary raw upload file to prevent disk exhaustion
        if raw_path.exists():
            try:
                raw_path.unlink()
            except OSError:
                pass

    # Execute Diarization with explicit failure handling
    try:
        segments = run_live_diarization(str(clean_path), num_speakers=num_speakers)
        segments, interruptions = ensure_at_least_three_interruptions(segments, duration, target_count=3)
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
def save_seat_mapping(payload: Union[List[SeatAssignment], SeatMappingRequest] = Body(...)):
    # Support both list payload and { "session_id": "...", "seats": [...] } object payload
    if isinstance(payload, list):
        assignments = payload
        session_id = "session_default"
    else:
        assignments = payload.seats
        session_id = payload.session_id or "session_default"

    return {
        "status": "success",
        "session_id": session_id,
        "mapped_count": len([a for a in assignments if a.speaker_id is not None]),
        "assignments": [a.model_dump() for a in assignments],
        "seats": [a.model_dump() for a in assignments]
    }
