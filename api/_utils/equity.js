// Equity metrics and preset data engine for Vercel Serverless Functions

export const PRESETS_DATA = {
  socratic_seminar: {
    id: "socratic_seminar",
    title: "High School Socratic Seminar",
    description: "6 students discussing digital platform age restrictions with Google AI Studio voices. Alex and Maya dominate with 3 clear interruptions.",
    speaker_count: 6,
    audio_duration: 72.64,
    audio_file: "socratic_seminar.wav",
    segments: [
      { speaker_id: "SPEAKER_00", start_time: 0.0, end_time: 6.36, duration: 6.36 },
      { speaker_id: "SPEAKER_01", start_time: 5.06, end_time: 12.14, duration: 7.08 },
      { speaker_id: "SPEAKER_02", start_time: 12.14, end_time: 15.7, duration: 3.56 },
      { speaker_id: "SPEAKER_00", start_time: 15.7, end_time: 22.5, duration: 6.8 },
      { speaker_id: "SPEAKER_03", start_time: 22.5, end_time: 25.78, duration: 3.28 },
      { speaker_id: "SPEAKER_01", start_time: 24.68, end_time: 31.98, duration: 7.3 },
      { speaker_id: "SPEAKER_04", start_time: 31.98, end_time: 34.9, duration: 2.92 },
      { speaker_id: "SPEAKER_00", start_time: 34.9, end_time: 41.52, duration: 6.62 },
      { speaker_id: "SPEAKER_05", start_time: 41.52, end_time: 44.38, duration: 2.86 },
      { speaker_id: "SPEAKER_01", start_time: 44.38, end_time: 51.52, duration: 7.14 },
      { speaker_id: "SPEAKER_02", start_time: 51.52, end_time: 55.06, duration: 3.54 },
      { speaker_id: "SPEAKER_00", start_time: 55.06, end_time: 61.64, duration: 6.58 },
      { speaker_id: "SPEAKER_01", start_time: 60.54, end_time: 67.8, duration: 7.26 },
      { speaker_id: "SPEAKER_03", start_time: 67.8, end_time: 72.64, duration: 4.84 }
    ]
  },
  stem_collaboration: {
    id: "stem_collaboration",
    title: "Collaborative STEM Lab Discussion",
    description: "4 students planning a physics experiment; SPEAKER_02 cuts in on SPEAKER_00 near the end.",
    speaker_count: 4,
    audio_duration: 51.6,
    audio_file: "stem_collaboration.wav",
    segments: [
      { speaker_id: "SPEAKER_00", start_time: 0.0, end_time: 7.84, duration: 7.84 },
      { speaker_id: "SPEAKER_01", start_time: 7.84, end_time: 16.36, duration: 8.52 },
      { speaker_id: "SPEAKER_02", start_time: 16.36, end_time: 25.08, duration: 8.72 },
      { speaker_id: "SPEAKER_03", start_time: 25.08, end_time: 31.6, duration: 6.52 },
      { speaker_id: "SPEAKER_00", start_time: 31.6, end_time: 38.56, duration: 6.96 },
      { speaker_id: "SPEAKER_02", start_time: 37.76, end_time: 48.0, duration: 10.24 },
      { speaker_id: "SPEAKER_01", start_time: 48.0, end_time: 51.6, duration: 3.6 }
    ]
  }
};

export function detectInterruptions(segments) {
  const interruptions = [];
  const minOverlap = 0.3; // 0.3s collision threshold

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const segA = segments[i];
      const segB = segments[j];

      if (segA.speaker_id === segB.speaker_id) continue;

      const overlapStart = Math.max(segA.start_time, segB.start_time);
      const overlapEnd = Math.min(segA.end_time, segB.end_time);
      const overlapDuration = overlapEnd - overlapStart;

      if (overlapDuration >= minOverlap) {
        // Speaker who started later is the interrupter
        const interrupter = segA.start_time < segB.start_time ? segB.speaker_id : segA.speaker_id;
        const interrupted = segA.start_time < segB.start_time ? segA.speaker_id : segB.speaker_id;

        interruptions.push({
          id: `int_${i}_${j}_${Math.round(overlapStart)}`,
          interrupter_id: interrupter,
          interrupted_id: interrupted,
          start_time: Math.round(overlapStart * 100) / 100,
          end_time: Math.round(overlapEnd * 100) / 100,
          overlap_duration: Math.round(overlapDuration * 100) / 100
        });
      }
    }
  }

  // Deduplicate and sort chronologically
  return interruptions.sort((a, b) => a.start_time - b.start_time);
}

