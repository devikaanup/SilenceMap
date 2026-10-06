# Silence Map 🎙️🗺️

> **Classroom Discussion Equity Intelligence & Real-Time Seating Heatmap Visualizer**  
> *Transforming multi-speaker classroom dialogue into actionable participation telemetry, mathematical equity metrics, and frame-accurate seating heatmaps.*

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed%20Live-black?style=flat&logo=vercel)](https://silencemap.vercel.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-blue?style=flat&logo=python)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.5+-EE4C2C?style=flat&logo=pytorch)](https://pytorch.org)
[![PyAnnote](https://img.shields.io/badge/PyAnnote-3.1-orange?style=flat)](https://github.com/pyannote/pyannote-audio)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Pytest](https://img.shields.io/badge/Pytest-30%2F30%20Passing-brightgreen?style=flat&logo=pytest)](https://pytest.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [System Architecture & Dataflow](#-system-architecture--dataflow)
- [Key Features](#-key-features)
  - [1. Real-Time Seating Heatmap Theater](#1--real-time-seating-heatmap-theater)
  - [2. Sub-16ms Synchronized Audio Engine](#2--sub-16ms-synchronized-audio-engine)
  - [3. Mathematical Equity Intelligence](#3--mathematical-equity-intelligence)
  - [4. Neural Diarization & Collision Detection](#4--neural-diarization--collision-detection)
  - [5. Teacher Voice Mapping & Desk Customization](#5--teacher-voice-mapping--desk-customization)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [Hugging Face Neural Diarization (Optional)](#3-hugging-face-neural-diarization-optional)
- [Interactive Navigation & Hotkeys](#-interactive-navigation--hotkeys)
- [REST API Specification](#-rest-api-specification)
- [Mathematical Rigor & Formulations](#-mathematical-rigor--formulations)
- [Repository Structure](#-repository-structure)
- [Automated Verification & Tests](#-automated-verification--tests)
- [Curated Datasets](#-curated-datasets)
- [Pedagogical Impact](#-pedagogical-impact)
- [License](#-license)

---

## 💡 Executive Summary

In collaborative classrooms, Harkness discussions, and seminar circles, conversational equity is rarely balanced. A vocal minority often dominates the floor while quieter students are interrupted or systematically disengage. Educators striving for equitable classroom culture are forced to rely on subjective intuition rather than verifiable data.

**Silence Map** solves this problem by turning multi-speaker acoustic recordings into **high-resolution spatial intelligence**:
1. **Identifies Who Speaks**: Neural diarization partitions speech into distinct speaker timestamps.
2. **Maps Where They Sit**: Projects individual speech telemetry onto customizable virtual seating layouts (Seminar U-Shape or Desk Grids).
3. **Measures Balance Objectively**: Computes the **Gini Equity Index ($G$)**, generates interactive **Lorenz Equity Curves**, and builds an **$N \times N$ Interruption Direction Matrix**.
4. **Detects Conversational Collisions**: Visualizes overlapping speech (>0.5s) with real-time shockwave rings and directional collision telemetry.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONT OF CLASSROOM / WHITEBOARD                 │
│                                                                        │
│     [ Seat 1: Alex ]          [ Seat 2: Maya ]       [ Seat 3: Sam ]   │
│        (42s Talk)                (38s Talk)             (12s Talk)     │
│       🔥 68% Heat               🔥 62% Heat            🟣 15% Heat     │
│                                                                        │
│   [ Seat 5: Chloe ]                 DISCUSSION       [ Seat 6: David ] │
│      (18s Talk)                       FLOOR             (4s Talk)      │
│      🟣 25% Heat                                        ⚪ Quiet       │
│                                                                        │
│                 [ Seat 4: Elena ] (2s Talk, ⚪ Quiet)                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture & Dataflow

Silence Map operates on a modern, decoupled architecture connecting a high-throughput Python FastAPI analytical engine to a React/Vite visualization client:

```text
               ┌──────────────────────────────────────────────────────────┐
               │              AUDIO INGESTION & DISCOVERY                 │
               │   • Curated Ground-Truth Presets (WAV + JSON)            │
               │   • Live Classroom Audio Upload (WAV / MP3 / M4A / WebM) │
               │   • Real-Time Web Audio API Mic Monitoring               │
               └────────────────────────────┬─────────────────────────────┘
                                            │
                                            ▼
               ┌──────────────────────────────────────────────────────────┐
               │                 BACKEND FASTAPI ENGINE                   │
               │                                                          │
               │  [audio_processor.py]                                    │
               │  ├── 16kHz mono normalization via ffmpeg / torchaudio    │
               │  └── Accurate duration extraction                        │
               │                                                          │
               │  [diarization.py]                                        │
               │  ├── PyAnnote 3.1 neural speaker clustering              │
               │  └── Deterministic fallback loaders                      │
               │                                                          │
               │  [interruption_detector.py]                              │
               │  ├── 0.5s temporal overlap collision detection          │
               │  └── Interruption event extraction and analytics         │
               │                                                          │
               │  [equity_metrics.py]                                     │
               │  ├── Gini coefficient (G) & Lorenz curve coordinates     │
               │  ├── Per-speaker talk time % and dominant speaker ratios │
               │  └── N x N directional interruption matrix               │
               └────────────────────────────┬─────────────────────────────┘
                                            │ REST API JSON Contract
                                            ▼
               ┌──────────────────────────────────────────────────────────┐
               │               FRONTEND REACT 18 + VITE CLIENT            │
               │                                                          │
               │  [useAudioSync Hook]                                     │
               │  ├── requestAnimationFrame (~16ms display cadence)       │
               │  └── Synchronized current_time & active_speaker mapping  │
               │                                                          │
               │  [SeatingChart.jsx]                                      │
               │  ├── Seminar U-Shape / Grid layouts                      │
               │  ├── Proportional radial heat glow                       │
               │  └── <InterruptionFlash /> expanding shockwave rings     │
               │                                                          │
               │  [EquityReport.jsx]                                      │
               │  ├── Interactive SVG Lorenz Curve with 45° equality line │
               │  ├── Color-coded N x N Interruption Matrix heatmap       │
               │  └── Algorithmic pedagogical coaching takeaways          │
               └──────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. 💺 Real-Time Seating Heatmap Theater
- **Proportional Heat Glow**: Real-time luminance gradients reflect cumulative speaking duration relative to the session's most vocal participant.
- **Dual Topologies**: Switch dynamically between an intimate **Seminar U-Shape** (polar coordinates) and a multi-row **Classroom Desk Grid** (cartesian coordinates).
- **Interruption Shockwaves**: When overlapping speech occurs, an expanding electric-red (`#FF0033`) shockwave ring renders directly around the interrupter and interrupted desk nodes.
- **Live Sound Frequency Meter**: Built-in Web Audio API frequency visualizer and volume meter for real-time classroom monitoring.

### 2. ⚡ Sub-16ms Synchronized Audio Engine
- Avoids the 250ms stutter of standard HTML5 `ontimeupdate` events by utilizing an optimized **`requestAnimationFrame`** rendering loop running at 60Hz.
- Desktop and mobile touch-friendly timeline scrub bar with colored speech segments and collision markers.
- **Global Keyboard Hotkeys**:
  - <kbd>Space</kbd>: Play / Pause toggle
  - <kbd>←</kbd> / <kbd>→</kbd>: Seek ±5 seconds backward / forward
  - <kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd> / <kbd>4</kbd>: Adjust playback speed (`1.0x`, `1.25x`, `1.5x`, `2.0x`)
  - <kbd>R</kbd>: Restart playback from beginning

### 3. 📊 Mathematical Equity Intelligence
- **Gini Equity Index ($G$)**: Mathematically rigorous coefficient assessing conversational distribution.
- **Lorenz Equity Curve**: Visualizes cumulative talk time percentiles plotted against the theoretical 45° line of absolute equality.
- **$N \times N$ Interruption Matrix**: Directional matrix documenting exactly who interrupted whom, total collision counts, and average collision length.
- **Actionable Pedagogical Takeaways**: Automated insight cards targeting:
  - *Quiet Student Spotlight*: Identifies participants speaking $<10\%$ of median talk time.
  - *Dominant Speaker Coaching*: Flags speakers holding $>35\%$ of total session floor time.
  - *Discussion Flow Recommendations*: Prescribes actionable strategies (e.g., Think-Pair-Share, Harkness tracking).

### 4. 🧠 Neural Diarization & Collision Detection
- Powered by **PyAnnote 3.1** running locally on Apple Silicon (MPS), NVIDIA CUDA, or CPU.
- **High-Precision Collision Analytics**: Detects natural conversational overlaps ($\ge 0.5\text{s}$) across speaker boundaries, maintaining synchronized timeline markers, seating shockwaves, and equity report metrics in 100% mathematical alignment.

### 5. 🎧 Teacher Voice Mapping & Desk Customization
- **3-Second Isolated Voice Snippets**: Educators can click any speaker node to preview their distinct voice before mapping.
- **Desk Assignment**: Effortlessly assign physical student names (e.g., "Alex", "Maya") to anonymized cluster IDs (`SPEAKER_00`, `SPEAKER_01`).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Python 3.11 or 3.12 recommended)
- **Node.js 18+** & `npm`
- **ffmpeg** (Optional, recommended for transcoding audio uploads)

---

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/devikaanup/SilenceMap.git
cd SilenceMap

# Create and activate Python virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate    # On Windows: backend\venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Launch FastAPI development server
uvicorn backend.main:app --port 8000 --host 0.0.0.0 --reload
```
*Backend runs on `http://localhost:8000`. Swagger API documentation is available at `http://localhost:8000/docs`.*

---

### 2. Frontend Setup

In a separate terminal window:

```bash
cd SilenceMap/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev -- --host 0.0.0.0 --port 5173
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

### 3. Hugging Face Neural Diarization (Optional)

To enable live local neural diarization via PyAnnote 3.1:
1. Accept the user conditions on Hugging Face for [pyannote/speaker-diarization-3.1](https://huggingface.co/pyannote/speaker-diarization-3.1) and [pyannote/segmentation-3.0](https://huggingface.co/pyannote/segmentation-3.0).
2. Generate an access token on Hugging Face (Read permissions are sufficient).
3. Create a `backend/.env` file:
   ```bash
   HF_TOKEN=hf_your_token_here
   ```
*Note: If no Hugging Face token is provided, Silence Map automatically uses precomputed high-fidelity diarization presets.*

---

## 🔗 Interactive Navigation & Hotkeys

| Environment | Endpoint / URL | Purpose |
| :--- | :--- | :--- |
| **Production (Vercel)** | **[`https://silencemap.vercel.app/`](https://silencemap.vercel.app/)** | Live Production Editorial Landing Page & Gaze-Tracking Hero |
| **Production (Vercel)** | **[`https://silencemap.vercel.app/app`](https://silencemap.vercel.app/app)** | Live Production Silence Map 4-Stage Theater & Equity Dashboard |
| **Production (Vercel)** | **[`https://silencemap.vercel.app/api/presets`](https://silencemap.vercel.app/api/presets)** | Serverless Production Presets API |
| **Local Dev** | **`http://localhost:5173/`** | Local Development Landing Page |
| **Local Dev** | **`http://localhost:5173/app`** | Local Development Silence Map Theater |
| **Local Backend** | **`http://localhost:8000/api/health`** | Local Backend FastAPI Health Check |
| **Local Backend** | **`http://localhost:8000/docs`** | Interactive OpenAPI / Swagger UI |

### Keyboard Shortcuts (Theater Playback)

| Key | Action |
| :---: | :--- |
| <kbd>Space</kbd> | Toggle Play / Pause |
| <kbd>←</kbd> | Scrub backward 5 seconds |
| <kbd>→</kbd> | Scrub forward 5 seconds |
| <kbd>1</kbd> | Set playback speed to `1.0x` |
| <kbd>2</kbd> | Set playback speed to `1.25x` |
| <kbd>3</kbd> | Set playback speed to `1.5x` |
| <kbd>4</kbd> | Set playback speed to `2.0x` |
| <kbd>R</kbd> | Restart audio playback from 0:00 |

---

## 📡 REST API Specification

### `GET /api/health`
Health check verifying server uptime and version.
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

### `GET /api/presets`
Lists all available curated discussion datasets.
```json
[
  {
    "id": "socratic_seminar",
    "name": "High School Socratic Seminar",
    "description": "6 students discussing Hamlet with dominant speaker imbalance.",
    "duration": 72.64,
    "speaker_count": 6
  },
  {
    "id": "stem_collaboration",
    "name": "Collaborative STEM Lab",
    "description": "4 students reviewing lab experiment data equitably.",
    "duration": 51.6,
    "speaker_count": 4
  }
]
```

---

### `POST /api/analyze/preset`
Runs analytical telemetry on a preset dataset.
- **Request Body**: `{"preset_id": "socratic_seminar"}`
- **Response**: Full `AnalysisResponse` object containing:
  - `segments`: Array of `{speaker_id, start_time, end_time, duration}`
  - `interruptions`: Array of collision events `{interrupter_id, interrupted_id, start_time, end_time, overlap_duration}`
  - `metrics`: Object containing Gini score, Lorenz coordinates, and interruption statistics.

---

### `POST /api/analyze/live`
Performs end-to-end diarization and analytics on an uploaded audio file.
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body**: `file: <binary audio data>` (WAV, MP3, M4A, WebM)
- **Response**: Structured `AnalysisResponse` with synchronized timeline, collision events, and seating heat telemetry.

---

### `POST /api/seat-mapping`
Updates student names and desk coordinates.
- **Request Body**:
  ```json
  {
    "session_id": "socratic_seminar",
    "seats": [
      {"speaker_id": "SPEAKER_00", "label": "Alex", "seat_index": 0},
      {"speaker_id": "SPEAKER_01", "label": "Maya", "seat_index": 1}
    ]
  }
  ```

---

## 📐 Mathematical Rigor & Formulations

### 1. Gini Inequality Coefficient ($G$)
Silence Map computes the relative mean difference across all speaker durations:

$$G = \frac{\sum_{i=1}^n \sum_{j=1}^n |x_i - x_j|}{2n \sum_{i=1}^n x_i}$$

Where:
- $n$ is the total count of recognized speakers.
- $x_i, x_j$ represent the cumulative speaking duration of speaker $i$ and $j$.
- Range: $0.00$ (perfect equality) to $1.00$ (complete monopoly).

### 2. Lorenz Curve Discretization
Given sorted cumulative talk time array $X = [x_{(1)}, x_{(2)}, \dots, x_{(n)}]$:
- Cumulative population share: $p_k = \frac{k}{n}$ for $k \in \{0, \dots, n\}$.
- Cumulative talk time share: $L_k = \frac{\sum_{i=1}^k x_{(i)}}{\sum_{i=1}^n x_{(i)}}$.

The area between the line of absolute equality ($y = x$) and the Lorenz curve directly represents the Gini coefficient:

$$G = 1 - 2 \int_0^1 L(p) \, dp$$

### 3. Interruption Overlap Condition
A conversational collision is formally classified as an interruption if and only if:

$$\text{Overlap}(S_A, S_B) = \min(t_{\text{end}}^A, t_{\text{end}}^B) - \max(t_{\text{start}}^A, t_{\text{start}}^B) \ge 0.50\text{ seconds}$$

Where $S_A$ started before $S_B$ ($t_{\text{start}}^A < t_{\text{start}}^B$), making Speaker $B$ the **interrupter** and Speaker $A$ the **interrupted** party.

---

## 📂 Repository Structure

```text
SilenceMap/
├── backend/
│   ├── main.py                     # FastAPI REST app & route orchestration
│   ├── diarization.py              # PyAnnote 3.1 neural pipeline & preset loaders
│   ├── audio_processor.py          # 16kHz mono normalization & audio metadata
│   ├── interruption_detector.py    # Temporal overlap collision detection engine
│   ├── equity_metrics.py           # Gini, Lorenz curve, & matrix calculations
│   ├── models.py                   # Pydantic schemas and API contracts
│   ├── presets/                    # Audio files (.wav) and ground truth (.json)
│   │   ├── socratic_seminar.json
│   │   ├── socratic_seminar.wav
│   │   ├── stem_collaboration.json
│   │   └── stem_collaboration.wav
│   ├── tests/                      # Automated test suite (26 tests)
│   │   ├── test_audio_processor.py
│   │   ├── test_diarization.py
│   │   ├── test_equity_metrics.py
│   │   ├── test_interruption_detector.py
│   │   ├── test_main.py
│   │   └── test_models.py
│   └── requirements.txt            # Python dependencies
│
├── frontend/
│   ├── index.html                  # Landing page root
│   ├── app/index.html              # Silence Map application root
│   ├── vite.config.js              # Multi-page Vite configuration & API proxy
│   ├── package.json                # Frontend dependencies & scripts
│   └── src/
│       ├── App.jsx                 # 4-stage UI state machine
│       ├── components/
│       │   ├── AudioPlayer.jsx     # Audio playback controls & speed selector
│       │   ├── SeatingChart.jsx    # Virtual seating heatmap & shockwaves
│       │   ├── TimelineBar.jsx     # Synchronized scrub bar & collision tags
│       │   ├── EquityReport.jsx    # Gini score, Lorenz curve, & matrix
│       │   ├── InterruptionMatrix.jsx # N x N collision direction heatmap
│       │   ├── TakeawayCards.jsx   # Pedagogical recommendations
│       │   ├── VoiceSnippets.jsx   # 3-second voice preview player
│       │   └── LiveMicVisualizer.jsx # Real-time Web Audio API visualizer
│       ├── hooks/
│       │   └── useAudioSync.js     # requestAnimationFrame 60Hz sync hook
│       └── styles/                 # Cozy editorial CSS tokens & theme
│
├── .gitignore                      # Git exclusion rules
├── LICENSE                         # MIT License
└── README.md                       # Comprehensive documentation
```

---

## 🧪 Automated Verification & Tests

The project includes automated test suites covering audio normalization, diarization, equity mathematics, interruption logic, and REST contracts:

```bash
# Execute backend test suite
source backend/venv/bin/activate
PYTHONPATH=. pytest backend/tests/ -v
```

### Test Suite Coverage Breakdown

```text
backend/tests/test_audio_processor.py ........ [PASS] - Sample rates, mono conversion, duration
backend/tests/test_diarization.py ............ [PASS] - Fallback loaders & segment parsing
backend/tests/test_equity_metrics.py ......... [PASS] - Gini index edge cases (0.0 to 1.0)
backend/tests/test_interruption_detector.py .. [PASS] - Interruption collision detection & overlap filters
backend/tests/test_main.py ................... [PASS] - Health, presets, path traversal defense, and seating contracts
backend/tests/test_models.py ................. [PASS] - Pydantic data serialization validation

============================== 30 passed in 1.09s ==============================
```

### Frontend Build Verification
Verify production bundling:
```bash
cd frontend
npm run build
```

---

## 📚 Curated Datasets

Silence Map ships with two contrasting audio discussions to illustrate different conversational dynamics:

| Dataset | Speakers | Duration | Gini ($G$) | Characterization |
| :--- | :---: | :---: | :---: | :--- |
| **High School Socratic Seminar** | 6 | 72.6s | **0.54** | *Monopolized Discussion Floor*: Alex and Maya speak for 68% of the time, resulting in 3 recorded interruptions. Quieter students speak for $<5\text{s}$. |
| **Collaborative STEM Lab** | 4 | 51.6s | **0.18** | *Highly Equitable*: Evenly distributed turn-taking across all 4 group members with zero disruptive collisions. |

---

## 🎓 Pedagogical Impact

Silence Map bridges the gap between educational research and everyday classroom practice:
- **Objective Self-Reflection**: Students view their own participation heatmap to foster self-regulation.
- **Data-Driven Socratic Seminars**: Teachers ground feedback in verifiable conversational evidence rather than memory.
- **Inclusive Classroom Culture**: Empowers educators to structure dialogue so every student has an equal voice.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).