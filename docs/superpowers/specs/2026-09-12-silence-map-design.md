# Silence Map: System Design & Specification

**Date:** 2026-09-12  
**Problem Statement:** Inclusive Technology (Hackathon Submission)  
**Goal:** Classroom discussion equity analyzer & real-time seating chart heatmap visualizer.

---

## 1. System Overview & Core User Flow

Silence Map detects speech participation and interruptions from classroom/discussion audio, maps speakers to physical seats, and visualizes talk-time intensity over a dynamic seating chart heatmap in frame-accurate real-time sync with audio playback. At the end of the session, it delivers an Equity Summary Report with a formal Gini participation inequality score.

### User Flow
1. **Ingestion & Mode Selection**:
   - **Preset Mode (Default / Demo)**: Select from curated realistic classroom discussions (e.g. *Socratic Seminar*, *Collaborative STEM*) with ground-truth pre-computed diarization for instant, fail-safe judging.
   - **Live Upload Mode**: Upload custom audio (`.wav`, `.mp3`, `.m4a`). The backend executes WebRTC VAD + `pyannote-audio` using a server-side `HF_TOKEN` environment variable. If processing fails, an explicit error state (`mode: "live_failed"`) is returned and displayed via `ErrorState.jsx` without masking.
2. **Speaker-to-Seat Assignment**:
   - Detected speaker IDs (`SPEAKER_00`, `SPEAKER_01`, etc.) are mapped to classroom seats on a layout grid.
   - Teachers can click **"Play Voice Sample"** (`VoiceSnippetPlayer`) on any speaker. This performs a purely client-side seek on the already loaded `audio_url` to that speaker's first segment `start_time`, plays for ~3 seconds, and pauses (no backend audio slicing required).
3. **Synchronized Playback Theater**:
   - Audio plays with frame-accurate real-time sync (~60fps `requestAnimationFrame`).
   - Seats glow with dynamic radial heat intensity proportional to accumulated speaking time.
   - When an interruption occurs, a single, clean expanding shockwave pulse ring triggers on the interrupter's seat.
4. **Equity Intelligence Summary**:
   - Headline stat (e.g., *"2 of 8 students accounted for 64% of total speaking time"*).
   - Formally computed Gini inequality coefficient (0.0 to 1.0) with an intuitive equity gauge.
   - Total talk-time breakdown per student.

---

## 2. Technical Architecture & Component Breakdown

### Backend (Python / FastAPI)
- **`main.py`**: REST API endpoints:
  - `GET /api/health`
  - `GET /api/presets`
  - `POST /api/analyze/preset/{preset_id}`
  - `POST /api/analyze/live` (accepts audio file + optional `num_speakers` hint)
  - `POST /api/seat-mapping`
  - `GET /api/audio/{filename}` (serves audio streams for playback & client-side snippet seeking)
- **`audio_processor.py`**: Converts audio to 16kHz mono WAV, applies WebRTC Voice Activity Detection (VAD) to clean audio intervals.
- **`diarization.py`**:
  - `run_live_diarization(audio_path, num_speakers=None)`: Integrates `pyannote/speaker-diarization-3.1` using `os.getenv("HF_TOKEN")`. Returns explicitly typed errors on auth/model failures.
  - `load_preset_diarization(preset_id)`: Loads ground-truth validated diarization data for preset audio files. Explicitly returns `mode: "preset"`.
- **`interruption_detector.py`**:
  - `detect_interruptions(segments, min_overlap=0.3)`:
    - Scans all overlapping segment pairs $(S_A, S_B)$ where $S_A.\text{speaker} \neq S_B.\text{speaker}$.
    - Overlap condition: $\max(S_A.\text{start}, S_B.\text{start}) < \min(S_A.\text{end}, S_B.\text{end})$.
    - Attribution: Interrupter is the speaker whose turn began second ($\arg\max(\text{start})$).
    - Threshold: Strict constant `MIN_INTERRUPTION_OVERLAP_SEC = 0.3` (tested to filter backchannel affirmations like "yeah", "uh-huh").
- **`equity_metrics.py`**:
  - Calculates total speak time per speaker.
  - Gini Coefficient:
    $$\text{Gini} = \frac{2 \sum_{i=1}^n i \cdot x_i}{n \sum_{i=1}^n x_i} - \frac{n+1}{n} \quad (x_1 \le x_2 \le \dots \le x_n)$$
  - Lorenz Curve data points: $[(\text{speaker\_fraction}_i, \text{talk\_time\_fraction}_i)]$.
  - Interruption count per speaker (initiated vs received).
  - Top speakers dominance headline.
- **`models.py`**: Pydantic data schemas.

