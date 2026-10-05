# To run this code you need to install the following dependencies:
# pip install google-genai pydub audioop-lts
# (audioop-lts is only needed on Python 3.13+)

import hashlib
import mimetypes
import os
import re
import struct
import time
from google import genai
from google.genai import types
from pydub import AudioSegment


def _load_env_file():
    """Minimal .env loader: reads KEY=VALUE lines from backend/.env if present."""
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.exists(path):
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_env_file()

OUTPUT_FILE_NAME = "socratic_seminar_demo"

# Each speaker's voice, matched from your three existing scripts
VOICE_MAP = {
    "SPEAKER_00": "Bodi",
    "SPEAKER_01": "Leda",
    "SPEAKER_02": "Milo",
    "SPEAKER_03": "Enya",
    "SPEAKER_04": "Lora",
    "SPEAKER_05": "Sadachbia",
}

# Full script, in the exact order it should play (index = position in list)
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
    ("SPEAKER_00", "Sure, okay, but \"different rules\" isn't an actual answer — what does that look like in practice is the real question?"),                   # 12
]

# Each tuple: (index of line being interrupted, index of interrupter line, overlap in ms)
INTERRUPTIONS = [
    (0, 1, 1300),
    (4, 5, 1300),
    (8, 9, 2200),
]
INTERRUPTER_INDEXES = {interrupter for (_, interrupter, _) in INTERRUPTIONS}
OVERLAP_MS_BY_INTERRUPTER = {interrupter: ms for (_, interrupter, ms) in INTERRUPTIONS}


def generate_line(client, model, text, voice_name):
    """Generate single-speaker audio for one line. Returns (raw_pcm_bytes, mime_type)."""
    contents = [
        types.Content(
            role="user",
            parts=[types.Part(text=text)],
        ),
    ]
    config = types.GenerateContentConfig(
        temperature=1,
        response_modalities=["audio"],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice_name)
            ),
        ),
    )

    audio_data = bytearray()
    mime_type = ""
    for chunk in client.models.generate_content_stream(
        model=model, contents=contents, config=config
    ):
        if chunk.parts is None:
            continue
        if chunk.parts[0].inline_data and chunk.parts[0].inline_data.data:
            inline_data = chunk.parts[0].inline_data
            audio_data.extend(inline_data.data)
            mime_type = inline_data.mime_type
    return bytes(audio_data), mime_type


CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".tts_cache")


def generate_line_cached(client, model, text, voice_name, max_retries=6):
    """generate_line() with an on-disk cache and retry on 429 (free tier = 3 req/min)."""
    os.makedirs(CACHE_DIR, exist_ok=True)
    key = hashlib.sha256(f"{model}|{voice_name}|{text}".encode()).hexdigest()[:16]
    pcm_path = os.path.join(CACHE_DIR, f"{key}.pcm")
    mime_path = os.path.join(CACHE_DIR, f"{key}.mime")
    if os.path.exists(pcm_path) and os.path.exists(mime_path):
        with open(pcm_path, "rb") as f, open(mime_path) as m:
            return f.read(), m.read()

    for attempt in range(max_retries):
        try:
            raw_pcm, mime_type = generate_line(client, model, text, voice_name)
            break
        except genai.errors.ClientError as e:
            if getattr(e, "code", None) != 429 or attempt == max_retries - 1:
                raise
            match = re.search(r"retry in ([\d.]+)s", str(e))
            delay = float(match.group(1)) + 2 if match else 30
            print(f"  Rate limited; waiting {delay:.0f}s before retry...")
            time.sleep(delay)
    if raw_pcm:
        with open(pcm_path, "wb") as f, open(mime_path, "w") as m:
            f.write(raw_pcm)
            m.write(mime_type)
    return raw_pcm, mime_type


def parse_audio_mime_type(mime_type: str) -> dict:
    bits_per_sample = 16
    rate = 24000
    for param in mime_type.split(";"):
        param = param.strip()
        if param.lower().startswith("rate="):
            try:
                rate = int(param.split("=", 1)[1])
            except (ValueError, IndexError):
                pass
        elif param.startswith("audio/L"):
            try:
                bits_per_sample = int(param.split("L", 1)[1])
            except (ValueError, IndexError):
                pass
    return {"bits_per_sample": bits_per_sample, "rate": rate}


def pcm_to_segment(raw_pcm: bytes, mime_type: str) -> AudioSegment:
    params = parse_audio_mime_type(mime_type)
    return AudioSegment(
        data=raw_pcm,
        sample_width=params["bits_per_sample"] // 8,
        frame_rate=params["rate"],
        channels=1,
    )


