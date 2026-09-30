import React, { useState, useEffect } from 'react';
import { UserCheck, Sparkles, Check, ArrowRight, LayoutGrid, Users } from 'lucide-react';
import VoiceSnippetPlayer from './VoiceSnippetPlayer.jsx';

const DEFAULT_NAMES = ['Alex', 'Maya', 'Sam', 'Chloe', 'David', 'Elena', 'Jordan', 'Taylor', 'Morgan', 'Chris'];

// Warm, earthy editorial palette matching the landing page
const SPEAKER_COLORS = [
  '#E07A5F', // Warm Terracotta / Coral
  '#F59E0B', // Honey Amber Gold
  '#78A083', // Cozy Sage Green
  '#D97706', // Warm Ochre
  '#C06C84', // Dusty Rose
  '#3D5A80', // Slate Indigo
  '#E29578', // Warm Apricot
  '#6B705C'  // Olive Taupe
];

export default function SeatMappingModal({
  speakers,
  segments,
  audioRef,
  initialAssignments = {},
  onConfirmMapping,
  totalSeats = 12
}) {
  const [assignments, setAssignments] = useState({});
  const [studentNames, setStudentNames] = useState({});

  useEffect(() => {
    // Initialize default speaker names and auto-assign 1-to-1 to seats
    const initialMap = {};
    const namesMap = {};

    speakers.forEach((speakerId, idx) => {
      namesMap[speakerId] = DEFAULT_NAMES[idx % DEFAULT_NAMES.length];
      const seatNum = idx + 1;
      initialMap[`seat_${seatNum}`] = {
        seat_id: `seat_${seatNum}`,
        seat_label: `Seat ${seatNum}`,
        speaker_id: speakerId,
        student_name: DEFAULT_NAMES[idx % DEFAULT_NAMES.length]
      };
    });

    setStudentNames(namesMap);
    setAssignments(initialMap);
  }, [speakers]);

  // Find first segment start time for each speaker for snippet seeking
  const getSpeakerStartTime = (speakerId) => {
    const seg = segments.find((s) => s.speaker_id === speakerId);
    return seg ? seg.start_time : 0.0;
  };

  const handleNameChange = (speakerId, newName) => {
    setStudentNames((prev) => ({ ...prev, [speakerId]: newName }));
    setAssignments((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((seatKey) => {
        if (updated[seatKey].speaker_id === speakerId) {
          updated[seatKey].student_name = newName;
        }
      });
      return updated;
    });
  };

  const handleSeatAssignment = (speakerId, seatId) => {
    setAssignments((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        if (updated[k].speaker_id === speakerId) {
          delete updated[k];
        }
      });

      if (seatId) {
        updated[seatId] = {
          seat_id: seatId,
          seat_label: `Seat ${seatId.replace('seat_', '')}`,
          speaker_id: speakerId,
          student_name: studentNames[speakerId] || speakerId
        };
      }
      return updated;
    });
  };

  const getAssignedSeatForSpeaker = (speakerId) => {
    const entry = Object.values(assignments).find((a) => a.speaker_id === speakerId);
    return entry ? entry.seat_id : '';
  };

  const allSeatsList = Array.from({ length: totalSeats }, (_, i) => ({
    id: `seat_${i + 1}`,
    label: `Seat ${i + 1}`
  }));

  const handleConfirm = () => {
    const finalSeatList = allSeatsList.map((s) => {
      const assigned = assignments[s.id];
      return assigned || {
        seat_id: s.id,
        seat_label: s.label,
        speaker_id: null,
        student_name: null
      };
    });
    onConfirmMapping(finalSeatList);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '840px',
        borderRadius: '1.25rem',
        background: 'rgba(255, 253, 248, 0.95)',
        border: '1px solid #E8DACB',
        boxShadow: '0 10px 30px -5px rgba(92, 64, 40, 0.08)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden'
      }}
    >
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#231A12',
              fontFamily: 'Playfair Display, Georgia, serif',
              margin: 0
            }}>
              Assign Speakers to Classroom Seats
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6B5A4E', marginTop: '0.25rem' }}>
              Listen to each detected voice, confirm the student's name, and assign their seat on the seating chart.
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#EEF5F0',
            border: '1px solid #C7DDD0',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            color: '#2D5A3C',
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            <Users size={14} color="#10B981" />
            <span>{speakers.length} Speakers Identified</span>
          </div>
        </div>

        {/* Speaker Cards Mapping Table */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '2rem',
          maxHeight: '420px',
          overflowY: 'auto',
          paddingRight: '0.25rem'
        }}>
          {speakers.map((speakerId, idx) => {
            const color = SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
            const startTime = getSpeakerStartTime(speakerId);
            const assignedSeat = getAssignedSeatForSpeaker(speakerId);

            return (
              <div
                key={speakerId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '0.85rem',
                  background: '#FAF4ED',
                  border: '1px solid #E8DACB',
                  gap: '1rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Speaker Badge & Voice Player */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '170px' }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 8px ${color}80`,
                    border: '2px solid #FFFDF8'
                  }} />
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#231A12', fontFamily: 'JetBrains Mono, monospace' }}>
                      {speakerId}
                    </span>
                    <div style={{ marginTop: '0.25rem' }}>
                      <VoiceSnippetPlayer
                        audioRef={audioRef}
                        startTime={startTime}
                        duration={3.0}
                        speakerLabel={studentNames[speakerId] || speakerId}
                      />
                    </div>
                  </div>
                </div>

                {/* Name Input */}
                <div style={{ flex: 1, maxWidth: '210px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#8A7565', marginBottom: '0.25rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={studentNames[speakerId] || ''}
                    onChange={(e) => handleNameChange(speakerId, e.target.value)}
                    placeholder="Student Name"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: '#FFFFFF',
                      border: '1px solid #E4D0BD',
                      borderRadius: '0.65rem',
                      color: '#231A12',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#D97706'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E4D0BD'}
                  />
                </div>

                {/* Seat Selector */}
                <div style={{ minWidth: '160px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#8A7565', marginBottom: '0.25rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                    Assigned Seat
                  </label>
                  <select
                    value={assignedSeat}
                    onChange={(e) => handleSeatAssignment(speakerId, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: '#FFFFFF',
                      border: '1px solid #E4D0BD',
                      borderRadius: '0.65rem',
                      color: '#231A12',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#D97706'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E4D0BD'}
                  >
                    <option value="">Unassigned</option>
                    {allSeatsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleConfirm}
          style={{
            width: '100%',
            padding: '0.9rem',
            borderRadius: '0.85rem',
            background: 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)',
            color: '#231A12',
            border: '1px solid rgba(217, 119, 6, 0.4)',
            fontSize: '0.95rem',
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #E59306 0%, #D97736 100%)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(245, 158, 11, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.25)';
          }}
        >
          <span>Start Real-Time Heatmap Playback</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
