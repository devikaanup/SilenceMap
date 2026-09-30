from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class SpeakerSegment(BaseModel):
    speaker_id: str
    start_time: float
    end_time: float
    duration: float

class InterruptionEvent(BaseModel):
    id: str
    interrupter_id: str
    interrupted_id: str
    start_time: float
    end_time: float
    overlap_duration: float

class SeatAssignment(BaseModel):
    seat_id: str
    seat_label: str
    speaker_id: Optional[str] = None
    student_name: Optional[str] = None

class LorenzPoint(BaseModel):
    speaker_fraction: float
    talk_time_fraction: float

class EquityMetrics(BaseModel):
    total_discussion_time: float
    total_speech_time: float
    total_silence_time: float
    gini_coefficient: float
    gini_interpretation: str
    top_speakers_share_headline: str
    lorenz_curve: List[LorenzPoint] = Field(default_factory=list)
    speaker_stats: Dict[str, Any] = Field(default_factory=dict)
    interruption_stats: Dict[str, Any] = Field(default_factory=dict)

class AnalysisResponse(BaseModel):
    session_id: str
    mode: str  # "preset" | "live" | "live_failed"
    status: str  # "success" | "error"
    audio_url: str
    audio_duration: float
    speakers: List[str]
    segments: List[SpeakerSegment]
    interruptions: List[InterruptionEvent]
    metrics: EquityMetrics
    error_code: Optional[str] = None
    error_message: Optional[str] = None
