import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.models import SpeakerSegment, AnalysisResponse
from backend.interruption_detector import detect_interruptions
from backend.equity_metrics import compute_equity_metrics

PRESETS_DIR = Path(__file__).parent / "presets"

def get_available_presets() -> List[Dict[str, Any]]:
    presets = []
    if PRESETS_DIR.exists():
        for json_file in sorted(PRESETS_DIR.glob("*.json")):
            try:
                with open(json_file, "r") as f:
                    data = json.load(f)
                    presets.append({
                        "id": data.get("id", json_file.stem),
                        "title": data.get("title", json_file.stem.replace("_", " ").title()),
                        "description": data.get("description", ""),
                        "speaker_count": data.get("speaker_count", len(data.get("segments", []))),
                        "audio_duration": data.get("audio_duration", 0.0),
                        "audio_file": data.get("audio_file", f"{json_file.stem}.wav")
                    })
            except Exception:
                continue
    return presets

def load_preset_data(preset_id: str) -> AnalysisResponse:
    json_path = PRESETS_DIR / f"{preset_id}.json"
    if not json_path.exists():
        raise FileNotFoundError(f"Preset '{preset_id}' not found.")
    
    with open(json_path, "r") as f:
        data = json.load(f)
    
    segments = [SpeakerSegment(**seg) for seg in data["segments"]]
    duration = float(data.get("audio_duration", 100.0))
    audio_file = data.get("audio_file", f"{preset_id}.wav")
    
    # Run interruption detection using strict 0.3s rule
    interruptions = detect_interruptions(segments)
    
    # Compute equity metrics (Gini, Lorenz curve, summary stats)
    metrics = compute_equity_metrics(segments, interruptions, duration)
    
    speakers = sorted(list({s.speaker_id for s in segments}))
    
    return AnalysisResponse(
        session_id=f"preset_{preset_id}",
        mode="preset",
        status="success",
        audio_url=f"/api/audio/{audio_file}",
        audio_duration=duration,
        speakers=speakers,
        segments=segments,
        interruptions=interruptions,
        metrics=metrics
    )

def run_live_diarization(audio_path: str, num_speakers: Optional[int] = None) -> List[SpeakerSegment]:
    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        raise RuntimeError("HF_AUTH_REQUIRED: HuggingFace access token not configured in server environment variable HF_TOKEN.")
    
    try:
        import torch
        from pyannote.audio import Pipeline
    except ImportError:
        raise RuntimeError("DIARIZATION_DEPENDENCY_MISSING: pyannote.audio is not installed on this host.")
        
    try:
        try:
            pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1", token=hf_token)
        except TypeError:
            pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1", use_auth_token=hf_token)
        if torch.cuda.is_available():
            pipeline.to(torch.device("cuda"))
        elif torch.backends.mps.is_available():
            pipeline.to(torch.device("mps"))
            
        kwargs = {}
        if num_speakers is not None and num_speakers > 0:
            kwargs["num_speakers"] = num_speakers
            
        diarization = pipeline(audio_path, **kwargs)
        
        segments: List[SpeakerSegment] = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            start = round(float(turn.start), 3)
            end = round(float(turn.end), 3)
            dur = round(end - start, 3)
            if dur > 0.1:
                segments.append(SpeakerSegment(speaker_id=speaker, start_time=start, end_time=end, duration=dur))
                
        return segments
    except Exception as e:
        raise RuntimeError(f"DIARIZATION_FAILED: {str(e)}")
