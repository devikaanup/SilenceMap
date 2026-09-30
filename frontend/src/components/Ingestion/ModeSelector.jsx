import React from 'react';
import { Layers, UploadCloud } from 'lucide-react';

export default function ModeSelector({ selectedMode, onSelectMode }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'rgba(245, 230, 216, 0.85)',
      padding: '0.35rem',
      borderRadius: '9999px',
      border: '1px solid #E4D0BD',
      boxShadow: '0 2px 8px rgba(92, 64, 40, 0.04)',
      gap: '0.35rem'
    }}>
      <button
        type="button"
        onClick={() => onSelectMode('preset')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1.35rem',
          borderRadius: '9999px',
          border: selectedMode === 'preset' ? '1px solid #D97706' : '1px solid transparent',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          transition: 'all 0.2s ease',
          background: selectedMode === 'preset' ? '#FFFFFF' : 'transparent',
          color: selectedMode === 'preset' ? '#231A12' : '#7A6150',
          boxShadow: selectedMode === 'preset' ? '0 2px 10px rgba(217, 119, 6, 0.18)' : 'none'
        }}
      >
        <Layers size={16} color={selectedMode === 'preset' ? '#D97706' : '#8A7565'} />
        <span>Curated Discussion Presets</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectMode('live')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1.35rem',
          borderRadius: '9999px',
          border: selectedMode === 'live' ? '1px solid #D97706' : '1px solid transparent',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          transition: 'all 0.2s ease',
          background: selectedMode === 'live' ? '#FFFFFF' : 'transparent',
          color: selectedMode === 'live' ? '#231A12' : '#7A6150',
          boxShadow: selectedMode === 'live' ? '0 2px 10px rgba(217, 119, 6, 0.18)' : 'none'
        }}
      >
        <UploadCloud size={16} color={selectedMode === 'live' ? '#D97706' : '#8A7565'} />
        <span>Live Audio Upload</span>
      </button>
    </div>
  );
}