export function computeEquityMetrics(segments, interruptions, totalDiscussionTime) {
  const speakerTotals = {};
  let totalSpeech = 0;

  for (const seg of segments) {
    speakerTotals[seg.speaker_id] = (speakerTotals[seg.speaker_id] || 0) + seg.duration;
    totalSpeech += seg.duration;
  }

  const speakers = Object.keys(speakerTotals).sort();
  const n = speakers.length;

  if (n === 0) {
    return {
      total_discussion_time: totalDiscussionTime,
      total_speech_time: 0,
      total_silence_time: totalDiscussionTime,
      gini_coefficient: 0,
      gini_interpretation: "N/A",
      top_speakers_share_headline: "No speech detected",
      lorenz_curve: [],
      speaker_stats: {},
      interruption_stats: {}
    };
  }

  const durations = speakers.map(s => speakerTotals[s]);

  // Gini formula
  let diffSum = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      diffSum += Math.abs(durations[i] - durations[j]);
    }
  }

  const denominator = 2 * n * (durations.reduce((a, b) => a + b, 0) || 1);
  const gini = Math.min(1.0, Math.max(0.0, diffSum / denominator));

  let interpretation = "Highly Equitable";
  if (gini > 0.50) interpretation = "Floor Monopolized";
  else if (gini > 0.35) interpretation = "Unbalanced";
  else if (gini > 0.20) interpretation = "Mildly Uneven";

  // Lorenz curve
  const sortedDurations = [...durations].sort((a, b) => a - b);
  const totalDur = sortedDurations.reduce((a, b) => a + b, 0) || 1;
  const lorenzCurve = [{ speaker_fraction: 0, talk_time_fraction: 0 }];
  let cumSum = 0;

  for (let i = 0; i < n; i++) {
    cumSum += sortedDurations[i];
    lorenzCurve.push({
      speaker_fraction: Math.round(((i + 1) / n) * 100) / 100,
      talk_time_fraction: Math.round((cumSum / totalDur) * 100) / 100
    });
  }

  // Interruption stats
  const interruptionStats = {};
  for (const s of speakers) {
    interruptionStats[s] = { initiated: 0, received: 0 };
  }
  for (const intEvt of interruptions) {
    if (interruptionStats[intEvt.interrupter_id]) interruptionStats[intEvt.interrupter_id].initiated += 1;
    if (interruptionStats[intEvt.interrupted_id]) interruptionStats[intEvt.interrupted_id].received += 1;
  }

  // Speaker stats
  const speakerStats = {};
  for (const s of speakers) {
    const talk = Math.round(speakerTotals[s] * 10) / 10;
    const pct = Math.round((talk / (totalSpeech || 1)) * 100);
    speakerStats[s] = {
      total_talk_time: talk,
      talk_time_pct: pct,
      interruptions_initiated: interruptionStats[s]?.initiated || 0,
      interruptions_received: interruptionStats[s]?.received || 0
    };
  }

  // Top speaker headline
  const sortedByTalk = [...speakers].sort((a, b) => speakerTotals[b] - speakerTotals[a]);
  let headline = "Equitable participation across all students.";
  if (n >= 2 && sortedByTalk.length >= 2) {
    const top2Sum = (speakerTotals[sortedByTalk[0]] || 0) + (speakerTotals[sortedByTalk[1]] || 0);
    const top2Pct = Math.round((top2Sum / (totalSpeech || 1)) * 100);
    if (top2Pct >= 50) {
      headline = `Top 2 speakers held ${top2Pct}% of total discussion floor time.`;
    }
  }

  return {
    total_discussion_time: Math.round(totalDiscussionTime * 10) / 10,
    total_speech_time: Math.round(totalSpeech * 10) / 10,
    total_silence_time: Math.max(0, Math.round((totalDiscussionTime - totalSpeech) * 10) / 10),
    gini_coefficient: Math.round(gini * 100) / 100,
    gini_interpretation: interpretation,
    top_speakers_share_headline: headline,
    lorenz_curve: lorenzCurve,
    speaker_stats: speakerStats,
    interruption_stats: interruptionStats
  };
}

export function loadPresetResponse(presetId) {
  const data = PRESETS_DATA[presetId] || PRESETS_DATA.socratic_seminar;
  const segments = data.segments.map(s => ({ ...s }));
  const duration = data.audio_duration;
  const interruptions = detectInterruptions(segments);
  const metrics = computeEquityMetrics(segments, interruptions, duration);
  const speakers = Array.from(new Set(segments.map(s => s.speaker_id))).sort();

  return {
    session_id: `preset_${data.id}`,
    mode: "preset",
    status: "success",
    audio_url: `/api/audio/${data.audio_file}`,
    audio_duration: duration,
    speakers: speakers,
    segments: segments,
    interruptions: interruptions,
    metrics: metrics
  };
}
