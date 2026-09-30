# Silence Map 🎙️🗺️

> **Classroom Discussion Equity Intelligence & Real-Time Seating Heatmap Visualizer**  
> *Transforming multi-speaker classroom dialogue into actionable participation telemetry, equity analytics, and cozy interactive seating visualizations.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Python Tests](https://img.shields.io/badge/Pytest-24%2F24%20Passing-brightgreen?style=flat&logo=pytest)](https://pytest.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 🔗 Live Application Navigation

When the local servers are running:
- **Landing Page**: [http://localhost:5173/](http://localhost:5173/) — Cinematic introductory experience featuring scroll-scrubbed gaze tracking, cozy editorial aesthetics, and live audio reactivity.
- **Silence Map Theater Application**: [http://localhost:5173/app](http://localhost:5173/app) — The core 4-stage classroom discussion analysis and seating heatmap visualizer.
- **Backend API & Health**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🌟 Overview

In modern classrooms and collaborative discussions, participation is frequently skewed: vocal students dominate the floor while quieter students are spoken over or remain silent. Teachers often lack objective, actionable telemetry on conversational dynamics.

**Silence Map** addresses conversational inequity by transforming audio recordings or multi-speaker classroom discussions into an **animated, frame-accurate participation heatmap projected directly onto an interactive virtual seating chart**.

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │                         FRONT OF CLASSROOM / BOARD                     │
  │                                                                        │
  │     [ Seat 1: Alex ]     [ Seat 2: Maya ]      [ Seat 3: Sam ]        │
  │       (42s Talk)           (38s Talk)            (12s Talk)            │
  │        🔥 68% Heat          🔥 62% Heat           🟣 15% Heat          │
  │                                                                        │
  │   [ Seat 5: Chloe ]          DISCUSSION            [ Seat 6: David ]   │
  │      (18s Talk)                FLOOR                  (4s Talk)        │
  │      🟣 25% Heat                                      ⚪ Quiet         │
  │                                                                        │
  │                   [ Seat 4: Elena ] (2s Talk, ⚪ Quiet)                │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. 💺 Real-Time Seating Heatmap Theater
- **Proportional Heat Glow**: Real-time visual radiance reflects cumulative speaking time relative to the session's most vocal student.
- **Seminar U-Shape & Desk Grid Topologies**: Switch instantly between an intimate seminar circle or a multi-row desk grid.
- **Interruption Collision Shockwaves**: Expanding rose-gold shockwave rings trigger whenever overlapping speech (>0.5s) occurs between speakers.
- **Live Microphone Heatmap & Sound Bar**: Real-time Web Audio API sound frequency visualizer and decibel meter for live classroom monitoring.

### 2. ⚡ Frame-Accurate Synchronized Playback
- High-performance audio synchronization powered by `requestAnimationFrame` (~16ms display sync) ensuring seat node glow, waveform pulses, and timeline playheads lock with audio speech timestamps.
- **Global Keyboard Hotkeys**:
  - <kbd>Space</kbd>: Play / Pause toggle
  - <kbd>←</kbd> / <kbd>→</kbd>: Seek ±5 seconds backward / forward
  - <kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd> / <kbd>4</kbd>: Adjust playback speed (`1.0x`, `1.25x`, `1.5x`, `2.0x`)
  - <kbd>R</kbd>: Restart playback from beginning

### 3. 📊 Classroom Equity Intelligence Report
- **Gini Equity Index ($G$)**: Mathematical inequality coefficient calculated from individual speaking durations:
  $$G = \frac{\sum_{i=1}^n \sum_{j=1}^n |x_i - x_j|}{2n\sum_{i=1}^n x_i}$$
  - `0.00 – 0.20`: Highly Equitable
  - `0.20 – 0.35`: Mildly Uneven
  - `0.35 – 0.50`: Unbalanced
  - `> 0.50`: Monopolized Discussion Floor
- **Interactive Lorenz Equity Curve**: Visualizes actual talk time cumulative percentage vs. the 45-degree theoretical equality line.
- **$N \times N$ Interruption Collision Matrix**: Complete directional matrix illustrating who interrupted whom and total collision durations.
- **Actionable Pedagogical Takeaways**: Algorithmic coaching recommendations (*Quiet Student Spotlight*, *Dominant Speaker Coaching*, *Round-Robin Structuring*).

### 4. 🎧 Teacher Voice Snippet Player & Desk Mapping
- Educators can listen to isolated 3-second audio previews for each detected voice cluster.
- Map voice IDs (`SPEAKER_00`, `SPEAKER_01`) directly to student names and physical desks prior to playback.

### 5. 🎨 Cozy Editorial & Warm Aesthetic
- Cohesive visual identity across both the landing page and the analysis tool: espresso, warm hazelnut, and soft parchment palette with delicate floral and botanical motifs.
- Seamless single-server navigation connecting the immersive hero landing page to the analysis theater.

---

## 🛠️ Architecture & Tech Stack

```text
SilenceMap/
├── backend/                  # FastAPI Application
│   ├── main.py               # REST API Endpoints & Static Audio Mounting
│   ├── diarization.py        # Preset Loaders & Diarization Pipeline
│   ├── audio_processor.py    # 16kHz Mono Conversion & Duration Extraction
│   ├── interruption_detector.py # 0.5s Overlap Collision Filter
│   ├── equity_metrics.py     # Gini & Lorenz Mathematical Engine
│   ├── models.py             # Pydantic Schemas & Data Contracts
│   ├── presets/              # Curated Ground-Truth Audio & Metadata
│   └── tests/                # Pytest Test Suite (24 unit & integration tests)
│
├── frontend/                 # React 18 + Vite Application (Landing Page + App)
│   ├── index.html            # Landing page entry point
│   ├── app/index.html        # Silence Map theater app entry point
│   ├── src/
│   │   ├── App.jsx           # Silence Map 4-Stage State Machine
│   │   ├── components/       # UI Components & Heatmaps
│   │   ├── hooks/            # useAudioSync (requestAnimationFrame sync engine)
│   │   └── styles/           # Design tokens, color system, and warm cozy theme
│   └── package.json
└── frontend_new/             # Original Landing Page Source & Exploratory Assets
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Python 3.11 or 3.12 recommended)
- **Node.js 18+** & `npm`
- **ffmpeg** (optional, recommended for raw audio transcoding)

---

### 1. Setup & Launch Backend

```bash
# Navigate to project root
cd SilenceMap

# Create and activate virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI development server
uvicorn backend.main:app --port 8000 --host 0.0.0.0 --reload
```
*Backend runs on `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.*

---

### 2. Setup & Launch Frontend

In a separate terminal window:

```bash
cd SilenceMap/frontend

# Install npm dependencies
npm install

# Start Vite dev server
npm run dev -- --host 0.0.0.0 --port 5173
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🧪 Automated Testing

### Backend Test Suite
Run the 24 unit and integration tests:

```bash
source backend/venv/bin/activate
PYTHONPATH=. pytest backend/tests/ -v
```

All 24 unit and integration tests verify:
- Audio normalization and duration calculations
- Diarization preset loaders and fallbacks
- Gini coefficient mathematical correctness & edge cases
- 0.5s overlap interruption detection logic
- Full REST API contract endpoints (`/api/health`, `/api/presets`, `/api/analyze`, `/api/seat-mapping`)

### Frontend Build Verification
Verify production compilation:

```bash
cd frontend
npm run build
```

---

## 📚 Curated Discussion Datasets Included

1. **High School Socratic Seminar (Literature)**:
   - 6 students analyzing Shakespeare's *Hamlet*.
   - Demonstrates clear participation monopoly: Alex and Maya account for **~68% of talk time** with 3 distinct interruptions, while David and Elena speak for $<5\text{s}$.
2. **Collaborative STEM Lab Discussion**:
   - 4 students reviewing physics experiment data.
   - Demonstrates balanced, equitable turn-taking ($G \approx 0.18$) with minimal conversational collisions.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.