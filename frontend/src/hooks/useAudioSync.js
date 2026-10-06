import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useAudioSync: Frame-accurate real-time audio synchronization hook using requestAnimationFrame (~60fps).
 * Resolves active speakers, active interruptions, and cumulative talk times per speaker at the current timestamp.
 */
export function useAudioSync({ audioRef, segments = [], interruptions = [], totalDuration = 0 }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(totalDuration || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState([]);
  const [activeInterruption, setActiveInterruption] = useState(null);
  const [cumulativeTalkTime, setCumulativeTalkTime] = useState({});
  const [volume, setVolumeState] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  const animationFrameRef = useRef(null);

  // Keep duration synchronized if totalDuration becomes available
  useEffect(() => {
    if (totalDuration > 0 && (!duration || duration === 0)) {
      setDuration(totalDuration);
    }
  }, [totalDuration, duration]);

  // Sync state frame by frame
  const tick = useCallback(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const t = audio.currentTime || 0;
    setCurrentTime(t);

    if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }

    // 1. Identify active speaking segments at time t
    const active = [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (t >= seg.start_time && t <= seg.end_time) {
        if (!active.includes(seg.speaker_id)) {
          active.push(seg.speaker_id);
        }
      }
    }
    setActiveSpeakers((prev) => {
      if (prev.length === active.length && prev.every((spk, idx) => spk === active[idx])) {
        return prev;
      }
      return active;
    });

    // 2. Identify active interruption collision at time t
    const activeInt = interruptions.find(
      (intEvt) => t >= intEvt.start_time && t <= intEvt.end_time
    ) || null;
    setActiveInterruption((prev) => {
      if (prev === activeInt) return prev;
      if (prev && activeInt && prev.id === activeInt.id) return prev;
      return activeInt;
    });

    // 3. Compute cumulative talk time per speaker up to time t
    const cumTimes = {};
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (t < seg.start_time) continue;

      const spk = seg.speaker_id;
      const spokeUntil = Math.min(t, seg.end_time);
      const elapsedInSeg = Math.max(0, spokeUntil - seg.start_time);
      cumTimes[spk] = (cumTimes[spk] || 0) + elapsedInSeg;
    }
    setCumulativeTalkTime(cumTimes);

    if (!audio.paused && !audio.ended) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [audioRef, segments, interruptions]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Initialize state from existing audio node properties
    if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }
    if (!audio.paused) {
      setIsPlaying(true);
    }
    if (typeof audio.volume === 'number') {
      setVolumeState(audio.volume);
    }
    setIsMuted(Boolean(audio.muted));

    const handlePlay = () => {
      setIsPlaying(true);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      tick(); // perform single sync on pause
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      tick();
    };

    const handleCanPlay = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      tick();
    };

    const handleSeeked = () => {
      tick();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      tick();
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('seeked', handleSeeked);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('seeked', handleSeeked);
      audio.removeEventListener('ended', handleEnded);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioRef, tick]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    if (audio.paused) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Audio play interrupted or blocked:', err);
            setIsPlaying(false);
          });
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seek = (time) => {
    if (!audioRef.current) return;
    const maxDur = duration || totalDuration || 100;
    const target = Math.max(0, Math.min(time, maxDur));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
    tick();
  };

  const setPlaybackRate = (rate) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
  };

  const setVolume = (val) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(1, val));
    audioRef.current.volume = clamped;
    setVolumeState(clamped);
    if (clamped > 0 && audioRef.current.muted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !audioRef.current.muted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return {
    currentTime,
    duration,
    isPlaying,
    activeSpeakers,
    activeInterruption,
    cumulativeTalkTime,
    volume,
    isMuted,
    togglePlay,
    seek,
    setPlaybackRate,
    setVolume,
    toggleMute
  };
}
