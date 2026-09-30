import os
import soundfile as sf
import numpy as np
from scipy.signal import resample_poly
from typing import Tuple

def get_audio_duration(file_path: str) -> float:
    info = sf.info(file_path)
    return float(info.duration)

def ensure_wav_16k_mono(input_path: str, output_path: str) -> Tuple[str, float]:
    data, sample_rate = sf.read(input_path)
    
    # Convert multi-channel / stereo to mono
    if len(data.shape) > 1:
        data = np.mean(data, axis=1)
    
    # Resample to 16000 Hz if needed
    target_sr = 16000
    if sample_rate != target_sr:
        from math import gcd
        g = gcd(int(sample_rate), target_sr)
        up = target_sr // g
        down = int(sample_rate) // g
        data = resample_poly(data, up, down)
        sample_rate = target_sr
    
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    sf.write(output_path, data.astype(np.float32), target_sr, subtype='PCM_16')
    duration = float(len(data) / target_sr)
    return output_path, round(duration, 3)
