import React, { useEffect, useRef, useState } from 'react';

/**
 * ============================================================================
 * SOURCE VIDEO ENCODING REQUIREMENTS & RECOMMENDATIONS
 * ============================================================================
 * For frame-accurate, jitter-free scrubbing, the source video must have
 * EVERY FRAME AS AN INTRA-FRAME / KEYFRAME (GOP size = 1).
 *
 * Why this is critical:
 * On multi-subject footage (such as 5 people whose eyes move synchronously),
 * standard long-GOP temporal compression (P/B-frames) forces the browser to
 * decode intermediate frames from the nearest I-frame, introducing severe
 * latency, frame-dropping, and visual stuttering across all faces.
 *
 * Recommended FFmpeg encode command:
 * ```bash
 * ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 18 -g 1 -keyint_min 1 \
 *   -x264-params "scenecut=0" -profile:v high -pix_fmt yuv420p \
 *   -movflags +faststart -an out.mp4
 * ```
 *
 * Tradeoff note:
 * Every-frame-as-keyframe will significantly increase the file size compared to
 * standard streaming video compression.
 *
 * Gaze mapping:
 * Before wiring up the real asset, inspect which gaze direction corresponds to
 * currentTime: 0 in the source footage, and set `reverse={true|false}` accordingly
 * so cursor movement aligns with eye direction naturally.
 * ============================================================================
 */

export interface CursorScrubVideoProps {
  /** Video file URL or imported asset path */
  videoSrc?: string;
  /** Axis to map cursor scrub: "horizontal" or "vertical" (default: "horizontal") */
  axis?: 'horizontal' | 'vertical';
  /** Flips the mapping on the selected axis (left/top = end instead of start) */
  reverse?: boolean;
  /**
   * "component": measures cursor relative to component bounding box
   * "window": measures cursor relative to viewport
   */
  trackingArea?: 'component' | 'window';
  /** Lerp smoothing factor toward target time: 0.02 - 1.0 (default: 0.22) */
  smoothing?: number;
  /** CSS object-fit property for video (default: "cover") */
  objectFit?: 'cover' | 'contain' | 'fill';
  /** CSS object-position property (default: "50% center") */
  objectPosition?: string;
  /** Whether to show poster/fade-in state while decoding frame 0 (default: true) */
  showPoster?: boolean;
  /** Border radius in pixels (default: 0) */
  borderRadius?: number;
  /** Passthrough CSS class name for sizing / container layout */
  className?: string;
}