### Frontend (React + Vite)
- **Priority 1: Core Components (Demo-Critical — Built & Tested First)**:
  1. `ModeSelector.jsx`: Toggle between Curated Presets and Live Audio Upload.
  2. `PresetPicker.jsx`: Visual cards for pre-loaded discussion datasets.
  3. `AudioUploader.jsx`: Drag-and-drop audio file uploader (no frontend credentials needed).
  4. `ErrorState.jsx`: Explicit error display when live diarization fails (reveals exact backend `error_code` and resolution guidance).
  5. `SeatMappingModal.jsx` + `VoiceSnippetPlayer.jsx`: Map detected speakers to seats with instant client-side audio sample previews (seeks current audio to `start_time`, plays 3s).
  6. `SeatingChart.jsx` + `SeatNode.jsx`: High-polish classroom layout with dynamic CSS radial glow heatmap transitions. *(Explicitly applying `impeccable`, `tasteskill`, `ui ux pro max`, and `emilkowalski`)*.
  7. `InterruptionFlash.jsx`: Single clean visual treatment — expanding shockwave pulse ring on the interrupter's seat.
  8. `AudioSyncEngine.jsx` + `useAudioSync.js`: Frame-accurate real-time audio sync hook via `requestAnimationFrame` polling `audio.currentTime`.
  9. `SummaryReport.jsx`: Headline stat + Gini coefficient gauge + speaker breakdown table. *(Explicitly applying `impeccable`, `tasteskill`, `ui ux pro max`, and `emilkowalski`)*.

- **Priority 2: Stretch Components (Built only after Core is verified)**:
  1. `LorenzChart.jsx`: Visual Lorenz curve plot.
  2. `InterruptionMatrix.jsx`: Matrix showing who interrupted whom.
  3. `TimelineBar.jsx`: Interactive scrubbable speaker segment lane bar.
  4. `TakeawayCards.jsx`: AI/Pedagogical equity takeaways.

### Explicit Design Skills Application & Guidance
- **`impeccable`**: Spacing architecture, dark slate palette contrast ratios, structured visual hierarchy, eliminating cognitive friction.
- **`tasteskill` (anti-slop frontend)**: High-end typography pairings (Inter / JetBrains Mono), custom CSS radial gradients for glow intensity, intentional micro-interactions.
- **`ui ux pro max`**: State ergonomics (idle, loading, playing, paused, error), keyboard navigation, accessible color contrast.
- **`emilkowalski`**: Physics-inspired cubic-bezier easing (`cubic-bezier(0.16, 1, 0.3, 1)`), smooth 60fps glow transitions without layout thrashing, natural shockwave dissipation.

---

## 3. Data Schemas & API Contract

### `AnalysisResponse`
```json
{
  "session_id": "sess_socratic_01",
  "mode": "preset",
  "status": "success",
  "audio_url": "/api/audio/socratic_seminar.wav",
  "audio_duration": 184.5,
  "speakers": ["SPEAKER_00", "SPEAKER_01", "SPEAKER_02", "SPEAKER_03", "SPEAKER_04", "SPEAKER_05"],
  "segments": [
    { "speaker_id": "SPEAKER_00", "start_time": 0.0, "end_time": 4.2, "duration": 4.2 },
    { "speaker_id": "SPEAKER_01", "start_time": 3.8, "end_time": 8.5, "duration": 4.7 }
  ],
  "interruptions": [
    {
      "id": "int_01",
      "interrupter_id": "SPEAKER_01",
      "interrupted_id": "SPEAKER_00",
      "start_time": 3.8,
      "end_time": 4.2,
      "overlap_duration": 0.4
    }
  ],
  "metrics": {
    "total_discussion_time": 184.5,
    "total_speech_time": 162.3,
    "total_silence_time": 22.2,
    "gini_coefficient": 0.58,
    "gini_interpretation": "High Inequality",
    "top_speakers_share_headline": "2 of 6 participants accounted for 68% of total speaking time",
    "lorenz_curve": [
      { "speaker_fraction": 0.0, "talk_time_fraction": 0.0 },
      { "speaker_fraction": 0.17, "talk_time_fraction": 0.03 },
      { "speaker_fraction": 0.33, "talk_time_fraction": 0.08 },
      { "speaker_fraction": 0.50, "talk_time_fraction": 0.18 },
      { "speaker_fraction": 0.67, "talk_time_fraction": 0.32 },
      { "speaker_fraction": 0.83, "talk_time_fraction": 0.62 },
      { "speaker_fraction": 1.0, "talk_time_fraction": 1.0 }
    ],
    "speaker_stats": {
      "SPEAKER_00": { "total_talk_time": 58.2, "talk_time_pct": 35.8, "interruptions_initiated": 4, "interruptions_received": 1 },
      "SPEAKER_01": { "total_talk_time": 52.1, "talk_time_pct": 32.1, "interruptions_initiated": 3, "interruptions_received": 2 }
    }
  }
}
```

---

## 4. Verification & Testing Strategy

1. **Backend Unit Tests**:
   - `test_interruption_detector`: Verify $0.3$s threshold filters brief overlaps (<0.3s) and flags true collisions ($>0.3$s) with correct interrupter attribution.
   - `test_gini_calculation`: Verify Gini returns $0.0$ for identical values, $\approx 0.75+$ for skewed distributions, matching manual mathematical checks.
   - `test_preset_endpoint`: Verify ground-truth preset loading returns `mode: "preset"` with valid audio URLs and segments.
   - `test_live_error_handling`: Verify clean JSON error response when HF token is missing/invalid.
2. **Frontend End-to-End Verification**:
   - Test preset selection $\to$ client-side voice sample previews $\to$ seat assignment $\to$ frame-accurate real-time heatmap playback $\to$ interruption shockwave pulse $\to$ summary report generation.
   - Verify error modal displays clearly if `mode: "live_failed"`.
