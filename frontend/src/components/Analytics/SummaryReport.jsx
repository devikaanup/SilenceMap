import React from 'react';
import { Award, TrendingUp, AlertTriangle, ShieldCheck, RotateCcw, PlusCircle, Users, Clock, Flame } from 'lucide-react';
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

  // Determine color based on Gini coefficient in warm cozy palette
  let giniColor = '#10B981'; // Sage Emerald (Equal)
  if (gini >= 0.50) {
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
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
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
        background: gini >= 0.40 ? '#FEF3C7' : '#EEF5F0',
        border: `1px solid ${gini >= 0.40 ? '#FDE68A' : '#C7DDD0'}`,
        borderRadius: '1rem',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(92, 64, 40, 0.04)'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: gini >= 0.40 ? '#FEE2E2' : '#D1FAE5',
          color: gini >= 0.40 ? '#DC2626' : '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: `1px solid ${gini >= 0.40 ? '#FECACA' : '#A7F3D0'}`
        }}>
          {gini >= 0.40 ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
        </div>
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: gini >= 0.40 ? '#B45309' : '#047857', fontFamily: 'JetBrains Mono, monospace' }}>
            Participation Inequality Headline
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
                  <td className="font-mono" style={{ padding: '0.75rem 1rem', color: stats.interruptions_initiated > 0 ? '#DC2626' : '#8A7565', fontWeight: stats.interruptions_initiated > 0 ? 800 : 400 }}>
                    {stats.interruptions_initiated}
                  </td>
                  <td className="font-mono" style={{ padding: '0.75rem 1rem', color: stats.interruptions_received > 0 ? '#D97706' : '#8A7565', fontWeight: stats.interruptions_received > 0 ? 800 : 400 }}>
                    {stats.interruptions_received}
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
      />
    </div>
  );
}
