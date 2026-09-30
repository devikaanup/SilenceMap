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
    assert len(resp.interruptions) >= 3
    assert resp.metrics.gini_coefficient > 0.30  # High inequality

def test_load_preset_data_stem():
    resp = load_preset_data("stem_collaboration")
    assert resp.mode == "preset"
    assert resp.status == "success"
    assert len(resp.speakers) == 4
    assert len(resp.segments) > 0
    assert resp.metrics.gini_coefficient < 0.20  # Balanced equity

def test_run_live_diarization_missing_token(monkeypatch, tmp_path):
    monkeypatch.delenv("HF_TOKEN", raising=False)
    dummy_audio = str(tmp_path / "dummy.wav")
    with open(dummy_audio, "wb") as f:
        f.write(b"RIFFdummy")
    with pytest.raises(RuntimeError) as excinfo:
        run_live_diarization(dummy_audio)
    assert "HF_AUTH_REQUIRED" in str(excinfo.value)
