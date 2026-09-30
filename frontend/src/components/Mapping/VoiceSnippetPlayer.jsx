import React, { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

/**
 * VoiceSnippetPlayer performs client-side seeking on the shared audio element.
 * It jumps to the speaker's first segment start_time, plays for 3.0s, and pauses automatically.
 */
export default function VoiceSnippetPlayer({ audioRef, startTime, duration = 3.0, speakerLabel }) {
  const [isPlayingSnippet, setIsPlayingSnippet] = useState(false);

  const playSnippet = () => {
    if (!audioRef || !audioRef.current) return;
    const audio = audioRef.current;

    if (isPlayingSnippet) {
      audio.pause();
      setIsPlayingSnippet(false);
      return;
    }

    audio.currentTime = startTime;
    audio.play().then(() => {
      setIsPlayingSnippet(true);

      const checkInterval = setInterval(() => {
        if (!audioRef.current || audio.paused || audio.currentTime >= startTime + duration) {
          audio.pause();
          setIsPlayingSnippet(false);
          clearInterval(checkInterval);
        }
      }, 100);
    }).catch((err) => {
      console.warn('Audio playback error', err);
      setIsPlayingSnippet(false);
    });
  };

  return (
    <button
      type="button"
      onClick={playSnippet}
      title={`Listen to 3s sample of ${speakerLabel}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.35rem 0.65rem',
        borderRadius: '9999px',
        background: isPlayingSnippet ? '#FEF3C7' : '#F5E6D8',
        border: `1px solid ${isPlayingSnippet ? '#D97706' : '#E4D0BD'}`,
        color: isPlayingSnippet ? '#B45309' : '#7A6150',
        fontSize: '0.75rem',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        if (!isPlayingSnippet) {
          e.currentTarget.style.background = '#EEDCCE';
          e.currentTarget.style.color = '#231A12';
        }
      }}
      onMouseLeave={(e) => {
        if (!isPlayingSnippet) {
          e.currentTarget.style.background = '#F5E6D8';
          e.currentTarget.style.color = '#7A6150';
        }
      }}
    >
      {isPlayingSnippet ? <Pause size={12} /> : <Play size={12} />}
      <Volume2 size={12} />
      <span>{isPlayingSnippet ? 'Playing...' : 'Voice Sample'}</span>
    </button>
  );
}
