import React from 'react';

/**
 * InterruptionFlash renders a single clean expanding shockwave pulse ring
 * on the interrupter's seat node with emilkowalski easing physics.
 */
export default function InterruptionFlash({ isInterrupter }) {
  if (!isInterrupter) return null;

  return (
    <div
      className="shockwave-ring"
      style={{
        zIndex: 20
      }}
    />
  );
}
