import json
import os
import subprocess
import wave
from pydub import AudioSegment

SCRIPT = [
    ("SPEAKER_00", "Okay so I actually think banning it for under-sixteens is kind of pointless, honestly—"),                                                    # 0
    ("SPEAKER_01", "—no but that's not the real point, it's whether the platform is even built for a fourteen-year-old's brain in the first place."),           # 1  interrupts 0
    ("SPEAKER_02", "I mean, I kind of see both sides, honestly."),                                                                                               # 2
    ("SPEAKER_00", "Right, but instead of banning it outright, maybe we should be talking about how it's actually designed in the first place."),                # 3
    ("SPEAKER_03", "Can I say something? In my experience it's not all—"),                                                                                       # 4
    ("SPEAKER_01", "—sure, sorry, but at scale the mental health data is actually pretty alarming, that's why this keeps coming up everywhere."),                # 5  interrupts 4
    ("SPEAKER_00", "Okay, I'm not saying ignore the data, I'm saying the response to the data should look different than just a blanket ban for everyone."),     # 6
    ("SPEAKER_04", "I don't know enough to say."),                                                                                                               # 7
    ("SPEAKER_01", "That's fair, honestly none of us are experts here, but some of us have actually read the studies—"),                                        # 8
    ("SPEAKER_00", "—okay but can we land somewhere? Is there an actual middle ground between banning it completely and doing absolutely nothing?"),             # 9  interrupts 8
    ("SPEAKER_05", "Age-appropriate design, maybe? Different rules."),                                                                                           # 10
    ("SPEAKER_01", "That's basically what I've been describing this whole time — different protections for different age groups instead of one hard line."),    # 11
    ("SPEAKER_00", "Sure, okay, but different rules isn't an actual answer — what does that look like in practice is the real question?"),                      # 12
]

VOICE_MAP = {
    "SPEAKER_00": "Daniel",    # Alex
    "SPEAKER_01": "Samantha",  # Maya
    "SPEAKER_02": "Karen",     # Sam
    "SPEAKER_03": "Rishi",     # Chloe
    "SPEAKER_04": "Moira",     # Elena
    "SPEAKER_05": "Tessa",     # David
}

# (interrupted_index, interrupter_index, overlap_ms)
INTERRUPTIONS = [
    (0, 1, 1300),
    (4, 5, 1300),
    (8, 9, 2200),
]
OVERLAP_MS_BY_INTERRUPTER = {interrupter: ms for (_, interrupter, ms) in INTERRUPTIONS}

TMP_DIR = "/tmp/silence_map_socratic"
os.makedirs(TMP_DIR, exist_ok=True)

print("Synthesizing 13 lines with macOS natural voices...")
segments_info = []
pydub_segments = []

for i, (speaker, text) in enumerate(SCRIPT):
    voice = VOICE_MAP[speaker]
    aiff_path = os.path.join(TMP_DIR, f"line_{i}.aiff")
    wav_path = os.path.join(TMP_DIR, f"line_{i}.wav")
    
    # Clean text of quotes and dashes that might cause shell syntax issues
    clean_text = text.replace('"', '').replace('—', ' - ')
    subprocess.run(["say", "-v", voice, "-o", aiff_path, clean_text], check=True)
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@24000", "-c", "1", aiff_path, wav_path], check=True)
    
    seg = AudioSegment.from_wav(wav_path)
    pydub_segments.append(seg)
    duration_sec = round(len(seg) / 1000.0, 3)
    print(f"  Line {i:02d} | {speaker} ({voice}): {duration_sec}s")

# Build timeline and segments
timeline = AudioSegment.silent(duration=0, frame_rate=24000)
cursor_ms = 0
segments_json = []

for i, seg in enumerate(pydub_segments):
    speaker = SCRIPT[i][0]
    dur_ms = len(seg)
    
    if i in OVERLAP_MS_BY_INTERRUPTER:
        overlap_ms = OVERLAP_MS_BY_INTERRUPTER[i]
        start_ms = max(0, cursor_ms - overlap_ms)
    else:
        start_ms = cursor_ms
        
    end_ms = start_ms + dur_ms
    
    # Extend timeline if needed
    if len(timeline) < end_ms:
        timeline += AudioSegment.silent(duration=end_ms - len(timeline), frame_rate=24000)
        
    timeline = timeline.overlay(seg, position=start_ms)
    cursor_ms = end_ms
    
    segments_json.append({
        "speaker_id": speaker,
        "start_time": round(start_ms / 1000.0, 3),
        "end_time": round(end_ms / 1000.0, 3),
        "duration": round(dur_ms / 1000.0, 3)
    })

total_duration_sec = round(len(timeline) / 1000.0, 3)
print(f"\nTotal combined audio duration: {total_duration_sec}s")

# Save combined audio
out_local = "socratic_seminar_demo.wav"
out_preset = "presets/socratic_seminar.wav"
timeline.export(out_local, format="wav")
timeline.export(out_preset, format="wav")
print(f"Saved: {out_local} and {out_preset}")

# Save JSON metadata
preset_json_path = "presets/socratic_seminar.json"
preset_data = {
    "id": "socratic_seminar",
    "title": "High School Socratic Seminar",
    "description": "6 students discussing digital platform age restrictions. Alex (SPEAKER_00) and Maya (SPEAKER_01) dominate ~70% of the conversation with 3 clear interruptions; Elena and David remain mostly quiet.",
    "speaker_count": 6,
    "audio_duration": total_duration_sec,
    "audio_file": "socratic_seminar.wav",
    "segments": segments_json
}

with open(preset_json_path, "w") as f:
    json.dump(preset_data, f, indent=2)

print(f"Updated preset JSON: {preset_json_path}")
