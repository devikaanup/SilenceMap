import React from 'react';
import { Lightbulb, CheckCircle, AlertCircle, Users2, Sparkles, ShieldAlert } from 'lucide-react';

export default function TakeawayCards({
  metrics,
  speakers = [],
  seats = [],
  interruptions = []
}) {
  if (!metrics) return null;

  const gini = metrics.gini_coefficient || 0.0;
  const speakerStats = metrics.speaker_stats || {};

  const getStudentName = (spkId) => {
    const seat = seats.find((s) => s.speaker_id === spkId);
    return seat?.student_name || spkId;
  };

  // Find dominant speakers (>25% share)
  const dominantSpeakers = speakers.filter(
    (s) => (speakerStats[s]?.talk_time_pct || 0) > 25
  );

  // Find quiet speakers (<10% share)
  const quietSpeakers = speakers.filter(
    (s) => (speakerStats[s]?.talk_time_pct || 0) < 10
  );

  // Identify top interrupter if any
  const interrupterCounts = {};
  interruptions.forEach((intEvt) => {
    interrupterCounts[intEvt.interrupter_id] = (interrupterCounts[intEvt.interrupter_id] || 0) + 1;
  });
  const topInterrupter = Object.entries(interrupterCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
        <Lightbulb size={18} color="#D97706" />
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
          Actionable Pedagogical Takeaways
        </h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Card 1: Interruption Collisions Alert - Bright Red */}
        {interruptions.length > 0 && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '1rem',
              background: '#FFF0F2',
              border: '2px solid rgba(255, 0, 51, 0.65)',
              boxShadow: '0 4px 16px rgba(255, 0, 51, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} color="#FF0033" strokeWidth={2.6} />
                <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
                  Interruption Collisions
                </h5>
              </div>
              <span style={{
                fontSize: '0.68rem',
                color: '#FFFFFF',
                background: '#FF0033',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 900,
                fontFamily: 'JetBrains Mono, monospace',
                boxShadow: '0 0 10px rgba(255, 0, 51, 0.75)'
              }}>
                {interruptions.length} DETECTED
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#6B5A4E', lineHeight: 1.6, margin: 0 }}>
              {topInterrupter ? (
                <>
                  <strong style={{ color: '#FF0033' }}>{getStudentName(topInterrupter[0])}</strong> initiated {topInterrupter[1]} speech collision{topInterrupter[1] > 1 ? 's' : ''}. Emphasize conversational turn etiquette and 2-second buffer pauses before interjecting.
                </>
              ) : (
                'Multiple overlapping speech collisions occurred during floor transitions.'
              )}
            </p>
          </div>
        )}

        {/* Card 2: Balance Assessment */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '1rem',
            background: '#FAF4ED',
            border: '1px solid #E8DACB',
            boxShadow: '0 2px 8px rgba(92, 64, 40, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
            {gini < 0.35 ? (
              <CheckCircle size={18} color="#059669" />
            ) : (
              <AlertCircle size={18} color="#DC2626" />
            )}
            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
              Participation Balance
            </h5>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#6B5A4E', lineHeight: 1.6, margin: 0 }}>
            {gini < 0.35
              ? 'Excellent classroom discourse. Turn-taking was distributed evenly across participants.'
              : `High inequality detected (Gini ${gini.toFixed(2)}). A small minority dominated the bulk of the dialogue.`}
          </p>
        </div>

        {/* Card 3: Dominance & Listening Coaching */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '1rem',
            background: '#FAF4ED',
            border: '1px solid #E8DACB',
            boxShadow: '0 2px 8px rgba(92, 64, 40, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
            <Users2 size={18} color="#E07A5F" />
            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
              Facilitation Strategy
            </h5>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#6B5A4E', lineHeight: 1.6, margin: 0 }}>
            {dominantSpeakers.length > 0
              ? `Coach ${dominantSpeakers.map(getStudentName).join(' & ')} on active listening and asking open questions to peers.`
              : 'Turn-taking transitions occurred smoothly without conversational monopolization.'}
          </p>
        </div>

        {/* Card 4: Invitation Strategy for Quiet Students */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '1rem',
            background: '#FAF4ED',
            border: '1px solid #E8DACB',
            boxShadow: '0 2px 8px rgba(92, 64, 40, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
            <Sparkles size={18} color="#D97706" />
            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
              Inclusive Engagement
            </h5>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#6B5A4E', lineHeight: 1.6, margin: 0 }}>
            {quietSpeakers.length > 0
              ? `Consider structured "think-pair-share" or warm-calling ${quietSpeakers.map(getStudentName).join(', ')} to boost contribution confidence.`
              : 'All students reached meaningful voice time during this discussion.'}
          </p>
        </div>
      </div>
    </div>
  );
}
