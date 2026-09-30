import pytest
from backend.models import SpeakerSegment, InterruptionEvent, LorenzPoint, EquityMetrics, AnalysisResponse

def test_speaker_segment_creation():
    seg = SpeakerSegment(speaker_id="SPEAKER_00", start_time=1.0, end_time=4.5, duration=3.5)
    assert seg.speaker_id == "SPEAKER_00"
    assert seg.duration == 3.5

def test_interruption_event_creation():
    event = InterruptionEvent(
        id="int_01",
        interrupter_id="SPEAKER_01",
        interrupted_id="SPEAKER_00",
        start_time=3.5,
        end_time=4.5,
        overlap_duration=1.0
    )
    assert event.interrupter_id == "SPEAKER_01"
    assert event.overlap_duration == 1.0

def test_analysis_response_structure():
    resp = AnalysisResponse(
        session_id="sess_01",
        mode="preset",
        status="success",
        audio_url="/api/audio/sample.wav",
        audio_duration=120.0,
        speakers=["SPEAKER_00", "SPEAKER_01"],
        segments=[],
        interruptions=[],
        metrics=EquityMetrics(
            total_discussion_time=120.0,
            total_speech_time=100.0,
            total_silence_time=20.0,
            gini_coefficient=0.45,
            gini_interpretation="Moderate Inequality",
            top_speakers_share_headline="1 of 2 speakers spoke 70%",
            lorenz_curve=[LorenzPoint(speaker_fraction=0.5, talk_time_fraction=0.3)],
            speaker_stats={},
            interruption_stats={}
        )
    )
    assert resp.mode == "preset"
    assert resp.metrics.gini_coefficient == 0.45
