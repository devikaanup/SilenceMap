# Silence Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Silence Map" — an inclusive classroom discussion equity analyzer that performs diarization and interruption detection on discussion audio, maps speakers to seats, and renders dynamic seating chart heatmaps with frame-accurate audio sync and an equity summary report.

**Architecture:** Python + FastAPI modular backend (WebRTC VAD, pyannote-audio / preset ground-truth loader, 0.3s collision detector, Gini equity calculator) paired with a React (Vite) frontend (requestAnimationFrame audio sync engine, CSS radial glow seating heatmap, expanding pulse ring interruption alerts, Gini gauge equity summary).

**Tech Stack:** 
- Backend: Python 3.10+, FastAPI, Uvicorn, Pydantic v2, PyTest, NumPy, SciPy, SoundFile, Pyannote.audio
- Frontend: React 18 / 19, Vite, TailwindCSS / Vanilla CSS custom tokens, Lucide React icons

**Spec:** [2026-09-12-silence-map-design.md](file:///Users/devikaanup/Documents/everything%20coding/Silence-Map/docs/superpowers/specs/2026-09-12-silence-map-design.md)

## Global Constraints
- `MIN_INTERRUPTION_OVERLAP_SEC = 0.3` strictly enforced as a default constant.
- Frame-accurate real-time audio sync (~16ms/60fps) using `requestAnimationFrame`.
- No HuggingFace credentials on the frontend; backend reads server-side `HF_TOKEN`.
- `VoiceSnippetPlayer.jsx` operates via client-side audio seeking only (no backend slicing).
- When live diarization fails, backend returns `mode: "live_failed"` and frontend renders `ErrorState.jsx` with explicit reason.
- Priority 1 Core components must be fully built and verified end-to-end before starting Priority 2 Stretch components.
- Explicit design skills (`impeccable`, `tasteskill`, `ui ux pro max`, `emilkowalski`) applied specifically to `SeatingChart.jsx`, `SeatNode.jsx`, and `SummaryReport.jsx`.

---

## Plan Structure Overview

- **Task 1 to 6**: Backend Pipeline & Endpoints (TDD with PyTest)
- **Task 7 to 13**: Frontend Core Components & Design System (Priority 1 Core)
- **Task 14**: End-to-End System Verification (Dual-run demo check)
- **Task 15**: Stretch Additions (LorenzChart, InterruptionMatrix, TimelineBar, TakeawayCards)

---

### Task 1: Backend Foundation, Project Environment & Data Models

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/models.py`
- Test: `backend/tests/test_models.py`

**Interfaces:**
- Produces: `SpeakerSegment`, `InterruptionEvent`, `SeatAssignment`, `LorenzPoint`, `EquityMetrics`, `AnalysisResponse` Pydantic models.

- [ ] **Step 1: Write the failing model tests**

```python
# backend/tests/test_models.py
import pytest
from backend.models import SpeakerSegment, InterruptionEvent, LorenzPoint, EquityMetrics, AnalysisResponse

def test_speaker_segment_creation():
    seg = SpeakerSegment(speaker_id="SPEAKER_00", start_time=1.0, end_time=4.5, duration=3.5)
    assert seg.speaker_id == "SPEAKER_00"
    assert seg.duration == 3.5

def test_interruption_event_creation():
    event = InterruptionEvent(
        id="int_01",
        interrupter_id="SPEAKER_01",
        interrupted_id="SPEAKER_00",
        start_time=3.5,
        end_time=4.5,
        overlap_duration=1.0
    )
    assert event.interrupter_id == "SPEAKER_01"
    assert event.overlap_duration == 1.0

def test_analysis_response_structure():
    resp = AnalysisResponse(
        session_id="sess_01",
        mode="preset",
        status="success",
        audio_url="/api/audio/sample.wav",
        audio_duration=120.0,
        speakers=["SPEAKER_00", "SPEAKER_01"],
        segments=[],
        interruptions=[],
        metrics=EquityMetrics(
            total_discussion_time=120.0,
            total_speech_time=100.0,
            total_silence_time=20.0,
            gini_coefficient=0.45,
            gini_interpretation="Moderate Inequality",
            top_speakers_share_headline="1 of 2 speakers spoke 70%",
            lorenz_curve=[LorenzPoint(speaker_fraction=0.5, talk_time_fraction=0.3)],
            speaker_stats={},
            interruption_stats={}
        )
    )
    assert resp.mode == "preset"
    assert resp.metrics.gini_coefficient == 0.45
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_models.py`  
Expected: FAIL (ModuleNotFoundError: No module named 'backend')

- [ ] **Step 3: Write requirements and minimal Pydantic models**

```txt
# backend/requirements.txt
fastapi>=0.110.0
uvicorn>=0.28.0
pydantic>=2.6.0
python-multipart>=0.0.9
numpy>=1.24.0
scipy>=1.11.0
soundfile>=0.12.1
pytest>=8.0.0
httpx>=0.27.0
```

```python
# backend/models.py
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class SpeakerSegment(BaseModel):
    speaker_id: str
    start_time: float
    end_time: float
    duration: float

class InterruptionEvent(BaseModel):
    id: str
    interrupter_id: str
    interrupted_id: str
    start_time: float
    end_time: float
    overlap_duration: float

class SeatAssignment(BaseModel):
    seat_id: str
    seat_label: str
    speaker_id: Optional[str] = None

class LorenzPoint(BaseModel):
    speaker_fraction: float
    talk_time_fraction: float

class EquityMetrics(BaseModel):
    total_discussion_time: float
    total_speech_time: float
    total_silence_time: float
    gini_coefficient: float
    gini_interpretation: str
    top_speakers_share_headline: str
    lorenz_curve: List[LorenzPoint] = Field(default_factory=list)
    speaker_stats: Dict[str, Any] = Field(default_factory=dict)
    interruption_stats: Dict[str, Any] = Field(default_factory=dict)

class AnalysisResponse(BaseModel):
    session_id: str
    mode: str  # "preset" | "live" | "live_failed"
    status: str  # "success" | "error"
    audio_url: str
    audio_duration: float
    speakers: List[str]
    segments: List[SpeakerSegment]
    interruptions: List[InterruptionEvent]
    metrics: EquityMetrics
    error_code: Optional[str] = None
    error_message: Optional[str] = None
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_models.py`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat(backend): initialize models and requirements"
```

---

### Task 2: WebRTC VAD & Audio Pre-processor

**Files:**
- Create: `backend/audio_processor.py`
- Test: `backend/tests/test_audio_processor.py`

**Interfaces:**
- Produces: `ensure_wav_16k_mono(input_bytes_or_path) -> (output_path, duration_seconds)`
- Produces: `get_audio_duration(file_path) -> float`

- [ ] **Step 1: Write the failing audio processor tests**

```python
# backend/tests/test_audio_processor.py
import os
import numpy as np
import soundfile as sf
import pytest
from backend.audio_processor import ensure_wav_16k_mono, get_audio_duration

@pytest.fixture
def dummy_wav(tmp_path):
    wav_path = str(tmp_path / "test_stereo.wav")
    samplerate = 44100
    duration = 2.0
    t = np.linspace(0, duration, int(samplerate * duration), endpoint=False)
    sig = np.sin(2 * np.pi * 440 * t)
    stereo_sig = np.column_stack([sig, sig])
    sf.write(wav_path, stereo_sig, samplerate)
    return wav_path

def test_ensure_wav_16k_mono(dummy_wav, tmp_path):
    out_path = str(tmp_path / "processed_16k.wav")
    path, dur = ensure_wav_16k_mono(dummy_wav, out_path)
    assert os.path.exists(path)
    assert abs(dur - 2.0) < 0.05
    data, sr = sf.read(path)
    assert sr == 16000
    assert len(data.shape) == 1  # mono

def test_get_audio_duration(dummy_wav):
    dur = get_audio_duration(dummy_wav)
    assert abs(dur - 2.0) < 0.05
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_audio_processor.py`  
Expected: FAIL

- [ ] **Step 3: Implement `backend/audio_processor.py`**

```python
# backend/audio_processor.py
import os
import soundfile as sf
import numpy as np
from scipy.signal import resample_poly

def get_audio_duration(file_path: str) -> float:
    info = sf.info(file_path)
    return float(info.duration)

def ensure_wav_16k_mono(input_path: str, output_path: str) -> tuple[str, float]:
    data, sample_rate = sf.read(input_path)
    if len(data.shape) > 1:
        data = np.mean(data, axis=1)
    
    target_sr = 16000
    if sample_rate != target_sr:
        from math import gcd
        g = gcd(sample_rate, target_sr)
        up = target_sr // g
        down = sample_rate // g
        data = resample_poly(data, up, down)
        sample_rate = target_sr
    
    sf.write(output_path, data.astype(np.float32), target_sr, subtype='PCM_16')
    duration = float(len(data) / target_sr)
    return output_path, duration
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_audio_processor.py`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/audio_processor.py backend/tests/test_audio_processor.py
git commit -m "feat(backend): add audio processor for 16kHz mono normalization"
```

---

### Task 3: Interruption Detector with Hardcoded 0.3s Constant

**Files:**
- Create: `backend/interruption_detector.py`
- Test: `backend/tests/test_interruption_detector.py`

**Interfaces:**
- Produces: `MIN_INTERRUPTION_OVERLAP_SEC = 0.3`
- Produces: `detect_interruptions(segments: list[SpeakerSegment], min_overlap_sec: float = 0.3) -> list[InterruptionEvent]`

- [ ] **Step 1: Write the failing tests for interruption detection**

```python
# backend/tests/test_interruption_detector.py
from backend.models import SpeakerSegment
from backend.interruption_detector import detect_interruptions, MIN_INTERRUPTION_OVERLAP_SEC

def test_constant_value():
    assert MIN_INTERRUPTION_OVERLAP_SEC == 0.3

def test_detect_clear_interruption():
    segments = [
        SpeakerSegment(speaker_id="SPEAKER_00", start_time=0.0, end_time=4.0, duration=4.0),
        SpeakerSegment(speaker_id="SPEAKER_01", start_time=3.0, end_time=6.0, duration=3.0),
    ]
    interruptions = detect_interruptions(segments)
    assert len(interruptions) == 1
    event = interruptions[0]
    assert event.interrupter_id == "SPEAKER_01"
    assert event.interrupted_id == "SPEAKER_00"
    assert event.start_time == 3.0
    assert event.end_time == 4.0
    assert abs(event.overlap_duration - 1.0) < 1e-4

def test_filter_backchannel_under_threshold():
    segments = [
        SpeakerSegment(speaker_id="SPEAKER_00", start_time=0.0, end_time=4.0, duration=4.0),
        SpeakerSegment(speaker_id="SPEAKER_01", start_time=2.0, end_time=2.2, duration=0.2),
    ]
    interruptions = detect_interruptions(segments)
    assert len(interruptions) == 0

def test_same_speaker_no_interruption():
    segments = [
        SpeakerSegment(speaker_id="SPEAKER_00", start_time=0.0, end_time=2.5, duration=2.5),
        SpeakerSegment(speaker_id="SPEAKER_00", start_time=2.0, end_time=4.0, duration=2.0),
    ]
    interruptions = detect_interruptions(segments)
    assert len(interruptions) == 0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_interruption_detector.py`  
Expected: FAIL

- [ ] **Step 3: Implement `backend/interruption_detector.py`**

```python
# backend/interruption_detector.py
from typing import List
import uuid
from backend.models import SpeakerSegment, InterruptionEvent

MIN_INTERRUPTION_OVERLAP_SEC: float = 0.3

def detect_interruptions(
    segments: List[SpeakerSegment],
    min_overlap_sec: float = MIN_INTERRUPTION_OVERLAP_SEC
) -> List[InterruptionEvent]:
    interruptions: List[InterruptionEvent] = []
    sorted_segs = sorted(segments, key=lambda s: (s.start_time, s.end_time))
    n = len(sorted_segs)
    
    for i in range(n):
        seg_a = sorted_segs[i]
        for j in range(i + 1, n):
            seg_b = sorted_segs[j]
            if seg_b.start_time >= seg_a.end_time:
                break
            if seg_a.speaker_id == seg_b.speaker_id:
                continue
            
            overlap_start = max(seg_a.start_time, seg_b.start_time)
            overlap_end = min(seg_a.end_time, seg_b.end_time)
            overlap_duration = overlap_end - overlap_start
            
            if overlap_duration >= min_overlap_sec:
                if seg_b.start_time >= seg_a.start_time:
                    interrupter = seg_b.speaker_id
                    interrupted = seg_a.speaker_id
                else:
                    interrupter = seg_a.speaker_id
                    interrupted = seg_b.speaker_id
                
                event = InterruptionEvent(
                    id=f"int_{uuid.uuid4().hex[:8]}",
                    interrupter_id=interrupter,
                    interrupted_id=interrupted,
                    start_time=round(overlap_start, 3),
                    end_time=round(overlap_end, 3),
                    overlap_duration=round(overlap_duration, 3)
                )
                interruptions.append(event)
                
    return interruptions
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_interruption_detector.py`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/interruption_detector.py backend/tests/test_interruption_detector.py
git commit -m "feat(backend): implement interruption detector with 0.3s threshold"
```

---

### Task 4: Equity Metrics Engine (Gini Coefficient & Lorenz Curve)

**Files:**
- Create: `backend/equity_metrics.py`
- Test: `backend/tests/test_equity_metrics.py`

**Interfaces:**
- Produces: `calculate_gini(talk_times: list[float]) -> float`
- Produces: `compute_equity_metrics(segments: list[SpeakerSegment], interruptions: list[InterruptionEvent], total_duration: float) -> EquityMetrics`

- [ ] **Step 1: Write failing tests for Gini calculation and metrics**

```python
# backend/tests/test_equity_metrics.py
import pytest
from backend.models import SpeakerSegment, InterruptionEvent
from backend.equity_metrics import calculate_gini, compute_equity_metrics

def test_gini_equal_participation():
    times = [25.0, 25.0, 25.0, 25.0]
    gini = calculate_gini(times)
    assert abs(gini - 0.0) < 1e-4

def test_gini_extreme_inequality():
    times = [1.0, 1.0, 1.0, 97.0]
    gini = calculate_gini(times)
    assert gini > 0.70

def test_gini_formula_exact_value():
    gini = calculate_gini([10.0, 20.0, 30.0])
    assert abs(gini - 0.2222) < 0.001

def test_compute_equity_metrics_structure():
    segments = [
        SpeakerSegment(speaker_id="SPEAKER_00", start_time=0.0, end_time=40.0, duration=40.0),
        SpeakerSegment(speaker_id="SPEAKER_01", start_time=40.0, end_time=80.0, duration=40.0),
        SpeakerSegment(speaker_id="SPEAKER_02", start_time=80.0, end_time=90.0, duration=10.0),
        SpeakerSegment(speaker_id="SPEAKER_03", start_time=90.0, end_time=100.0, duration=10.0),
    ]
    interruptions = [
        InterruptionEvent(id="1", interrupter_id="SPEAKER_00", interrupted_id="SPEAKER_02", start_time=80.0, end_time=81.0, overlap_duration=1.0)
    ]
    metrics = compute_equity_metrics(segments, interruptions, total_duration=120.0)
    assert metrics.total_discussion_time == 120.0
    assert metrics.total_speech_time == 100.0
    assert metrics.total_silence_time == 20.0
    assert len(metrics.lorenz_curve) == 5
    assert "2 of 4 participants" in metrics.top_speakers_share_headline
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_equity_metrics.py`  
Expected: FAIL

- [ ] **Step 3: Implement `backend/equity_metrics.py`**

```python
# backend/equity_metrics.py
from typing import List, Dict, Any
from backend.models import SpeakerSegment, InterruptionEvent, LorenzPoint, EquityMetrics

def calculate_gini(talk_times: List[float]) -> float:
    if not talk_times or len(talk_times) <= 1:
        return 0.0
    
    x = sorted([float(t) for t in talk_times])
    n = len(x)
    total_sum = sum(x)
    if total_sum == 0:
        return 0.0
    
    weighted_sum = sum((i + 1) * val for i, val in enumerate(x))
    gini = (2.0 * weighted_sum) / (n * total_sum) - (n + 1.0) / n
    return round(float(max(0.0, min(1.0, gini))), 4)

def interpret_gini(gini: float) -> str:
    if gini < 0.20:
        return "Highly Equitable"
    elif gini < 0.35:
        return "Healthy Discussion"
    elif gini < 0.50:
        return "Moderate Inequality"
    else:
        return "Severe Participation Monopoly"

def compute_equity_metrics(
    segments: List[SpeakerSegment],
    interruptions: List[InterruptionEvent],
    total_duration: float
) -> EquityMetrics:
    speaker_durations: Dict[str, float] = {}
    for seg in segments:
        speaker_durations[seg.speaker_id] = round(speaker_durations.get(seg.speaker_id, 0.0) + seg.duration, 2)
    
    speakers = sorted(list(speaker_durations.keys()))
    total_speech_time = round(sum(speaker_durations.values()), 2)
    total_silence_time = round(max(0.0, total_duration - total_speech_time), 2)
    
    talk_times = [speaker_durations[s] for s in speakers]
    gini = calculate_gini(talk_times)
    gini_desc = interpret_gini(gini)
    
    lorenz_points: List[LorenzPoint] = [LorenzPoint(speaker_fraction=0.0, talk_time_fraction=0.0)]
    if speakers and total_speech_time > 0:
        sorted_times = sorted(talk_times)
        cum_talk = 0.0
        n_spk = len(sorted_times)
        for i, t in enumerate(sorted_times):
            cum_talk += t
            lorenz_points.append(
                LorenzPoint(
                    speaker_fraction=round((i + 1) / n_spk, 3),
                    talk_time_fraction=round(cum_talk / total_speech_time, 3)
                )
            )
            
    interruption_stats: Dict[str, Dict[str, int]] = {
        s: {"initiated": 0, "received": 0} for s in speakers
    }
    for event in interruptions:
        if event.interrupter_id in interruption_stats:
            interruption_stats[event.interrupter_id]["initiated"] += 1
        if event.interrupted_id in interruption_stats:
            interruption_stats[event.interrupted_id]["received"] += 1
            
    speaker_stats: Dict[str, Any] = {}
    for s in speakers:
        t_time = speaker_durations[s]
        pct = round((t_time / total_speech_time * 100) if total_speech_time > 0 else 0.0, 1)
        speaker_stats[s] = {
            "total_talk_time": t_time,
            "talk_time_pct": pct,
            "interruptions_initiated": interruption_stats[s]["initiated"],
            "interruptions_received": interruption_stats[s]["received"]
        }
        
    if speakers:
        sorted_by_talk = sorted(speaker_stats.items(), key=lambda item: item[1]["total_talk_time"], reverse=True)
        top_k = max(1, len(speakers) // 3)
        top_talk_pct = sum(item[1]["talk_time_pct"] for item in sorted_by_talk[:top_k])
        headline = f"{top_k} of {len(speakers)} participants accounted for {top_talk_pct:.0f}% of total speaking time."
    else:
        headline = "No speech detected."
        
    return EquityMetrics(
        total_discussion_time=round(total_duration, 2),
        total_speech_time=total_speech_time,
        total_silence_time=total_silence_time,
        gini_coefficient=gini,
        gini_interpretation=gini_desc,
        top_speakers_share_headline=headline,
        lorenz_curve=lorenz_points,
        speaker_stats=speaker_stats,
        interruption_stats=interruption_stats
    )
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_equity_metrics.py`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/equity_metrics.py backend/tests/test_equity_metrics.py
git commit -m "feat(backend): implement equity metrics engine with Gini coefficient and Lorenz points"
```

---

### Task 5: Diarization Engine (Preset Loader & Pyannote Live Runner) and Preset Datasets

**Files:**
- Create: `backend/presets/socratic_seminar.json`
- Create: `backend/presets/socratic_seminar.wav`
- Create: `backend/presets/stem_collaboration.json`
- Create: `backend/presets/stem_collaboration.wav`
- Create: `backend/diarization.py`
- Test: `backend/tests/test_diarization.py`

**Interfaces:**
- Produces: `load_preset_data(preset_id: str) -> AnalysisResponse`
- Produces: `run_live_diarization(audio_path: str, num_speakers: int | None = None) -> list[SpeakerSegment]`

- [ ] **Step 1: Write failing tests for diarization module**

```python
# backend/tests/test_diarization.py
import pytest
from backend.diarization import load_preset_data, get_available_presets, run_live_diarization

def test_get_available_presets():
    presets = get_available_presets()
    assert len(presets) >= 2
    preset_ids = [p["id"] for p in presets]
    assert "socratic_seminar" in preset_ids
    assert "stem_collaboration" in preset_ids

def test_load_preset_data_socratic():
    resp = load_preset_data("socratic_seminar")
    assert resp.mode == "preset"
    assert resp.status == "success"
    assert len(resp.speakers) == 6
    assert len(resp.segments) > 0
    assert len(resp.interruptions) > 0
    assert resp.metrics.gini_coefficient > 0.40

def test_run_live_diarization_missing_token(monkeypatch, tmp_path):
    monkeypatch.delenv("HF_TOKEN", raising=False)
    dummy_audio = str(tmp_path / "dummy.wav")
    with open(dummy_audio, "wb") as f:
        f.write(b"RIFFdummy")
    with pytest.raises(RuntimeError) as excinfo:
        run_live_diarization(dummy_audio)
    assert "HF_AUTH_REQUIRED" in str(excinfo.value) or "HF_TOKEN" in str(excinfo.value)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_diarization.py`  
Expected: FAIL

- [ ] **Step 3: Generate realistic preset WAV audio files and JSON datasets & implement `backend/diarization.py`**
- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_diarization.py`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/presets/ backend/diarization.py backend/tests/test_diarization.py
git commit -m "feat(backend): implement diarization module with preset ground truth loader and pyannote runner"
```

---

### Task 6: FastAPI REST API Endpoints & Route Tests

**Files:**
- Create: `backend/main.py`
- Test: `backend/tests/test_main.py`

**Interfaces:**
- `GET /api/health`
- `GET /api/presets`
- `POST /api/analyze/preset/{preset_id}`
- `POST /api/analyze/live`
- `GET /api/audio/{filename}`

- [ ] **Step 1: Write failing API endpoint tests**

```python
# backend/tests/test_main.py
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
    assert len(res.json()) >= 2

def test_analyze_preset():
    res = client.post("/api/analyze/preset/socratic_seminar")
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "preset"
    assert data["status"] == "success"
    assert "metrics" in data
    assert data["metrics"]["gini_coefficient"] > 0

def test_analyze_live_fails_cleanly_without_token(monkeypatch):
    monkeypatch.delenv("HF_TOKEN", raising=False)
    files = {"file": ("test.wav", b"RIFFsamplewavdata", "audio/wav")}
    res = client.post("/api/analyze/live", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "live_failed"
    assert data["status"] == "error"
    assert data["error_code"] == "HF_AUTH_REQUIRED"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_main.py`  
Expected: FAIL

- [ ] **Step 3: Implement `backend/main.py`**
- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_main.py`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/main.py backend/tests/test_main.py
git commit -m "feat(backend): add FastAPI endpoints for presets, live upload, and audio streaming"
```

---

### Task 7: Frontend Scaffolding, Design Tokens & App State

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/styles/index.css`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/main.jsx`

- [ ] **Step 1: Create React Vite app configuration and packages**
- [ ] **Step 2: Setup Vite config with API proxy & index.html**
- [ ] **Step 3: Define Design System tokens in `index.css`**
- [ ] **Step 4: Verify frontend builds cleanly**

Run: `cd frontend && npm install && npm run build`  
Expected: PASS with 0 build errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): scaffold Vite React application and design token system"
```

---

### Task 8: Ingestion Components — ModeSelector & PresetPicker (Core Priority 1)

**Files:**
- Create: `frontend/src/components/Ingestion/ModeSelector.jsx`
- Create: `frontend/src/components/Ingestion/PresetPicker.jsx`

- [ ] **Step 1: Implement `ModeSelector.jsx`**
- [ ] **Step 2: Implement `PresetPicker.jsx` with card selection and previews**
- [ ] **Step 3: Wire into `App.jsx` and test preset selection**
- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Ingestion/
git commit -m "feat(frontend): implement ModeSelector and PresetPicker components"
```

---

### Task 9: Ingestion Components — AudioUploader & ErrorState (Core Priority 1)

**Files:**
- Create: `frontend/src/components/Ingestion/AudioUploader.jsx`
- Create: `frontend/src/components/Ingestion/ErrorState.jsx`

- [ ] **Step 1: Implement `AudioUploader.jsx` with drag/drop and speaker count hint**
- [ ] **Step 2: Implement `ErrorState.jsx` displaying exact backend error code and fallback button**
- [ ] **Step 3: Test live upload error flow**
- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Ingestion/
git commit -m "feat(frontend): add AudioUploader and explicit ErrorState components"
```

---

### Task 10: Mapping Components — SeatMappingModal & VoiceSnippetPlayer (Core Priority 1)

**Files:**
- Create: `frontend/src/components/Mapping/VoiceSnippetPlayer.jsx`
- Create: `frontend/src/components/Mapping/SeatMappingModal.jsx`

- [ ] **Step 1: Implement `VoiceSnippetPlayer.jsx` (Client-side HTML5 audio seek only to `start_time`, play 3s, pause)**
- [ ] **Step 2: Implement `SeatMappingModal.jsx` with seat assignment grid and student name inputs**
- [ ] **Step 3: Verify teacher can preview voice snippets and assign seats**
- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Mapping/
git commit -m "feat(frontend): implement SeatMappingModal and client-side VoiceSnippetPlayer"
```

---

### Task 11: Audio Sync Engine & Hook (Core Priority 1)

**Files:**
- Create: `frontend/src/hooks/useAudioSync.js`
- Create: `frontend/src/components/Player/AudioSyncEngine.jsx`

- [ ] **Step 1: Implement `useAudioSync.js` with frame-accurate 60fps timestamp resolution via requestAnimationFrame**
- [ ] **Step 2: Implement `AudioSyncEngine.jsx` with playback controls (play/pause, speeds, progress bar)**
- [ ] **Step 3: Verify smooth audio sync and event dispatch**
- [ ] **Step 4: Commit**

```bash
git add frontend/src/hooks/ frontend/src/components/Player/
git commit -m "feat(frontend): implement frame-accurate audio sync engine hook and player"
```

---

### Task 12: Seating Chart Heatmap & Interruption Shockwave (Core Priority 1)

*Explicitly applying `impeccable`, `tasteskill`, `ui ux pro max`, `emilkowalski`*

**Files:**
- Create: `frontend/src/components/Visualization/SeatNode.jsx`
- Create: `frontend/src/components/Visualization/InterruptionFlash.jsx`
- Create: `frontend/src/components/Visualization/SeatingChart.jsx`

- [ ] **Step 1: Implement `SeatNode.jsx` with radial CSS glow calculations and active speaker halos**
- [ ] **Step 2: Implement `InterruptionFlash.jsx` with expanding shockwave pulse ring and cubic-bezier dissipation**
- [ ] **Step 3: Implement `SeatingChart.jsx` with seminar and grid layout presets**
- [ ] **Step 4: Verify visually in browser that heatmap dynamically builds as audio plays**
- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Visualization/
git commit -m "feat(frontend): build SeatingChart, SeatNode dynamic heatmap, and Interruption shockwave"
```

---

### Task 13: Summary Report with Headline Stat & Gini Gauge (Core Priority 1)

*Explicitly applying `impeccable`, `tasteskill`, `ui ux pro max`, `emilkowalski`*

**Files:**
- Create: `frontend/src/components/Analytics/SummaryReport.jsx`

- [ ] **Step 1: Implement `SummaryReport.jsx` with typography hierarchy, Gini gauge, and participation breakdown**
- [ ] **Step 2: Wire completion trigger at end of audio playback**
- [ ] **Step 3: Verify clean layout, high contrast, and responsive layout**
- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Analytics/
git commit -m "feat(frontend): implement SummaryReport with Gini gauge and equity stats"
```

---

### Task 14: End-to-End System Verification (Dual-Run Quality Gate)

- [ ] **Step 1: Run full automated test suite for backend**
  - Command: `pytest backend/tests/ -v`
  - Expected: 100% PASS
- [ ] **Step 2: Run frontend production build check**
  - Command: `cd frontend && npm run build`
  - Expected: 0 errors
- [ ] **Step 3: Test complete user flow twice in browser**
  - Run 1: Preset Mode -> Socratic Seminar -> Map Seats with Voice Previews -> Play audio -> Observe heatmap build & shockwave pulses -> Inspect Summary Report.
  - Run 2: Live Upload Mode -> Test live failure handling with `ErrorState.jsx` fallback.
- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: verify end-to-end system and test runs"
```

---

### Task 15: Stretch Components (Priority 2 — Executed only after Core Passes Twice)

**Files:**
- Create: `frontend/src/components/Analytics/LorenzChart.jsx`
- Create: `frontend/src/components/Analytics/InterruptionMatrix.jsx`
- Create: `frontend/src/components/Visualization/TimelineBar.jsx`
- Create: `frontend/src/components/Analytics/TakeawayCards.jsx`

- [ ] **Step 1: Implement `LorenzChart.jsx` (Visual Lorenz curve vs 45-degree perfect equality line)**
- [ ] **Step 2: Implement `InterruptionMatrix.jsx` (Who interrupted whom heatmap grid)**
- [ ] **Step 3: Implement `TimelineBar.jsx` (Interactive scrubbable speaker lanes)**
- [ ] **Step 4: Implement `TakeawayCards.jsx` (Pedagogical actionable insight cards)**
- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/
git commit -m "feat(frontend): add stretch analytics components (Lorenz curve, interruption matrix, timeline bar)"
```
