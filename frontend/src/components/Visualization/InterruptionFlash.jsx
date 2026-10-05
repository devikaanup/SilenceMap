import React from 'react';

/**
 * InterruptionFlash renders expanding shockwave pulse rings in extremely bright red (#FF0033)
 * whenever an interruption collision occurs, making it instantly unmistakable on the seating chart.
 */
export default function InterruptionFlash({ isInterrupter, isInterrupted }) {
  if (!isInterrupter && !isInterrupted) return null;

  return (
    <>
      {/* Primary Electric-Red Shockwave */}
      <div
        className="shockwave-ring"
        style={{
          zIndex: 30
        }}
      />
      {/* Secondary Outer Shockwave for High-Contrast Radiance */}
      <div
        className="shockwave-ring-outer"
        style={{
          zIndex: 29
        }}
      />
    </>
  );
}
