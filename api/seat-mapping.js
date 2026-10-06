export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const body = req.body;
  const assignments = Array.isArray(body)
    ? body
    : (body?.seats || body?.assignments || []);
  const sessionId = Array.isArray(body)
    ? 'session_default'
    : (body?.session_id || 'session_default');

  const mappedCount = assignments.filter((a) => a && a.speaker_id).length;

  res.status(200).json({
    status: 'success',
    session_id: sessionId,
    mapped_count: mappedCount,
    assignments: assignments,
    seats: assignments
  });
}
