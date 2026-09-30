import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldAlert,
  FastForward,
  Rewind,
  Activity,
  Mic
} from 'lucide-react';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined) return '00:00';
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioSyncEngine({
  audioRef,
  currentTime = 0,
  duration = 100,
  isPlaying = false,
  togglePlay,
  seek,
  setPlaybackRate,
  activeInterruption = null,
  activeSpeakers = [],
  seats = [],
  volume = 1.0,
  isMuted = false,
  setVolume,
  toggleMute
}) {
  const [rate, setRate] = useState(1.0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubVal, setScrubVal] = useState(currentTime);

  // Sync scrub value when not dragging
  useEffect(() => {
    if (!isScrubbing) {
      setScrubVal(currentTime);
    }
  }, [currentTime, isScrubbing]);

  const handleRateChange = (newRate) => {
    setRate(newRate);
    if (setPlaybackRate) setPlaybackRate(newRate);
  };

  const handleScrubChange = (e) => {
    const val = parseFloat(e.target.value);
    setScrubVal(val);
    if (seek) seek(val);
  };

  const handleScrubStart = () => {
    setIsScrubbing(true);
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
    if (seek) seek(scrubVal);
  };

  const restart = () => {
    if (seek) seek(0);
    if (audioRef?.current && audioRef.current.paused) {
      audioRef.current.play().catch((err) => console.warn(err));
    }
  };

  const skipRelative = (delta) => {
    const maxDur = duration || 100;
    const target = Math.max(0, Math.min(currentTime + delta, maxDur));
    if (seek) seek(target);
  };

  // Keyboard shortcut listeners (Space, Arrow keys, 1-4, R, M)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (togglePlay) togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skipRelative(-5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipRelative(5);
      } else if (e.key === '1') {
        handleRateChange(1.0);
      } else if (e.key === '2') {
        handleRateChange(1.25);
      } else if (e.key === '3') {
        handleRateChange(1.5);
      } else if (e.key === '4') {
        handleRateChange(2.0);
      } else if (e.key.toLowerCase() === 'r') {
        restart();
      } else if (e.key.toLowerCase() === 'm') {
        if (toggleMute) toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, togglePlay, seek, toggleMute]);

  // Compute active speaker name
  const activeSpeakerNames = activeSpeakers
    .map((spkId) => {
      const seat = seats.find((s) => s.speaker_id === spkId);
      return seat?.student_name || spkId;
    })
    .filter(Boolean);

  const displayTime = isScrubbing ? scrubVal : currentTime;
  const safeDuration = duration > 0 ? duration : 100;
  const progressPercent = Math.min(100, Math.max(0, (displayTime / safeDuration) * 100));

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', width: '100%', maxWidth: '820px' }}>
      {/* Interruption Live Banner Alert */}
      {activeInterruption && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          borderRadius: '0.65rem',
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          marginBottom: '1rem',
          color: '#B91C1C',
          fontSize: '0.82rem',
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          animation: 'activeSpeakerGlow 0.8s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldAlert size={16} color="#DC2626" />
            <span>INTERRUPTION DETECTED</span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {activeInterruption.interrupter_id} interrupted {activeInterruption.interrupted_id} ({activeInterruption.overlap_duration.toFixed(1)}s collision)
          </span>
        </div>
      )}

      {/* Header Info: Live Status & Volume Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Live Sound Equalizer Bars */}
          <div
            className={`sound-bar-indicator ${isPlaying && activeSpeakers.length > 0 ? 'sound-bar-active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '3px',
              height: '24px',
              padding: '0 2px'
            }}
            title={isPlaying ? (activeSpeakers.length > 0 ? 'Live voice audio active' : 'Discussion paused') : 'Playback stopped'}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                className={`eq-bar-${num}`}
                style={{
                  width: '3.5px',
                  height: isPlaying && activeSpeakers.length > 0 ? '16px' : (isPlaying ? '6px' : '4px'),
                  background: isPlaying && activeSpeakers.length > 0
                    ? 'linear-gradient(180deg, #F59E0B 0%, #E07A5F 100%)'
                    : '#D9C3AE',
                  borderRadius: '2px',
                  transition: 'height 0.2s ease, background 0.2s ease'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: activeSpeakers.length > 0 ? '#B45309' : '#7A6150'
            }}>
              {isPlaying ? (
                activeSpeakers.length > 0 ? (
                  <span>Speaking: <strong style={{ color: '#231A12' }}>{activeSpeakerNames.join(', ')}</strong></span>
                ) : (
                  <span style={{ color: '#8A7565', fontStyle: 'italic' }}>Natural Classroom Silence</span>
                )
              ) : (
                <span style={{ color: '#8A7565' }}>Playback Ready</span>
              )}
            </span>
          </div>
        </div>

        {/* Volume & Mute Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? 'Unmute (Press M)' : 'Mute (Press M)'}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            style={{
              background: 'none',
              border: 'none',
              color: isMuted ? '#DC2626' : '#6B5A4E',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
              transition: 'color 0.15s ease'
            }}
          >
            {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume && setVolume(parseFloat(e.target.value))}
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            aria-label="Audio playback volume"
            style={{
              width: '65px',
              height: '4px',
              cursor: 'pointer',
              background: `linear-gradient(to right, #D97706 0%, #D97706 ${Math.round((isMuted ? 0 : volume) * 100)}%, #E8DACB ${Math.round((isMuted ? 0 : volume) * 100)}%, #E8DACB 100%)`
            }}
          />
        </div>
      </div>

      {/* Main Interactive Live Sound Bar / Scrubber */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <span className="font-mono" style={{ fontSize: '0.85rem', color: '#231A12', fontWeight: 800, minWidth: '45px' }}>
          {formatTime(displayTime)}
        </span>

        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min="0"
            max={safeDuration}
            step="0.1"
            value={displayTime}
            onChange={handleScrubChange}
            onMouseDown={handleScrubStart}
            onTouchStart={handleScrubStart}
            onMouseUp={handleScrubEnd}
            onTouchEnd={handleScrubEnd}
            aria-label="Live sound bar scrubber timeline"
            style={{
              width: '100%',
              height: '8px',
              cursor: 'pointer',
              borderRadius: '9999px',
              background: `linear-gradient(to right, #F59E0B 0%, #E07A5F ${progressPercent}%, #E8DACB ${progressPercent}%, #E8DACB 100%)`
            }}
          />
        </div>

        <span className="font-mono" style={{ fontSize: '0.85rem', color: '#8A7565', fontWeight: 600, minWidth: '45px', textAlign: 'right' }}>
          {formatTime(safeDuration)}
        </span>
      </div>

      {/* Bottom Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Replay */}
          <button
            type="button"
            onClick={restart}
            title="Replay from start (Press R)"
            aria-label="Restart audio from beginning"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#F5E6D8',
              border: '1px solid #E4D0BD',
              color: '#7A6150',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EEDCCE';
              e.currentTarget.style.color = '#231A12';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F5E6D8';
              e.currentTarget.style.color = '#7A6150';
            }}
          >
            <RotateCcw size={15} />
          </button>

          {/* -5s Skip */}
          <button
            type="button"
            onClick={() => skipRelative(-5)}
            title="Rewind 5 seconds (Press Left Arrow)"
            aria-label="Rewind 5 seconds"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#F5E6D8',
              border: '1px solid #E4D0BD',
              color: '#7A6150',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EEDCCE';
              e.currentTarget.style.color = '#231A12';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F5E6D8';
              e.currentTarget.style.color = '#7A6150';
            }}
          >
            <Rewind size={15} />
          </button>

          {/* Primary Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            aria-label={isPlaying ? "Pause playback" : "Start playback"}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              color: '#231A12',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #E59306 0%, #D97736 100%)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(245, 158, 11, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.35)';
            }}
          >
            {isPlaying ? <Pause size={19} strokeWidth={2.5} /> : <Play size={19} strokeWidth={2.5} style={{ marginLeft: '2px' }} />}
          </button>

          {/* +5s Skip */}
          <button
            type="button"
            onClick={() => skipRelative(5)}
            title="Fast forward 5 seconds (Press Right Arrow)"
            aria-label="Fast forward 5 seconds"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#F5E6D8',
              border: '1px solid #E4D0BD',
              color: '#7A6150',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EEDCCE';
              e.currentTarget.style.color = '#231A12';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F5E6D8';
              e.currentTarget.style.color = '#7A6150';
            }}
          >
            <FastForward size={15} />
          </button>
        </div>

        {/* Hotkey Hint Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.72rem',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#8A7565'
        }}>
          <span style={{ background: '#F5E6D8', border: '1px solid #E4D0BD', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#231A12', fontWeight: 700 }}>Space</span> play
          <span style={{ background: '#F5E6D8', border: '1px solid #E4D0BD', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#231A12', fontWeight: 700 }}>&larr;/&rarr;</span> &plusmn;5s
          <span style={{ background: '#F5E6D8', border: '1px solid #E4D0BD', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#231A12', fontWeight: 700 }}>M</span> mute
        </div>

        {/* Speed Multiplier */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'rgba(245, 230, 216, 0.85)',
          padding: '0.2rem',
          borderRadius: '9999px',
          border: '1px solid #E4D0BD'
        }}>
          {[1.0, 1.25, 1.5, 2.0].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleRateChange(s)}
              title={`Playback speed ${s}x`}
              aria-label={`Set playback rate to ${s} times normal speed`}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: '9999px',
                border: rate === s ? '1px solid #D97706' : '1px solid transparent',
                background: rate === s ? '#FFFFFF' : 'transparent',
                color: rate === s ? '#231A12' : '#7A6150',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                cursor: 'pointer',
                boxShadow: rate === s ? '0 1px 6px rgba(217, 119, 6, 0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
