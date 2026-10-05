import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function InterruptionMatrix({
  speakers = [],
  interruptions = [],
  seats = []
}) {
  if (!speakers || speakers.length === 0) return null;

  const getStudentName = (spkId) => {
    const seat = seats.find((s) => s.speaker_id === spkId);
    return seat?.student_name || spkId;
  };

  // Build matrix: matrix[interrupter][interrupted] = count
  const matrix = {};
  speakers.forEach((s1) => {
    matrix[s1] = {};
    speakers.forEach((s2) => {
      matrix[s1][s2] = 0;
    });
  });

  interruptions.forEach((intEvt) => {
    if (matrix[intEvt.interrupter_id] && matrix[intEvt.interrupter_id][intEvt.interrupted_id] !== undefined) {
      matrix[intEvt.interrupter_id][intEvt.interrupted_id] += 1;
    }
  });

  const totalInterruptions = interruptions.length;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto', border: totalInterruptions > 0 ? '1.5px solid rgba(255, 0, 51, 0.3)' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ShieldAlert size={18} color="#FF0033" strokeWidth={2.6} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
            Interruption Direction Matrix
          </h4>
        </div>
        <span style={{
          fontSize: '0.75rem',
          color: '#FFFFFF',
          background: '#FF0033',
          border: '1.5px solid #FF1744',
          boxShadow: '0 0 14px rgba(255, 0, 51, 0.75)',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 800,
          letterSpacing: '0.02em'
        }}>
          Total Collisions: <strong>{totalInterruptions}</strong>
        </span>
      </div>

      <p style={{ fontSize: '0.78rem', color: '#6B5A4E', marginBottom: '1rem' }}>
        Rows indicate who initiated the interruption; columns indicate who was interrupted. Collisions are highlighted in <strong style={{ color: '#FF0033' }}>extremely bright red (#FF0033)</strong>.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'center' }}>
        <thead>
          <tr style={{ background: '#F5E6D8', color: '#7A6150', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '0.5rem 0.75rem', fontWeight: 800, textAlign: 'left', borderBottom: '1px solid #E4D0BD' }}>
              Initiated ↓ / Target →
            </th>
            {speakers.map((spk) => (
              <th key={spk} style={{ padding: '0.5rem 0.6rem', color: '#231A12', fontWeight: 800, minWidth: '48px', borderBottom: '1px solid #E4D0BD' }}>
                {getStudentName(spk)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {speakers.map((sRow) => (
            <tr key={sRow} style={{ borderBottom: '1px solid #E8DACB' }}>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 800, color: '#231A12', textAlign: 'left', fontFamily: 'Playfair Display, Georgia, serif' }}>
                {getStudentName(sRow)}
              </td>
              {speakers.map((sCol) => {
                const isSelf = sRow === sCol;
                const count = isSelf ? '—' : matrix[sRow][sCol];
                const hasCount = count > 0 && !isSelf;

                return (
                  <td
                    key={sCol}
                    className="font-mono"
                    style={{
                      padding: '0.5rem 0.6rem',
                      background: hasCount
                        ? '#FF0033'
                        : isSelf
                        ? '#FAF4ED'
                        : 'transparent',
                      color: hasCount
                        ? '#FFFFFF'
                        : isSelf
                        ? '#C4B5A5'
                        : '#8A7565',
                      fontWeight: hasCount ? 900 : 400,
                      fontSize: hasCount ? '0.85rem' : '0.78rem',
                      borderRadius: hasCount ? '6px' : '0px',
                      border: hasCount ? '1.5px solid #FF3366' : 'none',
                      boxShadow: hasCount ? '0 0 14px rgba(255, 0, 51, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.4)' : 'none'
                    }}
                  >
                    {count}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
