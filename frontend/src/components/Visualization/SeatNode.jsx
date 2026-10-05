import React from 'react';
import { User, Volume2, Mic } from 'lucide-react';
import InterruptionFlash from './InterruptionFlash.jsx';

export default function SeatNode({
  seat,
  isSpeaking,
  cumulativeTime = 0,
  maxCumulativeTime = 1,
  isInterrupter,
  isInterrupted,
  speakerIndex = 0
}) {
  const isAssigned = Boolean(seat.speaker_id);
  const talkSeconds = Math.round(cumulativeTime);

  // Compute normalized heat intensity [0.0 to 1.0]
  const intensity = maxCumulativeTime > 0 ? Math.min(1.0, cumulativeTime / maxCumulativeTime) : 0;

  // Curated warm heat gradient: Warm Ivory -> Golden Peach -> Radiant Terracotta / Coral
  const glowAlpha = Math.max(0.12, intensity * 0.85);
  const glowRadius = Math.round(6 + intensity * 26);
  const glowSpread = Math.round(2 + intensity * 8);

  // Background color interpolation based on talk time intensity
  const bgR = Math.round(255 - intensity * 18);
  const bgG = Math.round(253 - intensity * 75);
  const bgB = Math.round(248 - intensity * 115);

  const seatDescription = `Seat ${seat.seat_label}: ${isAssigned ? (seat.student_name || seat.speaker_id) : 'Empty'}, ${talkSeconds}s talk time${isSpeaking ? ', currently speaking' : ''}${isInterrupter ? ', interrupting (collision)' : ''}${isInterrupted ? ', interrupted (collision)' : ''}`;

  return (
    <div
      role="group"
      tabIndex={0}
      aria-label={seatDescription}
      className={`seat-node ${isInterrupter ? 'seat-node-interrupter' : isInterrupted ? 'seat-node-interrupted' : isSpeaking ? 'seat-node-active speaking-pulse' : ''}`}
      style={{
        position: 'relative',
        width: '102px',
        height: '94px',
        borderRadius: '1rem',
        background: isInterrupter
          ? '#FFF0F2'
          : isInterrupted
          ? '#FFF5F6'
          : isAssigned
          ? `rgb(${bgR}, ${bgG}, ${bgB})`
          : '#F5EBE1',
        border: isInterrupter
          ? '3.5px solid #FF0033'
          : isInterrupted
          ? '3px dashed #FF0033'
          : isSpeaking
          ? '2.5px solid #F59E0B'
          : isAssigned && intensity > 0.4
          ? '1.5px solid #E07A5F'
          : isAssigned
          ? '1px solid #E4D0BD'
          : '1.5px dashed #E4D0BD',
        boxShadow: isInterrupter
          ? '0 0 35px rgba(255, 0, 51, 0.95), 0 0 14px #FF0033'
          : isInterrupted
          ? '0 0 25px rgba(255, 0, 51, 0.75), 0 0 10px #FF0033'
          : isAssigned && intensity > 0.05
          ? `0 0 ${glowRadius}px ${glowSpread}px rgba(224, 122, 95, ${glowAlpha}), 0 2px 8px rgba(92, 64, 40, 0.08)`
          : '0 2px 6px rgba(92, 64, 40, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        userSelect: 'none',
        cursor: 'default',
        outline: 'none',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Shockwave Pulse Ring on Interruption Collision */}
      <InterruptionFlash isInterrupter={isInterrupter} isInterrupted={isInterrupted} />

      {/* Interruption Status Overlays */}
      {isInterrupter && (
        <div style={{
          position: 'absolute',
          top: '-11px',
          background: '#FF0033',
          color: '#FFFFFF',
          padding: '2px 7px',
          borderRadius: '4px',
          fontSize: '0.62rem',
          fontWeight: 900,
          fontFamily: 'JetBrains Mono, monospace',
          boxShadow: '0 0 14px rgba(255, 0, 51, 0.95)',
          zIndex: 35,
          letterSpacing: '0.04em',
          border: '1px solid #FFFFFF'
        }}>
          💥 INTERRUPTING
        </div>
      )}

      {isInterrupted && (
        <div style={{
          position: 'absolute',
          top: '-11px',
          background: '#FF1744',
          color: '#FFFFFF',
          padding: '2px 7px',
          borderRadius: '4px',
          fontSize: '0.62rem',
          fontWeight: 900,
          fontFamily: 'JetBrains Mono, monospace',
          boxShadow: '0 0 14px rgba(255, 23, 68, 0.95)',
          zIndex: 35,
          letterSpacing: '0.04em',
          border: '1px solid #FFFFFF'
        }}>
          ⚠️ INTERRUPTED
        </div>
      )}

      {/* Active Speaking Indicator Badge */}
      {isSpeaking && !isInterrupter && !isInterrupted && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-6px',
          background: 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)',
          color: '#231A12',
          borderRadius: '50%',
          width: '22px',
          height: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(245, 158, 11, 0.45)',
          border: '2px solid #FFFDF8'
        }}>
          <Mic size={12} strokeWidth={3} />
        </div>
      )}

      {/* Seat Number Tag */}
      <span style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        color: '#8A7565',
        textTransform: 'uppercase',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        {seat.seat_label}
      </span>

      {/* Student Name */}
      <p style={{
        fontSize: '0.88rem',
        fontWeight: 800,
        color: isAssigned ? '#231A12' : '#A89585',
        margin: '0.2rem 0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '90px',
        fontFamily: 'Playfair Display, Georgia, serif'
      }}>
        {isAssigned ? seat.student_name || seat.speaker_id : 'Empty'}
      </p>

      {/* Live Cumulative Talk Time Counter */}
      {isAssigned ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span className="font-mono" style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: intensity > 0.5 ? '#991B1B' : '#6B5A4E'
          }}>
            {talkSeconds}s
          </span>
          {intensity > 0.6 && (
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#E07A5F',
              boxShadow: '0 0 6px #E07A5F'
            }} />
          )}
        </div>
      ) : (
        <span style={{ fontSize: '0.7rem', color: '#C4B5A5' }}>&mdash;</span>
      )}
    </div>
  );
}
