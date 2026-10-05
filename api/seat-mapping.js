export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { session_id, seats } = req.body || {};
  res.status(200).json({
    status: 'success',
    session_id: session_id || 'session_default',
    seats: seats || []
  });
}