export const CursorScrubVideo: React.FC<CursorScrubVideoProps> = ({
  videoSrc,
  axis = 'horizontal',
  reverse = false,
  trackingArea = 'component',
  smoothing = 0.22,
  objectFit = 'cover',
  objectPosition = '50% center',
  showPoster = true,
  borderRadius = 0,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Ready state controlling smooth opacity fade-in
  const [isReady, setIsReady] = useState<boolean>(false);

  // Internal scrub state held in mutable refs to avoid React re-render overhead
  const isReadyRef = useRef<boolean>(false);
  const currentTimeRef = useRef<number>(0);
  const targetTimeRef = useRef<number>(0);
  const targetNormalizedPosRef = useRef<number>(0.5);
  const seekingRef = useRef<boolean>(false);
  const seekTimeoutRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Keep prop values in refs for stable access in animation and event loops
  const propsRef = useRef({
    axis,
    reverse,
    trackingArea,
    smoothing: Math.max(0.02, Math.min(1, smoothing)),
  });

  useEffect(() => {
    propsRef.current = {
      axis,
      reverse,
      trackingArea,
      smoothing: Math.max(0.02, Math.min(1, smoothing)),
    };
  }, [axis, reverse, trackingArea, smoothing]);

  // Clean up object URLs if videoSrc was created via URL.createObjectURL
  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(videoSrc);
        } catch {
          // ignore
        }
      }
    };
  }, [videoSrc]);

  // Main video initialization and scrubbing loop
  useEffect(() => {
    if (!videoSrc) {
      setIsReady(false);
      isReadyRef.current = false;
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Reset state flags
    isReadyRef.current = false;
    setIsReady(false);
    currentTimeRef.current = 0;
    targetTimeRef.current = 0;
    seekingRef.current = false;

    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
      seekTimeoutRef.current = null;
    }

    // 1. Initial configuration
    video.currentTime = 0;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.disableRemotePlayback = true;

    // 2. Load and kick off silent pre-decode
    video.load();
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          video.pause();
          video.currentTime = 0;
        })
        .catch(() => {
          // Auto-play policy or silent pause catch
        });
    }

    const updateTargetFromPos = () => {
      const vid = videoRef.current;
      if (vid && isFinite(vid.duration) && vid.duration > 0) {
        let pos = targetNormalizedPosRef.current;
        if (propsRef.current.reverse) {
          pos = 1 - pos;
        }
        targetTimeRef.current = Math.max(0, Math.min(vid.duration, pos * vid.duration));
      }
    };

    // Ready handler: unlock scrubbing and fade in as soon as frame 0 is decode-ready
    const markReady = () => {
      if (!isReadyRef.current) {
        isReadyRef.current = true;
        setIsReady(true);
        const vid = videoRef.current;
        if (vid) {
          currentTimeRef.current = vid.currentTime || 0;
        }
        updateTargetFromPos();
      }
    };

    const handleLoadedMetadata = () => {
      updateTargetFromPos();
      if (video.readyState >= 2) {
        markReady();
      }
    };

    const handleLoadedData = () => {
      markReady();
    };

    const handleCanPlay = () => {
      markReady();
    };

    const handleCanPlayThrough = () => {
      markReady();
    };

    // Seeking event listeners
    const handleSeeking = () => {
      seekingRef.current = true;
    };

    const handleSeeked = () => {
      seekingRef.current = false;
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
        seekTimeoutRef.current = null;
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    // If already in a ready state (e.g. cached or synchronous decode)
    if (video.readyState >= 2) {
      markReady();
    }

    // Continuous smoothed seek loop (RAF)
    const animate = () => {
      const vid = videoRef.current;
      if (vid && isFinite(vid.duration) && vid.duration > 0 && isReadyRef.current) {
        const smoothingFactor = propsRef.current.smoothing;
        const current = currentTimeRef.current;
        const target = targetTimeRef.current;
        const delta = target - current;

        // Calm, organic interpolation: smooth gliding towards target without nervous snapping
        let next: number;
        if (Math.abs(delta) < 0.001) {
          next = target;
        } else {
          next = current + delta * smoothingFactor;
        }
        currentTimeRef.current = next;

        // Only assign when duration is finite, no seek in-flight, and delta > 0.008s threshold
        if (!seekingRef.current && Math.abs(vid.currentTime - next) > 0.008) {
          seekingRef.current = true;
          const clampedTime = Math.max(0, Math.min(vid.duration, next));

          // Safety timeout in case browser delays or drops seeked event
          if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
          seekTimeoutRef.current = window.setTimeout(() => {
            seekingRef.current = false;
          }, 80);

          // Use fastSeek if supported by browser (WebKit/Safari hardware accelerated path)
          if ('fastSeek' in vid && typeof (vid as any).fastSeek === 'function') {
            try {
              (vid as any).fastSeek(clampedTime);
            } catch {
              vid.currentTime = clampedTime;
            }
          } else {
            vid.currentTime = clampedTime;
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    // Cursor tracking logic
    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      let rawX = 0.5;
      let rawY = 0.5;

      if (propsRef.current.trackingArea === 'window') {
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        rawX = e.clientX / w;
        rawY = e.clientY / h;
      } else {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          rawX = (e.clientX - rect.left) / rect.width;
          rawY = (e.clientY - rect.top) / rect.height;
        }
      }

      // Clamp normalized coordinates to [0, 1]
      const normalizedX = Math.max(0, Math.min(1, rawX));
      const normalizedY = Math.max(0, Math.min(1, rawY));

      const pos = propsRef.current.axis === 'horizontal' ? normalizedX : normalizedY;
      targetNormalizedPosRef.current = pos;

      const vid = videoRef.current;
      if (vid && isFinite(vid.duration) && vid.duration > 0) {
        const mappedPos = propsRef.current.reverse ? 1 - pos : pos;
        targetTimeRef.current = Math.max(0, Math.min(vid.duration, mappedPos * vid.duration));
      }
    };

    // Attach tracking listener to window or container ref
    if (trackingArea === 'window') {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    } else {
      const container = containerRef.current;
      if (container) {
        container.addEventListener('pointermove', handlePointerMove as EventListener, {
          passive: true,
        });
      }
    }

    // Cleanup on unmount or when videoSrc/trackingArea changes
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
        seekTimeoutRef.current = null;
      }

      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);

      if (trackingArea === 'window') {
        window.removeEventListener('pointermove', handlePointerMove);
      } else {
        const container = containerRef.current;
        if (container) {
          container.removeEventListener('pointermove', handlePointerMove as EventListener);
        }
      }
    };
  }, [videoSrc, trackingArea]);

  // Fallback state if videoSrc is empty/undefined
  if (!videoSrc) {
    return (
      <div
        className={`flex items-center justify-center border-2 border-dashed border-neutral-600 rounded-lg p-8 text-neutral-400 font-mono text-sm select-none ${className}`}
        style={{
          borderRadius: `${borderRadius}px`,
          minHeight: '240px',
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-8 h-8 text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>Add a video file</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        touchAction: 'none',
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        disableRemotePlayback
        tabIndex={-1}
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          objectPosition,
          borderRadius: `${borderRadius}px`,
          pointerEvents: 'none',
          transition: showPoster ? 'opacity 0.25s ease-out' : 'none',
          opacity: isReady || !showPoster ? 1 : 0,
        }}
      />

      {/* Loading / poster placeholder overlay */}
      {showPoster && !isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm pointer-events-none transition-opacity duration-200">
          <div className="flex items-center gap-2.5 text-neutral-400 text-xs font-mono tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            INITIALIZING TIMELINE...
          </div>
        </div>
      )}
    </div>
  );
};

export default CursorScrubVideo;
