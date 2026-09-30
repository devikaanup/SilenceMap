import json
import os
import numpy as np
import soundfile as sf

PRESETS_DIR = os.path.join(os.path.dirname(__file__), "presets")
os.makedirs(PRESETS_DIR, exist_ok=True)

# Helper to generate distinct harmonic vocal formants per speaker
def generate_speech_audio(segments, total_duration, output_wav_path):
    sr = 16000
    total_samples = int(total_duration * sr)
    audio = np.zeros(total_samples, dtype=np.float32)
    
    # Fundamental frequencies for 6 distinct speakers
    speaker_freqs = {
        "SPEAKER_00": 130.0, # Alex (dominant - lower male range)
        "SPEAKER_01": 220.0, # Maya (dominant - female range)
        "SPEAKER_02": 175.0, # Sam (moderate - mid range)
        "SPEAKER_03": 260.0, # Chloe (moderate - higher female range)
        "SPEAKER_04": 150.0, # David (quiet - mid male range)
        "SPEAKER_05": 195.0  # Elena (quiet - mid female range)
    }
    
    for seg in segments:
        spk = seg["speaker_id"]
        start_t = seg["start_time"]
        end_t = seg["end_time"]
        dur = end_t - start_t
        f0 = speaker_freqs.get(spk, 200.0)
        
        n_samples = int(dur * sr)
        t = np.linspace(0, dur, n_samples, endpoint=False)
        
        # Add vocal tract harmonics + natural amplitude cadence modulation (syllables ~4Hz)
        sig = 0.4 * np.sin(2 * np.pi * f0 * t) + \
              0.25 * np.sin(2 * np.pi * (2 * f0) * t) + \
              0.15 * np.sin(2 * np.pi * (3 * f0) * t) + \
              0.08 * np.sin(2 * np.pi * (4 * f0) * t)
        
        # Syllable cadence envelope (speech-like amplitude pulse)
        syllable_env = 0.6 + 0.4 * np.sin(2 * np.pi * 4.2 * t)
        
        # Soft attack and release envelope (20ms ramp)
        ramp_samples = min(int(0.02 * sr), n_samples // 2)
        env = np.ones(n_samples, dtype=np.float32)
        if ramp_samples > 0:
            env[:ramp_samples] = np.linspace(0, 1, ramp_samples)
            env[-ramp_samples:] = np.linspace(1, 0, ramp_samples)
            
        segment_audio = sig * syllable_env * env * 0.4
        
        start_idx = int(start_t * sr)
        end_idx = start_idx + n_samples
        if end_idx <= total_samples:
            audio[start_idx:end_idx] += segment_audio
        else:
            actual_len = total_samples - start_idx
            if actual_len > 0:
                audio[start_idx:] += segment_audio[:actual_len]
                
    # Normalize
    max_val = np.max(np.abs(audio))
    if max_val > 0:
        audio = (audio / max_val) * 0.85
        
    sf.write(output_wav_path, audio, sr, subtype='PCM_16')
    print(f"Generated {output_wav_path} (Duration: {total_duration}s)")

# --- Preset 1: Socratic Seminar (6 Students, High Inequality, 3 Interruptions) ---
socratic_segments = [
    # Topic kickoff: Alex (SPEAKER_00) takes the floor
    {"speaker_id": "SPEAKER_00", "start_time": 0.5, "end_time": 6.8, "duration": 6.3},
    # Maya (SPEAKER_01) interrupts Alex at 5.5s
    {"speaker_id": "SPEAKER_01", "start_time": 5.5, "end_time": 13.2, "duration": 7.7},
    # Sam (SPEAKER_02) speaks briefly
    {"speaker_id": "SPEAKER_02", "start_time": 14.0, "end_time": 18.5, "duration": 4.5},
    # Alex jumps back in
    {"speaker_id": "SPEAKER_00", "start_time": 19.0, "end_time": 27.4, "duration": 8.4},
    # Chloe (SPEAKER_03) attempts to speak
    {"speaker_id": "SPEAKER_03", "start_time": 28.0, "end_time": 32.5, "duration": 4.5},
    # Maya interrupts Chloe at 31.2s
    {"speaker_id": "SPEAKER_01", "start_time": 31.2, "end_time": 41.0, "duration": 9.8},
    # Alex speaks again
    {"speaker_id": "SPEAKER_00", "start_time": 42.0, "end_time": 52.5, "duration": 10.5},
    # David (SPEAKER_04 - quiet) speaks one short sentence
    {"speaker_id": "SPEAKER_04", "start_time": 53.5, "end_time": 56.5, "duration": 3.0},
    # Maya immediately takes over and Alex interrupts her at 63.0s
    {"speaker_id": "SPEAKER_01", "start_time": 57.0, "end_time": 65.2, "duration": 8.2},
    {"speaker_id": "SPEAKER_00", "start_time": 63.0, "end_time": 74.0, "duration": 11.0},
    # Elena (SPEAKER_05 - quiet) adds a brief thought
    {"speaker_id": "SPEAKER_05", "start_time": 75.0, "end_time": 78.5, "duration": 3.5},
    # Maya wraps up dominant points
    {"speaker_id": "SPEAKER_01", "start_time": 79.5, "end_time": 88.0, "duration": 8.5},
    # Alex final closing argument
    {"speaker_id": "SPEAKER_00", "start_time": 89.0, "end_time": 98.5, "duration": 9.5}
]

socratic_data = {
    "id": "socratic_seminar",
    "title": "High School Socratic Seminar (Literature)",
    "description": "6 students discussing Hamlet. Alex and Maya dominate ~68% of the conversation with 3 clear interruptions; David and Elena remain mostly silent.",
    "speaker_count": 6,
    "audio_duration": 100.0,
    "audio_file": "socratic_seminar.wav",
    "segments": socratic_segments
}

with open(os.path.join(PRESETS_DIR, "socratic_seminar.json"), "w") as f:
    json.dump(socratic_data, f, indent=2)
generate_speech_audio(socratic_segments, 100.0, os.path.join(PRESETS_DIR, "socratic_seminar.wav"))

# --- Preset 2: STEM Collaborative Discussion (4 Students, Balanced) ---
stem_segments = [
    {"speaker_id": "SPEAKER_00", "start_time": 1.0, "end_time": 9.0, "duration": 8.0},
    {"speaker_id": "SPEAKER_01", "start_time": 9.5, "end_time": 18.0, "duration": 8.5},
    {"speaker_id": "SPEAKER_02", "start_time": 19.0, "end_time": 28.0, "duration": 9.0},
    {"speaker_id": "SPEAKER_03", "start_time": 28.5, "end_time": 37.0, "duration": 8.5},
    {"speaker_id": "SPEAKER_00", "start_time": 38.0, "end_time": 45.0, "duration": 7.0},
    # Brief cooperative interruption
    {"speaker_id": "SPEAKER_02", "start_time": 44.2, "end_time": 52.0, "duration": 7.8},
    {"speaker_id": "SPEAKER_01", "start_time": 53.0, "end_time": 60.0, "duration": 7.0}
]

stem_data = {
    "id": "stem_collaboration",
    "title": "Collaborative STEM Lab Discussion",
    "description": "4 students analyzing physics experiment findings with equitable turn-taking and minimal interruption.",
    "speaker_count": 4,
    "audio_duration": 62.0,
    "audio_file": "stem_collaboration.wav",
    "segments": stem_segments
}

with open(os.path.join(PRESETS_DIR, "stem_collaboration.json"), "w") as f:
    json.dump(stem_data, f, indent=2)
generate_speech_audio(stem_segments, 62.0, os.path.join(PRESETS_DIR, "stem_collaboration.wav"))
