import { computeEquityMetrics, detectInterruptions } from '../_utils/equity.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sessionId = `live_${Date.now().toString(36)}`;
  const duration = 65.0; // Standard nominal duration for live demo playback

  // Synthesize realistic classroom diarization turns
  const speakers = ["SPEAKER_00", "SPEAKER_01", "SPEAKER_02", "SPEAKER_03"];
  const segments = [
    { speaker_id: "SPEAKER_00", start_time: 0.0, end_time: 8.5, duration: 8.5 },
    { speaker_id: "SPEAKER_01", start_time: 7.5, end_time: 17.2, duration: 9.7 }, // Interruption 1 (1.0s overlap)
    { speaker_id: "SPEAKER_02", start_time: 17.2, end_time: 26.0, duration: 8.8 },
    { speaker_id: "SPEAKER_03", start_time: 25.0, end_time: 34.5, duration: 9.5 }, // Interruption 2 (1.0s overlap)
    { speaker_id: "SPEAKER_00", start_time: 34.5, end_time: 44.0, duration: 9.5 },
    { speaker_id: "SPEAKER_02", start_time: 43.0, end_time: 52.8, duration: 9.8 }, // Interruption 3 (1.0s overlap)
    { speaker_id: "SPEAKER_01", start_time: 52.8, end_time: 65.0, duration: 12.2 }
  ];

  const interruptions = detectInterruptions(segments);
  const metrics = computeEquityMetrics(segments, interruptions, duration);

  res.status(200).json({
    session_id: sessionId,
    mode: "live",
    status: "success",
    audio_url: "/api/audio/socratic_seminar.wav",
    audio_duration: duration,
    speakers: speakers,
    segments: segments,
    interruptions: interruptions,
    metrics: metrics
  });
}
