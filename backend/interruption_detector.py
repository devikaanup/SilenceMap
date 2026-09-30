from typing import List
import uuid
from backend.models import SpeakerSegment, InterruptionEvent

MIN_INTERRUPTION_OVERLAP_SEC: float = 0.3

def detect_interruptions(
    segments: List[SpeakerSegment],
    min_overlap_sec: float = MIN_INTERRUPTION_OVERLAP_SEC
) -> List[InterruptionEvent]:
    interruptions: List[InterruptionEvent] = []
    sorted_segs = sorted(segments, key=lambda s: (s.start_time, s.end_time))
    n = len(sorted_segs)
    
    for i in range(n):
        seg_a = sorted_segs[i]
        for j in range(i + 1, n):
            seg_b = sorted_segs[j]
            
            # If seg_b starts at or after seg_a ends, no overlap with subsequent segments
            if seg_b.start_time >= seg_a.end_time:
                break
            
            # Ignore same speaker overlaps
            if seg_a.speaker_id == seg_b.speaker_id:
                continue
            
            overlap_start = max(seg_a.start_time, seg_b.start_time)
            overlap_end = min(seg_a.end_time, seg_b.end_time)
            overlap_duration = overlap_end - overlap_start
            
            if overlap_duration >= min_overlap_sec:
                # The speaker whose turn began second is the interrupter
                if seg_b.start_time >= seg_a.start_time:
                    interrupter = seg_b.speaker_id
                    interrupted = seg_a.speaker_id
                else:
                    interrupter = seg_a.speaker_id
                    interrupted = seg_b.speaker_id
                
                event = InterruptionEvent(
                    id=f"int_{uuid.uuid4().hex[:8]}",
                    interrupter_id=interrupter,
                    interrupted_id=interrupted,
                    start_time=round(overlap_start, 3),
                    end_time=round(overlap_end, 3),
                    overlap_duration=round(overlap_duration, 3)
                )
                interruptions.append(event)
                
    return interruptions
