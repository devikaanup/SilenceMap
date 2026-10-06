import React, { useMemo } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

/**
 * LorenzChart renders an SVG Lorenz Curve comparing actual cumulative talk-time
 * distribution against the 45-degree line of perfect equality, with collision-adjusted
 * telemetry when conversational interruptions occur.
 */
export default function LorenzChart({
  lorenzPoints = [],
  giniCoefficient = 0.0,
  interruptions = [],
  speakerStats = {},
  speakers = []
}) {
  if (!lorenzPoints || lorenzPoints.length === 0) return null;

  const width = 290;
  const height = 220;
  const padding = 35;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Convert (0..1, 0..1) to SVG coordinates
  const toSvgCoords = (p) => {
    const x = padding + p.speaker_fraction * graphWidth;
    const y = height - padding - p.talk_time_fraction * graphHeight;
    return { x, y };
  };

  const svgPoints = lorenzPoints.map(toSvgCoords);
  const pathD = svgPoints.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Shaded Gini Area (from Lorenz curve to 45 degree line)
  const areaD = `${pathD} L ${padding + graphWidth} ${height - padding} L ${padding} ${height - padding} Z`;

  // Compute collision-adjusted equity curve when interruptions are present
  const adjustedSvgPoints = useMemo(() => {
    if (!interruptions || interruptions.length === 0 || !speakers || speakers.length <= 1) {
      return null;
    }

    // Calculate uninterrupted/effective talk time per speaker by deducting initiated collisions
    const effectiveDurations = speakers.map((s) => {
      const stats = speakerStats[s];
      const rawTalk = stats?.total_talk_time || 10.0;
      const intInitiated = stats?.interruptions_initiated || 0;
      const intReceived = stats?.interruptions_received || 0;
      // Discount talk time captured aggressively through interruptions
      const penalty = intInitiated * 2.5 + intReceived * 1.0;
      return Math.max(0.5, rawTalk - penalty);
    });

    const sortedEff = [...effectiveDurations].sort((a, b) => a - b);
    const totalEff = sortedEff.reduce((a, b) => a + b, 0) || 1;
    let cum = 0;
    const n = sortedEff.length;

    const points = [{ speaker_fraction: 0, talk_time_fraction: 0 }];
    for (let i = 0; i < n; i++) {
      cum += sortedEff[i];
      points.push({
        speaker_fraction: (i + 1) / n,
        talk_time_fraction: cum / totalEff
      });
    }

    return points.map(toSvgCoords);
  }, [interruptions, speakerStats, speakers]);

  const adjustedPathD = adjustedSvgPoints
    ? adjustedSvgPoints.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')
    : null;

  const hasCollisions = interruptions && interruptions.length > 0;
  const isSevere = interruptions && interruptions.length >= 4;

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <TrendingUp size={16} color={isSevere ? '#DC2626' : '#D97706'} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
            Lorenz Equity Curve
          </h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace' }}>
          <span>Gini: <strong style={{ color: isSevere ? '#DC2626' : '#D97706' }}>{giniCoefficient.toFixed(2)}</strong></span>
          {hasCollisions && (
            <span style={{
              background: isSevere ? '#FEE2E2' : '#FEF3C7',
              color: isSevere ? '#DC2626' : '#B45309',
              padding: '1px 6px',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '0.65rem',
              border: `1px solid ${isSevere ? '#FECACA' : '#FDE68A'}`
            }}>
              ⚡ {interruptions.length} Collisions
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          role="img"
          aria-label={`Lorenz curve chart showing cumulative discussion distribution against the 45-degree line of perfect equality. Gini index is ${giniCoefficient.toFixed(2)}. ${hasCollisions ? `${interruptions.length} collisions recorded.` : ''}`}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Background Grid */}
          <rect
            x={padding}
            y={padding}
            width={graphWidth}
            height={graphHeight}
            fill="#FAF4ED"
            stroke="#E8DACB"
            rx="6"
          />

          {/* Shaded Inequality Gap */}
          <path
            d={areaD}
            fill={isSevere ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.14)'}
          />

          {/* 45-degree Perfect Equality Line */}
          <line
            x1={padding}
            y1={height - padding}
            x2={padding + graphWidth}
            y2={padding}
            stroke="#8A7565"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Collision-Adjusted Equity Curve (if collisions occurred) */}
          {adjustedPathD && (
            <path
              d={adjustedPathD}
              fill="none"
              stroke="#DC2626"
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(220, 38, 38, 0.25))' }}
            />
          )}

          {/* Actual Nominal Lorenz Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#E07A5F"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(224, 122, 95, 0.3))' }}
          />

          {/* Plotted Points */}
          {svgPoints.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={i === 0 || i === svgPoints.length - 1 ? 3 : 4}
              fill={isSevere ? '#DC2626' : '#F59E0B'}
              stroke="#FFFDF8"
              strokeWidth="1.5"
            />
          ))}

          {/* Axes Labels */}
          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            fill="#8A7565"
            fontSize="9"
            fontWeight="700"
            fontFamily="JetBrains Mono, monospace"
          >
            Cumulative % of Students →
          </text>
          <text
            x={10}
            y={height / 2}
            textAnchor="middle"
            fill="#8A7565"
            fontSize="9"
            fontWeight="700"
            fontFamily="JetBrains Mono, monospace"
            transform={`rotate(-90 10 ${height / 2})`}
          >
            Cumulative % of Talk Time →
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.65rem', fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace', color: '#6B5A4E' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <div style={{ width: '10px', height: '2px', background: '#8A7565', borderBottom: '1px dashed #8A7565' }} />
          <span>Perfect Equality</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <div style={{ width: '10px', height: '2.5px', background: '#E07A5F', borderRadius: '1px' }} />
          <span>Nominal Airtime</span>
        </div>
        {adjustedPathD && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '10px', height: '2px', background: '#DC2626', borderBottom: '1px dashed #DC2626' }} />
            <span style={{ color: '#DC2626' }}>Collision-Adjusted</span>
          </div>
        )}
      </div>

      {/* Collision Diagnostic Callout */}
      {hasCollisions && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          background: isSevere ? '#FFF0F2' : '#FEF3C7',
          border: `1px solid ${isSevere ? 'rgba(255, 0, 51, 0.25)' : '#FDE68A'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.72rem',
          color: isSevere ? '#991B1B' : '#92400E',
          lineHeight: 1.4
        }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, color: isSevere ? '#DC2626' : '#D97706' }} />
          <span>
            {isSevere
              ? `Warning: ${interruptions.length} collisions detected. Turn-taking was seized through interruptions, creating a hidden interactional equity gap.`
              : `${interruptions.length} minor overlap collisions detected during floor transitions.`}
          </span>
        </div>
      )}
    </div>
  );
}

