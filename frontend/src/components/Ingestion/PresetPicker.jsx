import React, { useState, useEffect } from 'react';
import { Users, Clock, ArrowRight, BookOpen, Atom, Sparkles } from 'lucide-react';

export default function PresetPicker({ onSelectPreset, isLoading }) {
  const [presets, setPresets] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    fetch('/api/presets')
      .then((res) => res.json())
      .then((data) => {
        setPresets(data);
        setLoadingList(false);
      })
      .catch((err) => {
        console.error('Failed to load presets', err);
        setPresets([
          {
            id: 'socratic_seminar',
            title: 'High School Socratic Seminar (Literature)',
            description: '6 students discussing Hamlet. Alex and Maya dominate ~68% of the conversation with 3 clear interruptions; David and Elena remain mostly silent.',
            speaker_count: 6,
            audio_duration: 100.0
          },
          {
            id: 'stem_collaboration',
            title: 'Collaborative STEM Lab Discussion',
            description: '4 students analyzing physics experiment findings with equitable turn-taking and minimal interruption.',
            speaker_count: 4,
            audio_duration: 62.0
          }
        ]);
        setLoadingList(false);
      });
  }, []);

  if (loadingList) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#8A7565', fontFamily: 'JetBrains Mono, monospace' }}>
        Loading curated classroom datasets...
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '880px' }}>
      {presets.map((preset) => {
        const isSocratic = preset.id.includes('socratic');
        return (
          <div
            key={preset.id}
            onClick={() => !isLoading && onSelectPreset(preset.id)}
            style={{
              cursor: isLoading ? 'default' : 'pointer',
              height: '100%',
              borderRadius: '1.25rem',
              background: 'rgba(255, 253, 248, 0.94)',
              border: '1px solid #E8DACB',
              boxShadow: '0 8px 24px -4px rgba(92, 64, 40, 0.08), 0 2px 6px -1px rgba(92, 64, 40, 0.04)',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = '#D97706';
              e.currentTarget.style.boxShadow = '0 14px 32px -4px rgba(217, 119, 6, 0.18), 0 4px 10px -2px rgba(92, 64, 40, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#E8DACB';
              e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(92, 64, 40, 0.08), 0 2px 6px -1px rgba(92, 64, 40, 0.04)';
            }}
          >
            <div
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                position: 'relative'
              }}
            >
              {isSocratic ? (
                <div style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#FEE2E2',
                  color: '#B91C1C',
                  border: '1px solid #FECACA',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  <Sparkles size={12} color="#DC2626" />
                  <span>Inequality Demo</span>
                </div>
              ) : (
                <div style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#EEF5F0',
                  color: '#2D5A3C',
                  border: '1px solid #C7DDD0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  <Sparkles size={12} color="#10B981" />
                  <span>Equitable Demo</span>
                </div>
              )}

              <div>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: isSocratic ? '#FEE2E2' : '#EEF5F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: isSocratic ? '#DC2626' : '#059669',
                  border: `1px solid ${isSocratic ? '#FECACA' : '#C7DDD0'}`
                }}>
                  {isSocratic ? <BookOpen size={22} /> : <Atom size={22} />}
                </div>

                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#231A12',
                  marginBottom: '0.5rem',
                  fontFamily: 'Playfair Display, Georgia, serif'
                }}>
                  {preset.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#6B5A4E', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {preset.description}
                </p>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #E8DACB',
                  marginBottom: '1.25rem',
                  fontSize: '0.78rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#8A7565'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} color="#D97706" />
                    <span>{preset.speaker_count} Students</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} color="#D97706" />
                    <span>{Math.round(preset.audio_duration)}s Discussion</span>
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '0.7rem 1.25rem',
                    borderRadius: '0.85rem',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)',
                    border: '1px solid rgba(217, 119, 6, 0.4)',
                    color: '#231A12',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #E59306 0%, #D97736 100%)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(245, 158, 11, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.25)';
                  }}
                >
                  <span>Launch Seating Map Theater</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
