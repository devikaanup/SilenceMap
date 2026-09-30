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
    <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ShieldAlert size={16} color="#DC2626" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
            Interruption Direction Matrix
          </h4>
        </div>
        <span style={{
          fontSize: '0.75rem',
          color: '#B91C1C',
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          padding: '0.2rem 0.65rem',
          borderRadius: '9999px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700
        }}>
          Total Collisions: <strong>{totalInterruptions}</strong>
        </span>
      </div>

      <p style={{ fontSize: '0.78rem', color: '#6B5A4E', marginBottom: '1rem' }}>
        Rows indicate who initiated the interruption; columns indicate who was interrupted.
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
                        ? count > 1
                          ? '#FEE2E2'
                          : '#FEF3C7'
                        : isSelf
                        ? '#FAF4ED'
                        : 'transparent',
                      color: hasCount
                        ? count > 1
                          ? '#B91C1C'
                          : '#B45309'
                        : isSelf
                        ? '#C4B5A5'
                        : '#8A7565',
                      fontWeight: hasCount ? 800 : 400,
                      borderRadius: '4px'
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
