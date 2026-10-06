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

  // Dynamically generate realistic conversational turns across [0, duration]
  // with distinct conversational roles (dominant interrupters vs interrupted participants)
  const segments = [];
  const turnCount = Math.max(8, Math.round(duration / 6.5));
  const baseTurnLen = duration / turnCount;

  // Speaker weights: SPEAKER_00 and SPEAKER_01 are vocal interrupters, others have shorter turns
  const speakerWeights = [1.55, 1.35, 0.65, 0.50, 0.70, 0.60, 0.55, 0.50];
  const collisionTurns = new Set([1, 3, 5, 7]);

  let currentTime = 0.0;
  for (let t = 0; t < turnCount; t++) {
    let spkIndex;
    if (collisionTurns.has(t)) {
      // Interrupter (SPEAKER_00 or SPEAKER_01) seizes floor from previous peer
      spkIndex = t % 2 === 1 ? 0 : 1;
    } else {
      spkIndex = (t % speakerCount);
    }
    const speakerId = speakers[spkIndex];
    const weight = speakerWeights[spkIndex % speakerWeights.length] || 1.0;

    let start = currentTime;
    if (collisionTurns.has(t) && t > 0) {
      start = Math.max(0.0, currentTime - 1.25); // 1.25s collision overlap (>0.5s threshold)
    }

    const naturalLen = baseTurnLen * weight;
    const end = (t === turnCount - 1)
      ? duration
      : Math.min(duration, currentTime + naturalLen);
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
