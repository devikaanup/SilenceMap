import React from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * LorenzChart renders an SVG Lorenz Curve comparing actual cumulative talk-time
 * distribution against the 45-degree line of perfect equality.
 */
export default function LorenzChart({ lorenzPoints = [], giniCoefficient = 0.0 }) {
  if (!lorenzPoints || lorenzPoints.length === 0) return null;

  const width = 280;
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

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <TrendingUp size={16} color="#D97706" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
            Lorenz Equity Curve
          </h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#6B5A4E', fontFamily: 'JetBrains Mono, monospace' }}>
          Gini: <strong style={{ color: '#D97706' }}>{giniCoefficient.toFixed(2)}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          role="img"
          aria-label={`Lorenz curve chart showing cumulative discussion distribution against the 45-degree line of perfect equality. Gini index is ${giniCoefficient.toFixed(2)}.`}
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
            fill="rgba(245, 158, 11, 0.16)"
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

          {/* Actual Lorenz Curve */}
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
              fill="#F59E0B"
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

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '0.65rem', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: '#6B5A4E' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '12px', height: '2px', background: '#8A7565', borderBottom: '1px dashed #8A7565' }} />
          <span>Perfect Equality</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '12px', height: '2.5px', background: '#E07A5F', borderRadius: '1px' }} />
          <span>Actual Discussion</span>
        </div>
      </div>
    </div>
  );
}
