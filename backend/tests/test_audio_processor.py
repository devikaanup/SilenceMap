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
    sig = (np.sin(2 * np.pi * 440 * t) * 0.5).astype(np.float32)
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
