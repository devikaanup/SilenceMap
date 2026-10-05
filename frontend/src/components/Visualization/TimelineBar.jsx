import React from 'react';
import { AlignLeft } from 'lucide-react';

const SPEAKER_COLORS = [
  '#E07A5F', // Warm Terracotta / Coral
  '#F59E0B', // Honey Amber Gold
  '#78A083', // Cozy Sage Green
  '#D97706', // Warm Ochre
  '#C06C84', // Dusty Rose
  '#3D5A80', // Slate Indigo
  '#E29578', // Warm Apricot
  '#6B705C'  // Olive Taupe
];

export default function TimelineBar({
  segments = [],
  interruptions = [],
  duration = 100,
  currentTime = 0,
  speakers = [],
  seats = [],
  onSeek
}) {
  if (duration <= 0 || segments.length === 0) return null;

  const getSpeakerColor = (speakerId) => {
    const idx = speakers.indexOf(speakerId);
    return idx >= 0 ? SPEAKER_COLORS[idx % SPEAKER_COLORS.length] : '#8A7565';
  };

  const getStudentName = (spkId) => {
    const seat = seats.find((s) => s.speaker_id === spkId);
    return seat?.student_name || spkId;
  };

  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickFraction = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = clickFraction * duration;
    if (onSeek) onSeek(targetTime);
  };

  const playheadPercent = (currentTime / duration) * 100;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', width: '100%', maxWidth: '820px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <AlignLeft size={16} color="#D97706" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
            Speaker Segment Timeline
          </h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#8A7565', fontFamily: 'JetBrains Mono, monospace' }}>
          Click anywhere to scrub
        </span>
      </div>

      {/* Main Interactive Timeline Canvas */}
      <div
        onClick={handleTimelineClick}
        style={{
          position: 'relative',
          height: '64px',
          background: '#FAF4ED',
          borderRadius: '0.65rem',
          border: '1px solid #E8DACB',
          cursor: 'pointer',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 4px rgba(92, 64, 40, 0.04)'
        }}
      >
        {/* Speaker Segments */}
        {segments.map((seg, idx) => {
          const leftPct = (seg.start_time / duration) * 100;
          const widthPct = Math.max(0.5, (seg.duration / duration) * 100);
          const color = getSpeakerColor(seg.speaker_id);

          return (
            <div
              key={idx}
              title={`${getStudentName(seg.speaker_id)}: ${seg.start_time}s - ${seg.end_time}s`}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                top: '12px',
                height: '24px',
                background: color,
                borderRadius: '4px',
                opacity: 0.92,
                boxShadow: `0 1px 4px ${color}50`,
                transition: 'opacity 0.15s'
              }}
            />
          );
        })}

        {/* Interruption Collision Markers */}
        {interruptions.map((intEvt, idx) => {
          const leftPct = (intEvt.start_time / duration) * 100;
          const widthPct = Math.max(0.75, (intEvt.overlap_duration / duration) * 100);

          return (
            <div
              key={intEvt.id || idx}
              title={`Interruption: ${getStudentName(intEvt.interrupter_id)} interrupted ${getStudentName(intEvt.interrupted_id)} (${intEvt.overlap_duration}s)`}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                top: '36px',
                height: '18px',
                background: '#FF0033',
                borderRadius: '3px',
                boxShadow: '0 0 12px rgba(255, 0, 51, 0.95), 0 0 4px #FF0033',
                border: '1px solid #FFFFFF',
                zIndex: 6
              }}
            />
          );
        })}

        {/* Playhead Vertical Line */}
        <div
          style={{
            position: 'absolute',
            left: `${playheadPercent}%`,
            top: 0,
            bottom: 0,
            width: '2px',
            background: '#231A12',
            boxShadow: '0 0 6px rgba(245, 158, 11, 0.8)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      </div>

      {/* Speaker Legend */}
      <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginTop: '0.85rem', fontFamily: 'JetBrains Mono, monospace' }}>
        {speakers.map((spk) => (
          <div key={spk} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#6B5A4E', fontWeight: 600 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getSpeakerColor(spk) }} />
            <span>{getStudentName(spk)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: '#FF0033', fontWeight: 800 }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#FF0033', boxShadow: '0 0 8px rgba(255, 0, 51, 0.95), 0 0 3px #FF0033', border: '1px solid #FFFFFF' }} />
          <span>Interruption Overlap (#FF0033)</span>
        </div>
      </div>
    </div>
  );
}
