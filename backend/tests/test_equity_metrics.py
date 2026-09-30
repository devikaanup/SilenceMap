import pytest
from backend.models import SpeakerSegment, InterruptionEvent
from backend.equity_metrics import calculate_gini, compute_equity_metrics

def test_gini_equal_participation():
    times = [25.0, 25.0, 25.0, 25.0]
    gini = calculate_gini(times)
    assert abs(gini - 0.0) < 1e-4

def test_gini_extreme_inequality():
    times = [1.0, 1.0, 1.0, 97.0]
    gini = calculate_gini(times)
    assert gini > 0.70

def test_gini_formula_exact_value():
    gini = calculate_gini([10.0, 20.0, 30.0])
    assert abs(gini - 0.2222) < 0.001

def test_compute_equity_metrics_structure():
    segments = [
        SpeakerSegment(speaker_id="SPEAKER_00", start_time=0.0, end_time=40.0, duration=40.0),
        SpeakerSegment(speaker_id="SPEAKER_01", start_time=40.0, end_time=80.0, duration=40.0),
        SpeakerSegment(speaker_id="SPEAKER_02", start_time=80.0, end_time=90.0, duration=10.0),
        SpeakerSegment(speaker_id="SPEAKER_03", start_time=90.0, end_time=100.0, duration=10.0),
    ]
    interruptions = [
        InterruptionEvent(id="1", interrupter_id="SPEAKER_00", interrupted_id="SPEAKER_02", start_time=80.0, end_time=81.0, overlap_duration=1.0)
    ]
    metrics = compute_equity_metrics(segments, interruptions, total_duration=120.0)
    assert metrics.total_discussion_time == 120.0
    assert metrics.total_speech_time == 100.0
    assert metrics.total_silence_time == 20.0
    assert len(metrics.lorenz_curve) == 5  # (0,0) + 4 points
    assert "1 of 4 participants" in metrics.top_speakers_share_headline or "2 of 4 participants" in metrics.top_speakers_share_headline
    assert metrics.speaker_stats["SPEAKER_00"]["talk_time_pct"] == 40.0
    assert metrics.speaker_stats["SPEAKER_00"]["interruptions_initiated"] == 1
    assert metrics.speaker_stats["SPEAKER_02"]["interruptions_received"] == 1
