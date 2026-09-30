import React from 'react';

export default function PredictiveArcBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundColor: '#F5EBE1',
        backgroundImage: `url('/bg_image_scroll.png')`,
        backgroundRepeat: 'repeat',
        backgroundSize: '950px auto',
        overflow: 'hidden'
      }}
    >
      {/* Subtle translucent wash layer preserving the cozy illustrated doodle background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(253, 249, 244, 0.60)',
          backdropFilter: 'blur(0.5px)',
          WebkitBackdropFilter: 'blur(0.5px)',
        }}
      />

      {/* Subtle cozy ambient warm illumination */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0) 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224, 122, 95, 0.09) 0%, rgba(224, 122, 95, 0) 70%)',
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
}
