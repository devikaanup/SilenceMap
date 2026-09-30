import React from 'react';
import { AlertTriangle, Key, Layers, RefreshCw, Info } from 'lucide-react';

export default function ErrorState({ error, onSwitchToPreset, onRetry }) {
  const isAuthError = error?.errorCode === 'HF_AUTH_REQUIRED';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '640px',
        borderRadius: '1.25rem',
        background: 'rgba(255, 253, 248, 0.95)',
        border: '1px solid #E8DACB',
        boxShadow: '0 8px 24px -4px rgba(92, 64, 40, 0.08)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <div style={{ padding: '2rem' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#FEE2E2',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          border: '1px solid #FECACA'
        }}>
          {isAuthError ? <Key size={24} /> : <AlertTriangle size={24} />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <h3 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#231A12',
            fontFamily: 'Playfair Display, Georgia, serif'
          }}>
            Live Diarization Unsuccessful
          </h3>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            background: '#FEE2E2',
            color: '#B91C1C',
            border: '1px solid #FECACA',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {error?.errorCode || 'PROCESSING_ERROR'}
          </span>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#6B5A4E', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {error?.errorMessage || 'The server could not complete diarization on this audio clip.'}
        </p>

        {isAuthError && (
          <div style={{
            background: '#FAF4ED',
            border: '1px solid #E4D0BD',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#231A12'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D97706', fontWeight: 700, marginBottom: '0.25rem' }}>
              <Info size={16} />
              <span>HuggingFace Token Setup</span>
            </div>
            <p style={{ color: '#6B5A4E', fontSize: '0.8rem', lineHeight: 1.5 }}>
              To run live pyannote diarization on custom files, set the <code style={{ color: '#231A12', background: '#F5E6D8', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid #E4D0BD', fontFamily: 'JetBrains Mono, monospace' }}>HF_TOKEN</code> environment variable on your backend server.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
          <button
            type="button"
            onClick={onSwitchToPreset}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '0.85rem',
              background: 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)',
              color: '#231A12',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              fontSize: '0.9rem',
              fontWeight: 800,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={16} />
            <span>Switch to Curated Preset Demo (Instant & Fail-Safe)</span>
          </button>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.85rem',
                background: '#F5E6D8',
                color: '#7A6150',
                border: '1px solid #E4D0BD',
                fontSize: '0.85rem',
                fontWeight: 700,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#231A12';
                e.currentTarget.style.borderColor = '#D97706';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#7A6150';
                e.currentTarget.style.borderColor = '#E4D0BD';
              }}
            >
              <RefreshCw size={14} />
              <span>Try Another Upload</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
