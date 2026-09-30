import React from 'react';
import { Volume2, ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react';

export default function Header({ mode, onReset }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.9rem 2rem',
      borderBottom: '1px solid #E8DACB',
      background: 'rgba(253, 249, 244, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 10px rgba(92, 64, 40, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <a
          href="/"
          title="Return to Landing Page"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(245, 230, 216, 0.8)',
            border: '1px solid #E4D0BD',
            color: '#7A6150',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace',
            textDecoration: 'none',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F5E6D8';
            e.currentTarget.style.color = '#231A12';
            e.currentTarget.style.borderColor = '#D97706';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(245, 230, 216, 0.8)';
            e.currentTarget.style.color = '#7A6150';
            e.currentTarget.style.borderColor = '#E4D0BD';
          }}
        >
          <ArrowLeft size={13} />
          <span>Landing</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }} onClick={onReset}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
            border: '1px solid rgba(217, 119, 6, 0.3)'
          }}>
            <Volume2 size={20} color="#231A12" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#231A12',
                fontFamily: 'Playfair Display, Georgia, serif',
                margin: 0
              }}>
                Silence Map
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: '#EEF5F0',
                color: '#2D5A3C',
                border: '1px solid #C7DDD0',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} />
                <span>Classroom Equity</span>
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6B5A4E', margin: '0.1rem 0 0 0' }}>
              Discussion Equity Intelligence & Seating Heatmap Theater
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {mode && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: mode === 'preset' ? '#F5E6D8' : '#FDE8E8',
            border: `1px solid ${mode === 'preset' ? '#E4D0BD' : '#FCA5A5'}`,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: mode === 'preset' ? '#7A6150' : '#B91C1C',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            <ShieldCheck size={14} color={mode === 'preset' ? '#E07A5F' : '#EF4444'} />
            <span>{mode === 'preset' ? 'Curated Classroom Ground-Truth' : 'Live Diarization'}</span>
          </div>
        )}
      </div>
    </header>
  );
}
