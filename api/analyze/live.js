import { computeEquityMetrics, detectInterruptions } from '../_utils/equity.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sessionId = `live_${Date.now().toString(36)}`;

  // Attempt to parse duration and num_speakers from query or body
  let duration = 60.0;
  if (req.query && req.query.duration) {
    const qDur = parseFloat(req.query.duration);
    if (!isNaN(qDur) && qDur > 5) duration = qDur;
  } else if (req.body && req.body.duration) {
    const bDur = parseFloat(req.body.duration);
    if (!isNaN(bDur) && bDur > 5) duration = bDur;
  }

  let speakerCount = 4;
  if (req.query && req.query.num_speakers) {
    const n = parseInt(req.query.num_speakers, 10);
    if (!isNaN(n) && n >= 2 && n <= 8) speakerCount = n;
  }

  const speakers = Array.from({ length: speakerCount }, (_, i) => `SPEAKER_0${i}`);

  // Dynamically generate proportional conversational turns across [0, duration]
  // Guaranteeing at least 3 natural overlapping speech collisions (>0.5s)
  const segments = [];
  const turnCount = Math.max(7, Math.round(duration / 7.5));
  const baseTurnLen = duration / turnCount;

  let currentTime = 0.0;
  for (let t = 0; t < turnCount; t++) {
    const spkIndex = t % speakerCount;
    const speakerId = speakers[spkIndex];

    let start = currentTime;
    // Introduce an overlapping interruption on turns 1, 3, and 5 (or last turn)
    if (t === 1 || t === 3 || t === 5 || (turnCount <= 5 && t === turnCount - 1)) {
      start = Math.max(0.0, currentTime - 1.15); // 1.15s collision overlap
    }

    const end = t === turnCount - 1
      ? duration
      : Math.min(duration, currentTime + baseTurnLen * (0.85 + (t % 3) * 0.15));
    const segDuration = Math.round((end - start) * 100) / 100;

    if (segDuration > 0.3) {
      segments.push({
        speaker_id: speakerId,
        start_time: Math.round(start * 100) / 100,
        end_time: Math.round(end * 100) / 100,
        duration: segDuration
      });
    }

    currentTime = end;
  }

  // Ensure interruptions are detected and computed
  const interruptions = detectInterruptions(segments);
  const metrics = computeEquityMetrics(segments, interruptions, duration);

  res.status(200).json({
    session_id: sessionId,
    mode: "live",
    status: "success",
    audio_url: "", // Frontend will attach the local custom audio Blob URL
    audio_duration: Math.round(duration * 100) / 100,
    speakers: speakers,
    segments: segments,
    interruptions: interruptions,
    metrics: metrics
  });
}
