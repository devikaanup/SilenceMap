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

  // Identify interrupter counts and interrupted counts
  const interrupterCounts = {};
  const interruptedCounts = {};
  const pairCollisions = {};
  let totalOverlapSec = 0;

  interruptions.forEach((intEvt) => {
    interrupterCounts[intEvt.interrupter_id] = (interrupterCounts[intEvt.interrupter_id] || 0) + 1;
    interruptedCounts[intEvt.interrupted_id] = (interruptedCounts[intEvt.interrupted_id] || 0) + 1;
    totalOverlapSec += (intEvt.overlap_duration || 0);

    const pairKey = `${intEvt.interrupter_id}->${intEvt.interrupted_id}`;
    pairCollisions[pairKey] = (pairCollisions[pairKey] || 0) + 1;
  });

  const sortedInterrupters = Object.entries(interrupterCounts).sort((a, b) => b[1] - a[1]);
  const sortedInterrupted = Object.entries(interruptedCounts).sort((a, b) => b[1] - a[1]);

  const topInterrupter = sortedInterrupters[0];
  const topInterrupted = sortedInterrupted[0];

  const hasHighCollisions = interruptions.length >= 4;
  const hasModerateCollisions = interruptions.length >= 2 && interruptions.length < 4;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
        <Lightbulb size={18} color="#D97706" />
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
          Actionable Pedagogical Takeaways
        </h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {/* Card 1: Interruption Collisions & Turn Etiquette */}
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
                  <strong style={{ color: '#FF0033' }}>{getStudentName(topInterrupter[0])}</strong> initiated {topInterrupter[1]} speech collision{topInterrupter[1] > 1 ? 's' : ''}
                  {topInterrupted ? (
                    <> (most frequently cutting off <strong style={{ color: '#231A12' }}>{getStudentName(topInterrupted[0])}</strong>)</>
                  ) : null}
                  , totaling {totalOverlapSec.toFixed(1)}s of contested speech.
                  <br />
                  <strong style={{ color: '#231A12' }}>Protocol:</strong> Enforce the <em>"3-Second Acoustic Buffer"</em>: require students to pause silently for three counts after a peer ceases speaking before claiming the floor.
                </>
              ) : (
                'Multiple overlapping speech collisions occurred during floor transitions. Emphasize turn-taking buffers.'
              )}
            </p>
          </div>
        )}

        {/* Card 2: True Floor Balance & Interaction Health */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '1rem',
            background: hasHighCollisions ? '#FFF5F5' : '#FAF4ED',
            border: hasHighCollisions ? '1px solid #FEB2B2' : '1px solid #E8DACB',
            boxShadow: '0 2px 8px rgba(92, 64, 40, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
            {hasHighCollisions ? (
              <AlertCircle size={18} color="#DC2626" />
            ) : gini >= 0.35 ? (
              <AlertCircle size={18} color="#DC2626" />
            ) : hasModerateCollisions ? (
              <AlertCircle size={18} color="#D97706" />
            ) : (
              <CheckCircle size={18} color="#059669" />
            )}
            <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#231A12', fontFamily: 'Playfair Display, Georgia, serif', margin: 0 }}>
              Floor Sovereignty & Dynamics
            </h5>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#6B5A4E', lineHeight: 1.6, margin: 0 }}>
            {hasHighCollisions ? (
              <>
                <strong style={{ color: '#DC2626' }}>Contested Floor (Pseudo-Equity Detected):</strong> Even though raw speaking minutes may appear distributed (Gini {gini.toFixed(2)}), floor ownership was disrupted by {interruptions.length} interruptions. Airtime was seized through collisions rather than yielded respectfully.
              </>
            ) : hasModerateCollisions ? (
              <>
                <strong style={{ color: '#D97706' }}>Mild Floor Friction:</strong> General airtime was shared, but {interruptions.length} speech collisions caused turn-taking friction during transition moments.
              </>
            ) : gini < 0.35 ? (
              'Exemplary collaborative discourse. Turn-taking was distributed evenly across participants with zero disruptive collisions.'
            ) : (
              `High participation inequality (Gini ${gini.toFixed(2)}). A small vocal minority held the majority of seminar airtime.`
            )}
          </p>
        </div>

        {/* Card 3: Targeted Facilitation Strategy */}
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
              Facilitation & Turn Technique
            </h5>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#6B5A4E', lineHeight: 1.6, margin: 0 }}>
            {hasHighCollisions ? (
              <>
                <strong style={{ color: '#231A12' }}>Implement Discussion Chips:</strong> Give each participant 2 physical tokens per seminar round. Once spent, students must transition into active listening and may only speak by asking an open inquiry question to a peer.
              </>
            ) : dominantSpeakers.length > 0 ? (
              <>
                <strong style={{ color: '#231A12' }}>Coach {dominantSpeakers.map(getStudentName).join(' & ')}:</strong> Rather than making direct assertions, require their next 2 contributions to begin with a synthesis question: <em>"What I heard [Peer] argue is X, but how does Y affect that?"</em>
              </>
            ) : (
              'Turn-taking transitions flowed naturally. In the next seminar circle, challenge students to deepen inquiry by offering textual counter-evidence.'
            )}
          </p>
        </div>

        {/* Card 4: Voice Protection & Re-Engagement */}
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
              Voice Protection & Re-Engagement
            </h5>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#6B5A4E', lineHeight: 1.6, margin: 0 }}>
            {topInterrupted && (interruptedCounts[topInterrupted[0]] || 0) >= 2 ? (
              <>
                <strong style={{ color: '#D97706' }}>Restorative Circle Invitation:</strong> Prioritize returning the floor to <strong style={{ color: '#231A12' }}>{getStudentName(topInterrupted[0])}</strong> (interrupted {interruptedCounts[topInterrupted[0]]}x). Open the next debrief with: <em>"{getStudentName(topInterrupted[0])}, your point was truncated during an overlap earlier — please share what you were thinking."</em>
              </>
            ) : quietSpeakers.length > 0 ? (
              <>
                <strong style={{ color: '#D97706' }}>Scaffold Low-Stakes Entry:</strong> Warm-call {quietSpeakers.map(getStudentName).join(', ')} by providing the opening prompt 5 minutes in advance, or pair them in a 2-minute "Think-Pair-Share" so they have prepared speaking notes.
              </>
            ) : (
              'All participants engaged actively. Acknowledge the group for building a high-trust conversational environment.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

