import React from 'react';
import { Award, TrendingUp, AlertTriangle, ShieldCheck, ShieldAlert, RotateCcw, PlusCircle, Users, Clock, Flame } from 'lucide-react';
import LorenzChart from './LorenzChart.jsx';
import InterruptionMatrix from './InterruptionMatrix.jsx';
import TakeawayCards from './TakeawayCards.jsx';

export default function SummaryReport({
  metrics,
  speakers = [],
  seats = [],
  interruptions = [],
  onReplay,
  onReset
}) {
  if (!metrics) return null;

  const gini = metrics.gini_coefficient || 0.0;
  const headline = metrics.top_speakers_share_headline || 'Discussion analysis complete.';
  const speakerStats = metrics.speaker_stats || {};

  // Gini Gauge calculation (semi-circular SVG arc)
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - gini);

  // Determine color based on Gini coefficient & interruptions in warm cozy palette
  let giniColor = '#10B981'; // Sage Emerald (Equal)
  if (interruptions.length >= 4) {
    giniColor = '#DC2626'; // Rose/Crimson (Contested/Disrupted)
  } else if (interruptions.length >= 2) {
    giniColor = '#E07A5F'; // Terracotta (Friction)
  } else if (gini >= 0.50) {
    giniColor = '#DC2626'; // Deep Rose (Monopoly)
  } else if (gini >= 0.35) {
    giniColor = '#E07A5F'; // Terracotta (Uneven)
  } else if (gini >= 0.20) {
    giniColor = '#D97706'; // Warm Amber (Mildly uneven)
  }

  // Helper to find student name for a speaker ID
  const getStudentName = (spkId) => {
    const seat = seats.find((s) => s.speaker_id === spkId);
    return seat?.student_name || spkId;
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '880px' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#7A6150',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'JetBrains Mono, monospace',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: interruptions.length >= 4 ? '#DC2626' : '#10B981' }} />
            <span>Discussion Completed &bull; Telemetry Summary</span>
          </span>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#231A12', marginTop: '0.2rem', fontFamily: 'Playfair Display, Georgia, serif' }}>
            Classroom Equity Intelligence Report
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onReplay}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: '0.75rem',
              background: '#F5E6D8',
              border: '1px solid #E4D0BD',
              color: '#7A6150',
              fontSize: '0.82rem',
              fontWeight: 700,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#231A12';
              e.currentTarget.style.borderColor = '#D97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#7A6150';
              e.currentTarget.style.borderColor = '#E4D0BD';
            }}
          >
            <RotateCcw size={14} />
            <span>Replay Heatmap</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              color: '#231A12',
              fontSize: '0.82rem',
              fontWeight: 800,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #E59306 0%, #D97736 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)';
            }}
          >
            <PlusCircle size={14} />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Primary Headline Inequality Banner */}
      <div style={{
        background: (gini >= 0.35 || interruptions.length >= 3) ? (interruptions.length >= 4 ? '#FFF0F2' : '#FEF3C7') : '#EEF5F0',
        border: `1px solid ${(gini >= 0.35 || interruptions.length >= 3) ? (interruptions.length >= 4 ? 'rgba(255, 0, 51, 0.4)' : '#FDE68A') : '#C7DDD0'}`,
        borderRadius: '1rem',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: (interruptions.length >= 4) ? '0 4px 16px rgba(255, 0, 51, 0.1)' : '0 2px 8px rgba(92, 64, 40, 0.04)'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: interruptions.length >= 4 ? '#FEE2E2' : (gini >= 0.35 || interruptions.length >= 3) ? '#FEF3C7' : '#D1FAE5',
          color: interruptions.length >= 4 ? '#FF0033' : (gini >= 0.35 || interruptions.length >= 3) ? '#B45309' : '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: `1px solid ${interruptions.length >= 4 ? '#FECACA' : (gini >= 0.35 || interruptions.length >= 3) ? '#FDE68A' : '#A7F3D0'}`
        }}>
          {interruptions.length >= 4 ? <ShieldAlert size={24} strokeWidth={2.4} /> : (gini >= 0.35 || interruptions.length >= 3) ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
        </div>
        <div>
          <p style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: interruptions.length >= 4 ? '#DC2626' : (gini >= 0.35 || interruptions.length >= 3) ? '#B45309' : '#047857',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {interruptions.length >= 4 ? 'Conversational Collision Warning' : 'Participation Inequality Headline'}
          </p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#231A12', marginTop: '0.2rem', fontFamily: 'Playfair Display, Georgia, serif' }}>
            {headline}
          </h3>
        </div>
      </div>

      {/* Metrics Row: Gini Gauge + Lorenz Curve + Durations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Semi-circular Gini Gauge */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8A7565', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'JetBrains Mono, monospace' }}>
            Gini Equity Index
          </span>

          <div style={{ position: 'relative', width: '180px', height: '100px', display: 'flex', justifyContent: 'center' }}>
            <svg
              role="img"
              aria-label={`Gini coefficient gauge displaying ${gini.toFixed(2)}, classified as ${metrics.gini_interpretation}`}
              width="180"
              height="100"
              viewBox="0 0 180 100"
            >
              <path
                d="M 10 90 A 80 80 0 0 1 170 90"
                fill="none"
                stroke="#E8DACB"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 10 90 A 80 80 0 0 1 170 90"
                fill="none"
                stroke={giniColor}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s var(--ease-out-expo)' }}
              />
            </svg>

            <div style={{ position: 'absolute', bottom: '0', textAlign: 'center' }}>
              <span className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#231A12' }}>
                {gini.toFixed(2)}
              </span>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: giniColor, marginTop: '-2px', fontFamily: 'JetBrains Mono, monospace' }}>
                {metrics.gini_interpretation}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.7rem', color: '#8A7565', marginTop: '0.75rem', padding: '0 0.5rem', fontFamily: 'JetBrains Mono, monospace' }}>
            <span>0.00 (Equal)</span>
            <span>0.50 (Unbalanced)</span>
            <span>1.00 (Monopoly)</span>
          </div>
        </div>

        {/* Lorenz Curve Visual */}
        <LorenzChart
          lorenzPoints={metrics.lorenz_curve || []}
          giniCoefficient={gini}
          interruptions={interruptions}
          speakerStats={speakerStats}
          speakers={speakers}
          seats={seats}
        />


        {/* Discussion Duration Breakdown Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="#D97706" />
              <div>
                <span style={{ fontSize: '0.7rem', color: '#8A7565', fontFamily: 'JetBrains Mono, monospace' }}>Total Discussion</span>
                <p className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#231A12' }}>
                  {metrics.total_discussion_time}s
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6B5A4E', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>100%</span>
          </div>

          <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame size={16} color="#E07A5F" />
              <div>
                <span style={{ fontSize: '0.7rem', color: '#8A7565', fontFamily: 'JetBrains Mono, monospace' }}>Active Speech</span>
                <p className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#E07A5F' }}>
                  {metrics.total_speech_time}s
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#E07A5F', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {Math.round((metrics.total_speech_time / (metrics.total_discussion_time || 1)) * 100)}%
            </span>
          </div>

          <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="#78A083" />
              <div>
                <span style={{ fontSize: '0.7rem', color: '#8A7565', fontFamily: 'JetBrains Mono, monospace' }}>Silence & Pauses</span>
                <p className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#231A12' }}>
                  {metrics.total_silence_time}s
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#8A7565', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {Math.round((metrics.total_silence_time / (metrics.total_discussion_time || 1)) * 100)}%
            </span>
          </div>

          {/* Interruption Collisions Quick Card - Bright Red */}
          <div className="glass-card" style={{
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFF0F2',
            border: '1.5px solid rgba(255, 0, 51, 0.45)',
            boxShadow: '0 2px 10px rgba(255, 0, 51, 0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={16} color="#FF0033" strokeWidth={2.6} />
              <div>
                <span style={{ fontSize: '0.7rem', color: '#B91C1C', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>Interruption Collisions</span>
                <p className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 900, color: '#FF0033' }}>
                  {interruptions.length} events
                </p>
              </div>
            </div>
            <span style={{
              fontSize: '0.72rem',
              color: '#FFFFFF',
              background: '#FF0033',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              boxShadow: '0 0 10px rgba(255, 0, 51, 0.7)'
            }}>
              #FF0033
            </span>
          </div>
        </div>
      </div>

      {/* Interruption Matrix */}
      <div style={{ marginBottom: '2rem' }}>
        <InterruptionMatrix
          speakers={speakers}
          interruptions={interruptions}
          seats={seats}
        />
      </div>

      {/* Student Participation Table */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#231A12', marginBottom: '0.75rem', fontFamily: 'Playfair Display, Georgia, serif' }}>
        Individual Student Equity Breakdown
      </h3>

      <div style={{
        background: '#FAF4ED',
        borderRadius: '1rem',
        border: '1px solid #E8DACB',
        overflow: 'hidden',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(92, 64, 40, 0.04)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F5E6D8', borderBottom: '1px solid #E4D0BD', color: '#7A6150', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Student</th>
              <th style={{ padding: '0.75rem 1rem' }}>Speaker ID</th>
              <th style={{ padding: '0.75rem 1rem' }}>Talk Time</th>
              <th style={{ padding: '0.75rem 1rem' }}>Share %</th>
              <th style={{ padding: '0.75rem 1rem' }}>Interrupts Initiated</th>
              <th style={{ padding: '0.75rem 1rem' }}>Interrupts Received</th>
            </tr>
          </thead>
          <tbody>
            {speakers.map((spkId, idx) => {
              const stats = speakerStats[spkId] || { total_talk_time: 0, talk_time_pct: 0, interruptions_initiated: 0, interruptions_received: 0 };
              const name = getStudentName(spkId);
              const isDominant = stats.talk_time_pct > 25;

              return (
                <tr key={spkId} style={{ borderBottom: '1px solid #E8DACB', background: idx % 2 === 0 ? '#FFFFFF' : '#FAF4ED' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif' }}>
                    {name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#8A7565', fontFamily: 'JetBrains Mono, monospace' }}>
                    {spkId}
                  </td>
                  <td className="font-mono" style={{ padding: '0.75rem 1rem', color: isDominant ? '#B45309' : '#231A12', fontWeight: 700 }}>
                    {stats.total_talk_time}s
                  </td>
                  <td className="font-mono" style={{ padding: '0.75rem 1rem', fontWeight: 800, color: isDominant ? '#DC2626' : '#6B5A4E' }}>
                    {stats.talk_time_pct}%
                  </td>
                  <td className="font-mono" style={{ padding: '0.75rem 1rem' }}>
                    {stats.interruptions_initiated > 0 ? (
                      <span style={{
                        background: '#FF0033',
                        color: '#FFFFFF',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        boxShadow: '0 0 10px rgba(255, 0, 51, 0.75)',
                        display: 'inline-block',
                        border: '1px solid #FF3366'
                      }}>
                        {stats.interruptions_initiated}
                      </span>
                    ) : (
                      <span style={{ color: '#8A7565' }}>0</span>
                    )}
                  </td>
                  <td className="font-mono" style={{ padding: '0.75rem 1rem' }}>
                    {stats.interruptions_received > 0 ? (
                      <span style={{
                        background: '#FF1744',
                        color: '#FFFFFF',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        boxShadow: '0 0 10px rgba(255, 23, 68, 0.75)',
                        display: 'inline-block',
                        border: '1px solid #FF5277'
                      }}>
                        {stats.interruptions_received}
                      </span>
                    ) : (
                      <span style={{ color: '#8A7565' }}>0</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Actionable Pedagogical Takeaways */}
      <TakeawayCards
        metrics={metrics}
        speakers={speakers}
        seats={seats}
        interruptions={interruptions}
      />
    </div>
  );
}
