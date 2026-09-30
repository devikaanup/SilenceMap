import io
import pytest
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_get_presets():
    res = client.get("/api/presets")
    assert res.status_code == 200
    presets = res.json()
    assert len(presets) >= 2
    ids = [p["id"] for p in presets]
    assert "socratic_seminar" in ids
    assert "stem_collaboration" in ids

def test_serve_audio_preset():
    res = client.get("/api/audio/socratic_seminar.wav")
    assert res.status_code == 200
    assert res.headers["content-type"] in ["audio/wav", "audio/x-wav"]
    assert len(res.content) > 1000

def test_analyze_preset_success():
    res = client.post("/api/analyze/preset/socratic_seminar")
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "preset"
    assert data["status"] == "success"
    assert len(data["speakers"]) == 6
    assert len(data["segments"]) > 0
    assert data["metrics"]["gini_coefficient"] > 0

def test_analyze_preset_not_found():
    res = client.post("/api/analyze/preset/non_existent_id")
    assert res.status_code == 404

def test_analyze_live_fails_cleanly_without_token(monkeypatch):
    monkeypatch.delenv("HF_TOKEN", raising=False)
    
    # Generate in-memory WAV file
    sr = 16000
    t = np.linspace(0, 1.0, sr, endpoint=False)
    sig = (np.sin(2 * np.pi * 440 * t) * 0.5).astype(np.float32)
    buf = io.BytesIO()
    sf.write(buf, sig, sr, format='WAV', subtype='PCM_16')
    buf.seek(0)
    
    files = {"file": ("test.wav", buf, "audio/wav")}
    res = client.post("/api/analyze/live", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "live_failed"
    assert data["status"] == "error"
    assert data["error_code"] == "HF_AUTH_REQUIRED"
    assert "HF_TOKEN" in data["error_message"] or "HF_AUTH_REQUIRED" in data["error_message"]

def test_seat_mapping():
    payload = [
        {"seat_id": "seat_1", "seat_label": "Seat 1", "speaker_id": "SPEAKER_00", "student_name": "Alex"},
        {"seat_id": "seat_2", "seat_label": "Seat 2", "speaker_id": "SPEAKER_01", "student_name": "Maya"}
    ]
    res = client.post("/api/seat-mapping", json=payload)
    assert res.status_code == 200
    assert res.json()["mapped_count"] == 2