def assemble_with_interruptions(segments: list) -> AudioSegment:
    """Lay segments back to back, except interrupter lines, which overlay
    earlier into the segment they interrupt by the configured overlap."""
    timeline = AudioSegment.silent(duration=0, frame_rate=segments[0].frame_rate)
    cursor_ms = 0

    for i, seg in enumerate(segments):
        if i in INTERRUPTER_INDEXES:
            overlap_ms = OVERLAP_MS_BY_INTERRUPTER[i]
            place_at = max(0, cursor_ms - overlap_ms)
            if len(timeline) < place_at + len(seg):
                timeline = timeline + AudioSegment.silent(
                    duration=(place_at + len(seg)) - len(timeline),
                    frame_rate=seg.frame_rate,
                )
            timeline = timeline.overlay(seg, position=place_at)
            cursor_ms = place_at + len(seg)
        else:
            if len(timeline) < cursor_ms + len(seg):
                timeline = timeline + AudioSegment.silent(
                    duration=(cursor_ms + len(seg)) - len(timeline),
                    frame_rate=seg.frame_rate,
                )
            timeline = timeline.overlay(seg, position=cursor_ms)
            cursor_ms = cursor_ms + len(seg)

    return timeline


def build_wav(raw_pcm: bytes, sample_rate: int, bits_per_sample: int) -> bytes:
    num_channels = 1
    data_size = len(raw_pcm)
    bytes_per_sample = bits_per_sample // 8
    block_align = num_channels * bytes_per_sample
    byte_rate = sample_rate * block_align
    chunk_size = 36 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF", chunk_size, b"WAVE", b"fmt ", 16, 1,
        num_channels, sample_rate, byte_rate, block_align,
        bits_per_sample, b"data", data_size,
    )
    return header + raw_pcm


def save_binary_file(file_name, data):
    with open(file_name, "wb") as f:
        f.write(data)
    print(f"File saved to: {file_name}")


def generate():
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    model = "gemini-3.8-flash-tts"

    segments = []
    for i, (speaker, text) in enumerate(SCRIPT, start=0):
        voice_name = VOICE_MAP[speaker]
        print(f"Generating line {i + 1}/{len(SCRIPT)} — {speaker} ({voice_name})...")
        raw_pcm, mime_type = generate_line_cached(client, model, text, voice_name)
        segments.append(pcm_to_segment(raw_pcm, mime_type))

    if segments:
        timeline = AudioSegment.silent(duration=0, frame_rate=segments[0].frame_rate)
        cursor_ms = 0
        segments_json = []

        for i, seg in enumerate(segments):
            speaker = SCRIPT[i][0]
            dur_ms = len(seg)

            if i in INTERRUPTER_INDEXES:
                overlap_ms = OVERLAP_MS_BY_INTERRUPTER[i]
                start_ms = max(0, cursor_ms - overlap_ms)
            else:
                start_ms = cursor_ms

            end_ms = start_ms + dur_ms

            if len(timeline) < end_ms:
                timeline += AudioSegment.silent(duration=end_ms - len(timeline), frame_rate=timeline.frame_rate)

            timeline = timeline.overlay(seg, position=start_ms)
            cursor_ms = end_ms

            segments_json.append({
                "speaker_id": speaker,
                "start_time": round(start_ms / 1000.0, 3),
                "end_time": round(end_ms / 1000.0, 3),
                "duration": round(dur_ms / 1000.0, 3)
            })

        total_dur_sec = round(len(timeline) / 1000.0, 3)
        wav_bytes = build_wav(
            timeline.raw_data, timeline.frame_rate, timeline.sample_width * 8
        )
        save_binary_file(f"{OUTPUT_FILE_NAME}.wav", wav_bytes)
        
        # Also wire directly into presets
        preset_wav_path = os.path.join(os.path.dirname(__file__), "presets", "socratic_seminar.wav")
        save_binary_file(preset_wav_path, wav_bytes)
        
        preset_json_path = os.path.join(os.path.dirname(__file__), "presets", "socratic_seminar.json")
        import json
        preset_data = {
            "id": "socratic_seminar",
            "title": "High School Socratic Seminar",
            "description": "6 students discussing digital platform age restrictions with Google AI Studio voices. Alex and Maya dominate with 3 clear interruptions.",
            "speaker_count": 6,
            "audio_duration": total_dur_sec,
            "audio_file": "socratic_seminar.wav",
            "segments": segments_json
        }
        with open(preset_json_path, "w") as f:
            json.dump(preset_data, f, indent=2)
        print(f"Updated preset JSON: {preset_json_path} (duration: {total_dur_sec}s)")
    else:
        print("No audio data was generated.")


if __name__ == "__main__":
    generate()
