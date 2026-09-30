from typing import List, Dict, Any
from backend.models import SpeakerSegment, InterruptionEvent, LorenzPoint, EquityMetrics

def calculate_gini(talk_times: List[float]) -> float:
    """
    Computes Gini inequality coefficient for a list of talk times.
    Formula: Gini = (2 * sum(i * x_i for i=1..n)) / (n * sum(x_i)) - (n + 1) / n
    where x is sorted ascending: x_1 <= x_2 <= ... <= x_n.
    Returns value bounded between 0.0 (perfect equality) and 1.0 (total monopoly).
    """
    if not talk_times or len(talk_times) <= 1:
        return 0.0
    
    x = sorted([float(t) for t in talk_times])
    n = len(x)
    total_sum = sum(x)
    if total_sum == 0:
        return 0.0
    
    weighted_sum = sum((i + 1) * val for i, val in enumerate(x))
    gini = (2.0 * weighted_sum) / (n * total_sum) - (n + 1.0) / n
    return round(float(max(0.0, min(1.0, gini))), 4)

def interpret_gini(gini: float) -> str:
    if gini < 0.20:
        return "Highly Equitable"
    elif gini < 0.35:
        return "Healthy Discussion"
    elif gini < 0.50:
        return "Moderate Inequality"
    else:
        return "Severe Participation Monopoly"

def compute_equity_metrics(
    segments: List[SpeakerSegment],
    interruptions: List[InterruptionEvent],
    total_duration: float
) -> EquityMetrics:
    # 1. Total talk time per speaker
    speaker_durations: Dict[str, float] = {}
    for seg in segments:
        speaker_durations[seg.speaker_id] = round(speaker_durations.get(seg.speaker_id, 0.0) + seg.duration, 2)
    
    speakers = sorted(list(speaker_durations.keys()))
    total_speech_time = round(sum(speaker_durations.values()), 2)
    total_silence_time = round(max(0.0, total_duration - total_speech_time), 2)
    
    # 2. Gini & Lorenz curve
    talk_times = [speaker_durations[s] for s in speakers]
    gini = calculate_gini(talk_times)
    gini_desc = interpret_gini(gini)
    
    # Lorenz curve calculation: (0,0) -> cumulative speaker frac vs cumulative talk frac
    lorenz_points: List[LorenzPoint] = [LorenzPoint(speaker_fraction=0.0, talk_time_fraction=0.0)]
    if speakers and total_speech_time > 0:
        sorted_times = sorted(talk_times)
        cum_talk = 0.0
        n_spk = len(sorted_times)
        for i, t in enumerate(sorted_times):
            cum_talk += t
            lorenz_points.append(
                LorenzPoint(
                    speaker_fraction=round((i + 1) / n_spk, 3),
                    talk_time_fraction=round(cum_talk / total_speech_time, 3)
                )
            )
            
    # 3. Interruption statistics
    interruption_stats: Dict[str, Dict[str, int]] = {
        s: {"initiated": 0, "received": 0} for s in speakers
    }
    for event in interruptions:
        if event.interrupter_id in interruption_stats:
            interruption_stats[event.interrupter_id]["initiated"] += 1
        if event.interrupted_id in interruption_stats:
            interruption_stats[event.interrupted_id]["received"] += 1
            
    # 4. Speaker stats summary
    speaker_stats: Dict[str, Any] = {}
    for s in speakers:
        t_time = speaker_durations[s]
        pct = round((t_time / total_speech_time * 100) if total_speech_time > 0 else 0.0, 1)
        speaker_stats[s] = {
            "total_talk_time": t_time,
            "talk_time_pct": pct,
            "interruptions_initiated": interruption_stats[s]["initiated"],
            "interruptions_received": interruption_stats[s]["received"]
        }
        
    # 5. Top speakers dominance headline (e.g., "2 of 6 participants accounted for 68% of total speaking time")
    if speakers:
        sorted_by_talk = sorted(speaker_stats.items(), key=lambda item: item[1]["total_talk_time"], reverse=True)
        top_k = max(1, len(speakers) // 3)
        top_talk_pct = sum(item[1]["talk_time_pct"] for item in sorted_by_talk[:top_k])
        headline = f"{top_k} of {len(speakers)} participants accounted for {top_talk_pct:.0f}% of total speaking time."
    else:
        headline = "No speech detected."
        
    return EquityMetrics(
        total_discussion_time=round(total_duration, 2),
        total_speech_time=total_speech_time,
        total_silence_time=total_silence_time,
        gini_coefficient=gini,
        gini_interpretation=gini_desc,
        top_speakers_share_headline=headline,
        lorenz_curve=lorenz_points,
        speaker_stats=speaker_stats,
        interruption_stats=interruption_stats
    )
