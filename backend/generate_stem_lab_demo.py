# To run this code you need to install the following dependencies:
# pip install google-genai pydub
# (Python 3.13+ also needs: pip install audioop-lts, since pydub relies on audioop)

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

OUTPUT_FILE_NAME = "stem_lab_demo"

# Each speaker's voice, matched from your two existing scripts
VOICE_MAP = {
    "SPEAKER_00": "Laomedeia",
    "SPEAKER_01": "Rami",
    "SPEAKER_02": "Sadaltager",
    "SPEAKER_03": "Nika",
}

# Full script, in the exact order it should play
SCRIPT = [
    ("SPEAKER_00", "Okay so before we run the trial, I think we need to lock down our control variable — right now we're changing too many things at once between runs."),
    ("SPEAKER_01", "That's fair. I was thinking we keep the temperature fixed and only vary the concentration this time, then we actually know what caused the difference."),
    ("SPEAKER_02", "Agreed, and honestly we should probably run it three times instead of once, just so one weird result doesn't throw off our whole data set."),
    ("SPEAKER_03", "Good call. I can set up the spreadsheet to log each trial separately so we're not mixing the numbers together by accident."),
    ("SPEAKER_00", "Perfect. I'll prep the samples now, should take maybe five minutes before we're ready to actually— <breath>"),
    ("SPEAKER_02", "—wait, actually, can we double check the scale's calibrated first? Because last time it was off by like half a gram, and that would throw off everything downstream if we don't catch it now."),
    ("SPEAKER_01", "Good catch. Let's calibrate it, then we're good to go on the actual trial."),
]

# Index (0-based) of the line that cuts in on the line before it (line 6 -> index 5),
# and how many milliseconds BEFORE the previous line ends it should start.
INTERRUPT_LINE_INDEX = 5
INTERRUPT_OVERLAP_MS = 800  # 0.5-1.0s window of genuinely simultaneous speech


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


def build_wav(raw_pcm: bytes, mime_type: str) -> bytes:
    params = parse_audio_mime_type(mime_type)
    bits_per_sample = params["bits_per_sample"]
    sample_rate = params["rate"]
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


def pcm_to_segment(raw_pcm: bytes, mime_type: str) -> AudioSegment:
    """Wrap raw little-endian PCM in a pydub AudioSegment (no ffmpeg needed)."""
    params = parse_audio_mime_type(mime_type)
    return AudioSegment(
        data=raw_pcm,
        sample_width=params["bits_per_sample"] // 8,
        frame_rate=params["rate"],
        channels=1,
    )


def assemble_with_interruption(segments):
    """Place lines back-to-back, except the interrupting line, which is mixed
    (samples summed via pydub overlay) over the tail of the line before it."""
    timeline = AudioSegment.empty()
    for i, seg in enumerate(segments):
        if i == INTERRUPT_LINE_INDEX and len(timeline) > 0:
            overlap_ms = min(INTERRUPT_OVERLAP_MS, len(timeline), len(seg))
            position = len(timeline) - overlap_ms
            # Extend the timeline so the interrupter's full line fits, then mix.
            needed = position + len(seg) - len(timeline)
            if needed > 0:
                timeline += AudioSegment.silent(duration=needed, frame_rate=timeline.frame_rate)
            timeline = timeline.overlay(seg, position=position)
        else:
            timeline += seg
    return timeline


def save_binary_file(file_name, data):
    with open(file_name, "wb") as f:
        f.write(data)
    print(f"File saved to: {file_name}")


def generate():
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    model = "gemini-3.8-flash-tts"

    line_segments = []
    combined_mime_type = ""

    for i, (speaker, text) in enumerate(SCRIPT, start=1):
        voice_name = VOICE_MAP[speaker]
        print(f"Generating line {i}/{len(SCRIPT)} — {speaker} ({voice_name})...")
        raw_pcm, mime_type = generate_line_cached(client, model, text, voice_name)
        combined_mime_type = mime_type or combined_mime_type
        if raw_pcm:
            line_segments.append(pcm_to_segment(raw_pcm, mime_type or combined_mime_type))

    if line_segments:
        mixed = assemble_with_interruption(line_segments)
        wav_bytes = build_wav(mixed.raw_data, combined_mime_type)
        file_extension = mimetypes.guess_extension(combined_mime_type) or ".wav"
        if file_extension != ".wav":
            file_extension = ".wav"
        save_binary_file(f"{OUTPUT_FILE_NAME}{file_extension}", wav_bytes)
    else:
        print("No audio data was generated.")


if __name__ == "__main__":
    generate()
