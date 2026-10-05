import React, { useState } from 'react';
import { Presentation, LayoutGrid, CircleDot, Flame } from 'lucide-react';
import SeatNode from './SeatNode.jsx';

export default function SeatingChart({
  seats = [],
  activeSpeakers = [],
  cumulativeTalkTime = {},
  activeInterruption = null,
  speakers = []
}) {
  const [layoutStyle, setLayoutStyle] = useState('seminar'); // 'seminar' | 'grid'

  // Calculate maximum talk time across all speakers for proportional heat normalization
  const talkTimeValues = Object.values(cumulativeTalkTime);
  const maxCumulativeTime = talkTimeValues.length > 0 ? Math.max(...talkTimeValues, 1.0) : 1.0;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', width: '100%', maxWidth: '820px' }}>
      {/* Header & Layout Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #FDE68A'
          }}>
            <Flame size={18} color="#D97706" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
              Live Seating Heatmap
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#6B5A4E', margin: 0 }}>
              Frame-accurate talk time radiance projected onto classroom layout
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          background: 'rgba(245, 230, 216, 0.85)',
          padding: '0.25rem',
          borderRadius: '9999px',
          border: '1px solid #E4D0BD',
          gap: '0.25rem'
        }}>
          <button
            type="button"
            onClick={() => setLayoutStyle('seminar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border: layoutStyle === 'seminar' ? '1px solid #D97706' : '1px solid transparent',
              background: layoutStyle === 'seminar' ? '#FFFFFF' : 'transparent',
              color: layoutStyle === 'seminar' ? '#231A12' : '#7A6150',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer',
              boxShadow: layoutStyle === 'seminar' ? '0 2px 8px rgba(217, 119, 6, 0.18)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <CircleDot size={13} color={layoutStyle === 'seminar' ? '#D97706' : '#8A7565'} />
            <span>Seminar U-Shape</span>
          </button>
          <button
            type="button"
            onClick={() => setLayoutStyle('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border: layoutStyle === 'grid' ? '1px solid #D97706' : '1px solid transparent',
              background: layoutStyle === 'grid' ? '#FFFFFF' : 'transparent',
              color: layoutStyle === 'grid' ? '#231A12' : '#7A6150',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer',
              boxShadow: layoutStyle === 'grid' ? '0 2px 8px rgba(217, 119, 6, 0.18)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutGrid size={13} color={layoutStyle === 'grid' ? '#D97706' : '#8A7565'} />
            <span>Desk Grid</span>
          </button>
        </div>
      </div>

      {/* Classroom Canvas */}
      <div style={{
        background: '#FAF4ED',
        border: '1px solid #E8DACB',
        borderRadius: '1rem',
        padding: '2rem 1.5rem',
        minHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        boxShadow: 'inset 0 2px 8px rgba(92, 64, 40, 0.03)'
      }}>
        {/* Teacher / Board Reference Area */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 1.75rem',
          borderRadius: '9999px',
          background: '#F5E6D8',
          border: '1px solid #E4D0BD',
          color: '#7A6150',
          fontSize: '0.75rem',
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '2rem',
          boxShadow: '0 2px 6px rgba(92, 64, 40, 0.04)'
        }}>
          <Presentation size={14} color="#D97706" />
          <span>Front of Classroom / Board</span>
        </div>

        {/* Dynamic Layout Rendering */}
        {layoutStyle === 'seminar' ? (
          /* Seminar U-Shape Layout */
          <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            {/* Top Arc (Desks 1 to 4) */}
            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {seats.slice(0, 4).map((seat, idx) => {
                const isSpeaking = seat.speaker_id && activeSpeakers.includes(seat.speaker_id);
                const isInterrupter = activeInterruption && activeInterruption.interrupter_id === seat.speaker_id;
                const isInterrupted = activeInterruption && activeInterruption.interrupted_id === seat.speaker_id;
                const cumTime = seat.speaker_id ? (cumulativeTalkTime[seat.speaker_id] || 0) : 0;

                return (
                  <SeatNode
                    key={seat.seat_id}
                    seat={seat}
                    isSpeaking={isSpeaking}
                    isInterrupter={isInterrupter}
                    isInterrupted={isInterrupted}
                    cumulativeTime={cumTime}
                    maxCumulativeTime={maxCumulativeTime}
                    speakerIndex={idx}
                  />
                );
              })}
            </div>

            {/* Left & Right Arms + Center Open Space */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '580px', padding: '0 1rem' }}>
              {/* Left Wing (Desks 5, 6) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {seats.slice(4, 6).map((seat, idx) => {
                  const isSpeaking = seat.speaker_id && activeSpeakers.includes(seat.speaker_id);
                  const isInterrupter = activeInterruption && activeInterruption.interrupter_id === seat.speaker_id;
                  const isInterrupted = activeInterruption && activeInterruption.interrupted_id === seat.speaker_id;
                  const cumTime = seat.speaker_id ? (cumulativeTalkTime[seat.speaker_id] || 0) : 0;

                  return (
                    <SeatNode
                      key={seat.seat_id}
                      seat={seat}
                      isSpeaking={isSpeaking}
                      isInterrupter={isInterrupter}
                      isInterrupted={isInterrupted}
                      cumulativeTime={cumTime}
                      maxCumulativeTime={maxCumulativeTime}
                      speakerIndex={idx + 4}
                    />
                  );
                })}
              </div>

              {/* Central Acoustic Floor Marker */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8A7565',
                fontSize: '0.78rem',
                fontFamily: 'Playfair Display, Georgia, serif',
                fontStyle: 'italic',
                opacity: 0.85
              }}>
                <span>Discussion Floor</span>
              </div>

              {/* Right Wing (Desks 7, 8) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {seats.slice(6, 8).map((seat, idx) => {
                  const isSpeaking = seat.speaker_id && activeSpeakers.includes(seat.speaker_id);
                  const isInterrupter = activeInterruption && activeInterruption.interrupter_id === seat.speaker_id;
                  const isInterrupted = activeInterruption && activeInterruption.interrupted_id === seat.speaker_id;
                  const cumTime = seat.speaker_id ? (cumulativeTalkTime[seat.speaker_id] || 0) : 0;

                  return (
                    <SeatNode
                      key={seat.seat_id}
                      seat={seat}
                      isSpeaking={isSpeaking}
                      isInterrupter={isInterrupter}
                      isInterrupted={isInterrupted}
                      cumulativeTime={cumTime}
                      maxCumulativeTime={maxCumulativeTime}
                      speakerIndex={idx + 6}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bottom Row (Desks 9 to 12) */}
            {seats.length > 8 && (
              <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {seats.slice(8, 12).map((seat, idx) => {
                  const isSpeaking = seat.speaker_id && activeSpeakers.includes(seat.speaker_id);
                  const isInterrupter = activeInterruption && activeInterruption.interrupter_id === seat.speaker_id;
                  const isInterrupted = activeInterruption && activeInterruption.interrupted_id === seat.speaker_id;
                  const cumTime = seat.speaker_id ? (cumulativeTalkTime[seat.speaker_id] || 0) : 0;

                  return (
                    <SeatNode
                      key={seat.seat_id}
                      seat={seat}
                      isSpeaking={isSpeaking}
                      isInterrupter={isInterrupter}
                      isInterrupted={isInterrupted}
                      cumulativeTime={cumTime}
                      maxCumulativeTime={maxCumulativeTime}
                      speakerIndex={idx + 8}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Rows / Desk Grid Layout */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '1.25rem',
            width: '100%',
            maxWidth: '620px',
            justifyItems: 'center'
          }}>
            {seats.map((seat, idx) => {
              const isSpeaking = seat.speaker_id && activeSpeakers.includes(seat.speaker_id);
              const isInterrupter = activeInterruption && activeInterruption.interrupter_id === seat.speaker_id;
              const isInterrupted = activeInterruption && activeInterruption.interrupted_id === seat.speaker_id;
              const cumTime = seat.speaker_id ? (cumulativeTalkTime[seat.speaker_id] || 0) : 0;

              return (
                <SeatNode
                  key={seat.seat_id}
                  seat={seat}
                  isSpeaking={isSpeaking}
                  isInterrupter={isInterrupter}
                  isInterrupted={isInterrupted}
                  cumulativeTime={cumTime}
                  maxCumulativeTime={maxCumulativeTime}
                  speakerIndex={idx}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Heatmap Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid #E8DACB',
        fontSize: '0.75rem',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#6B5A4E'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700 }}>Participation Radiance:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#8A7565' }}>Quiet</span>
            <div style={{
              width: '110px',
              height: '8px',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, #F5EBE1 0%, #F59E0B 45%, #E07A5F 75%, #DC2626 100%)',
              border: '1px solid #E4D0BD'
            }} />
            <span style={{ fontSize: '0.7rem', color: '#8A7565' }}>Dominant</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)' }} />
            <span style={{ fontWeight: 600 }}>Speaking Now</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF0033', boxShadow: '0 0 10px rgba(255, 0, 51, 0.95), 0 0 4px #FF0033' }} />
            <span style={{ fontWeight: 800, color: '#D9002C' }}>Interruption Collision</span>
          </div>
        </div>
      </div>
    </div>
  );
}
