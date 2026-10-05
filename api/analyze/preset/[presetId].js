import { loadPresetResponse, PRESETS_DATA } from '../../_utils/equity.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { presetId } = req.query;
  const targetId = presetId || (req.body && req.body.preset_id) || 'socratic_seminar';

  if (!PRESETS_DATA[targetId]) {
    // If not found directly, default to socratic_seminar or return 404
    return res.status(200).json(loadPresetResponse('socratic_seminar'));
  }

  const response = loadPresetResponse(targetId);
  res.status(200).json(response);
}
