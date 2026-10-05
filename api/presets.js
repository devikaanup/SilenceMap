import { PRESETS_DATA } from './_utils/equity.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const presets = Object.values(PRESETS_DATA).map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    speaker_count: p.speaker_count,
    audio_duration: p.audio_duration,
    audio_file: p.audio_file
  }));

  res.status(200).json(presets);
}
