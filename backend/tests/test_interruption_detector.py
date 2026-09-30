from backend.models import SpeakerSegment
from backend.interruption_detector import detect_interruptions, MIN_INTERRUPTION_OVERLAP_SEC

def test_constant_value():
    assert MIN_INTERRUPTION_OVERLAP_SEC == 0.3

def test_detect_clear_interruption():
    segments = [
        SpeakerSegment(speaker_id="SPEAKER_00", start_time=0.0, end_time=4.0, duration=4.0),
        SpeakerSegment(speaker_id="SPEAKER_01", start_time=3.0, end_time=6.0, duration=3.0),
    ]
    interruptions = detect_interruptions(segments)
    assert len(interruptions) == 1
    event = interruptions[0]
    assert event.interrupter_id == "SPEAKER_01"
    assert event.interrupted_id == "SPEAKER_00"
    assert event.start_time == 3.0
    assert event.end_time == 4.0
    assert abs(event.overlap_duration - 1.0) < 1e-4

def test_filter_backchannel_under_threshold():
    segments = [
        SpeakerSegment(speaker_id="SPEAKER_00", start_time=0.0, end_time=4.0, duration=4.0),
        SpeakerSegment(speaker_id="SPEAKER_01", start_time=2.0, end_time=2.2, duration=0.2),
    ]
    interruptions = detect_interruptions(segments)
    assert len(interruptions) == 0

def test_same_speaker_no_interruption():
    segments = [
        SpeakerSegment(speaker_id="SPEAKER_00", start_time=0.0, end_time=2.5, duration=2.5),
        SpeakerSegment(speaker_id="SPEAKER_00", start_time=2.0, end_time=4.0, duration=2.0),
    ]
    interruptions = detect_interruptions(segments)
    assert len(interruptions) == 0
