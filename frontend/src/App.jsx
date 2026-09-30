import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Navigation/Header.jsx';
import ModeSelector from './components/Ingestion/ModeSelector.jsx';
import PresetPicker from './components/Ingestion/PresetPicker.jsx';
import AudioUploader from './components/Ingestion/AudioUploader.jsx';
import ErrorState from './components/Ingestion/ErrorState.jsx';
import SeatMappingModal from './components/Mapping/SeatMappingModal.jsx';
import SeatingChart from './components/Visualization/SeatingChart.jsx';
import AudioSyncEngine from './components/Player/AudioSyncEngine.jsx';
import TimelineBar from './components/Visualization/TimelineBar.jsx';
import SummaryReport from './components/Analytics/SummaryReport.jsx';
import PredictiveArcBackground from './components/Background/PredictiveArcBackground.jsx';
import { useAudioSync } from './hooks/useAudioSync.js';
import { Volume2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState('ingestion'); // 'ingestion' | 'mapping' | 'playback' | 'report'
  const [ingestionMode, setIngestionMode] = useState('preset'); // 'preset' | 'live'
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [errorData, setErrorData] = useState(null);
  const [seatAssignments, setSeatAssignments] = useState([]);

  const audioRef = useRef(null);

  // Audio synchronization hook
  const {
    currentTime,
    duration,
    isPlaying,
    activeSpeakers,
    activeInterruption,
    cumulativeTalkTime,
    volume,
    isMuted,
    togglePlay,
    seek,
    setPlaybackRate,
    setVolume,
    toggleMute
  } = useAudioSync({
    audioRef,
    segments: analysisData?.segments || [],
    interruptions: analysisData?.interruptions || [],
    totalDuration: analysisData?.audio_duration || 0
  });

  // Automatically trigger Summary Report at end of audio
  useEffect(() => {
    if (currentStep === 'playback' && duration > 0 && currentTime >= duration - 0.25) {
      const timer = setTimeout(() => {
        setCurrentStep('report');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep, currentTime, duration]);

  // Handle preset selection
  const handleSelectPreset = async (presetId) => {
    setIsLoading(true);
    setErrorData(null);
    try {
      const res = await fetch(`/api/analyze/preset/${presetId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Preset analysis request failed');
      const data = await res.json();
      setAnalysisData(data);
      setCurrentStep('mapping');
    } catch (err) {
      console.error(err);
      setErrorData({
        errorCode: 'PRESET_LOAD_FAILED',
        errorMessage: 'Unable to load preset discussion data.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle live audio upload
  const handleLiveUpload = async (file, numSpeakersHint) => {
    setIsLoading(true);
    setErrorData(null);

    const formData = new FormData();
    formData.append('file', file);
    if (numSpeakersHint) {
      formData.append('num_speakers', numSpeakersHint);
    }

    try {
      const res = await fetch('/api/analyze/live', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.mode === 'live_failed' || data.status === 'error') {
        setErrorData({
          errorCode: data.error_code || 'LIVE_FAILED',
          errorMessage: data.error_message || 'Live diarization failed.'
        });
      } else {
        setAnalysisData(data);
        setCurrentStep('mapping');
      }
    } catch (err) {
      setErrorData({
        errorCode: 'SERVER_NETWORK_ERROR',
        errorMessage: 'Failed to connect to backend analysis server: ' + err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle seat mapping confirmation
  const handleConfirmMapping = (seats) => {
    setSeatAssignments(seats);
    setCurrentStep('playback');
    fetch('/api/seat-mapping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seats)
    }).catch((e) => console.warn('Failed to sync seat mapping', e));

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.warn('Autoplay prevented', e));
      }
    }, 400);
  };

  // Reset to initial state
  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAnalysisData(null);
    setErrorData(null);
    setSeatAssignments([]);
    setCurrentStep('ingestion');
  };

  // Replay from start
  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    setCurrentStep('playback');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', position: 'relative' }}>
      {/* ThreeUI Predictive Arc Background */}
      <PredictiveArcBackground />

      {/* Hidden Global HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={analysisData?.audio_url || ''}
        preload="auto"
      />

      <Header mode={analysisData?.mode} onReset={handleReset} />

      {/* Main App Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>
        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2.25rem',
          padding: '0.45rem 1.25rem',
          borderRadius: '9999px',
          background: 'rgba(255, 253, 248, 0.92)',
          border: '1px solid #E8DACB',
          boxShadow: '0 2px 10px rgba(92, 64, 40, 0.05)',
          backdropFilter: 'blur(12px)',
          fontSize: '0.8rem',
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {/* Step 1: Ingestion */}
          <div
            onClick={() => setCurrentStep('ingestion')}
            title="Go to step 1: Select discussion"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: currentStep === 'ingestion' ? '#231A12' : '#8A7565',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: currentStep === 'ingestion' ? 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)' : '#F5E6D8',
              color: currentStep === 'ingestion' ? '#231A12' : '#7A6150',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              boxShadow: currentStep === 'ingestion' ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none',
              border: currentStep === 'ingestion' ? '1px solid #D97706' : '1px solid #E4D0BD'
            }}>1</span>
            <span>Select Discussion</span>
          </div>

          <div style={{ width: '16px', height: '1.5px', background: '#E4D0BD' }} />

          {/* Step 2: Mapping */}
          <div
            onClick={() => analysisData && setCurrentStep('mapping')}
            title={analysisData ? "Go to step 2: Map seats" : "Load audio data first"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: currentStep === 'mapping' ? '#231A12' : '#8A7565',
              cursor: analysisData ? 'pointer' : 'default',
              opacity: analysisData ? 1 : 0.6,
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: currentStep === 'mapping' ? 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)' : '#F5E6D8',
              color: currentStep === 'mapping' ? '#231A12' : '#7A6150',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              boxShadow: currentStep === 'mapping' ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none',
              border: currentStep === 'mapping' ? '1px solid #D97706' : '1px solid #E4D0BD'
            }}>2</span>
            <span>Map Seats</span>
          </div>

          <div style={{ width: '16px', height: '1.5px', background: '#E4D0BD' }} />

          {/* Step 3: Playback */}
          <div
            onClick={() => analysisData && setCurrentStep('playback')}
            title={analysisData ? "Go to step 3: Live heatmap" : "Load audio data first"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: currentStep === 'playback' ? '#231A12' : '#8A7565',
              cursor: analysisData ? 'pointer' : 'default',
              opacity: analysisData ? 1 : 0.6,
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: currentStep === 'playback' ? 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)' : '#F5E6D8',
              color: currentStep === 'playback' ? '#231A12' : '#7A6150',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              boxShadow: currentStep === 'playback' ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none',
              border: currentStep === 'playback' ? '1px solid #D97706' : '1px solid #E4D0BD'
            }}>3</span>
            <span>Live Heatmap</span>
          </div>

          <div style={{ width: '16px', height: '1.5px', background: '#E4D0BD' }} />

          {/* Step 4: Report */}
          <div
            onClick={() => analysisData && setCurrentStep('report')}
            title={analysisData ? "Go to step 4: Equity report" : "Load audio data first"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: currentStep === 'report' ? '#231A12' : '#8A7565',
              cursor: analysisData ? 'pointer' : 'default',
              opacity: analysisData ? 1 : 0.6,
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: currentStep === 'report' ? 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)' : '#F5E6D8',
              color: currentStep === 'report' ? '#231A12' : '#7A6150',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              boxShadow: currentStep === 'report' ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none',
              border: currentStep === 'report' ? '1px solid #D97706' : '1px solid #E4D0BD'
            }}>4</span>
            <span>Equity Report</span>
          </div>
        </div>

        {/* Step 1: Ingestion */}
        {currentStep === 'ingestion' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', width: '100%' }}>
            {errorData ? (
              <ErrorState
                error={errorData}
                onSwitchToPreset={() => {
                  setIngestionMode('preset');
                  setErrorData(null);
                }}
                onRetry={() => setErrorData(null)}
              />
            ) : (
              <>
                <div style={{ textAlign: 'center', maxWidth: '640px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.3rem 0.85rem',
                    borderRadius: '9999px',
                    background: 'rgba(245, 230, 216, 0.85)',
                    border: '1px solid #E4D0BD',
                    color: '#7A6150',
                    fontSize: '0.75rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 600,
                    marginBottom: '0.85rem'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E07A5F' }} />
                    <span>Inclusive Classroom Discussions &bull; Acoustic Telemetry</span>
                  </div>
                  <h2 style={{
                    fontSize: '2.4rem',
                    fontWeight: 800,
                    color: '#231A12',
                    letterSpacing: '-0.025em',
                    fontFamily: 'Playfair Display, Georgia, serif',
                    lineHeight: 1.15
                  }}>
                    Make Classroom Equity Visible
                  </h2>
                  <p style={{ fontSize: '0.95rem', color: '#6B5A4E', marginTop: '0.75rem', lineHeight: 1.6 }}>
                    Analyze conversational airtime, reveal natural interruptions, and watch classroom participation build as an animated heatmap over your seating chart.
                  </p>
                </div>

                <ModeSelector
                  selectedMode={ingestionMode}
                  onSelectMode={setIngestionMode}
                />

                {ingestionMode === 'preset' ? (
                  <PresetPicker
                    onSelectPreset={handleSelectPreset}
                    isLoading={isLoading}
                  />
                ) : (
                  <AudioUploader
                    onUpload={handleLiveUpload}
                    isLoading={isLoading}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Step 2: Speaker-to-Seat Assignment */}
        {currentStep === 'mapping' && analysisData && (
          <SeatMappingModal
            speakers={analysisData.speakers}
            segments={analysisData.segments}
            audioRef={audioRef}
            onConfirmMapping={handleConfirmMapping}
            totalSeats={12}
          />
        )}

        {/* Step 3: Synchronized Playback Theater */}
        {currentStep === 'playback' && analysisData && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
            <SeatingChart
              seats={seatAssignments}
              activeSpeakers={activeSpeakers}
              cumulativeTalkTime={cumulativeTalkTime}
              activeInterruption={activeInterruption}
              speakers={analysisData.speakers}
            />

            <TimelineBar
              segments={analysisData.segments}
              interruptions={analysisData.interruptions}
              duration={duration || analysisData.audio_duration}
              currentTime={currentTime}
              speakers={analysisData.speakers}
              seats={seatAssignments}
              onSeek={seek}
            />

            <AudioSyncEngine
              audioRef={audioRef}
              currentTime={currentTime}
              duration={duration || analysisData.audio_duration}
              isPlaying={isPlaying}
              togglePlay={togglePlay}
              seek={seek}
              setPlaybackRate={setPlaybackRate}
              activeInterruption={activeInterruption}
              activeSpeakers={activeSpeakers}
              seats={seatAssignments}
              volume={volume}
              isMuted={isMuted}
              setVolume={setVolume}
              toggleMute={toggleMute}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('mapping')}
                style={{
                  background: 'rgba(255, 253, 248, 0.95)',
                  border: '1px solid #E4D0BD',
                  color: '#6B5A4E',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(92, 64, 40, 0.05)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#231A12';
                  e.currentTarget.style.borderColor = '#D97706';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B5A4E';
                  e.currentTarget.style.borderColor = '#E4D0BD';
                }}
              >
                &larr; Adjust Seat Mapping
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('report')}
                style={{
                  background: 'rgba(255, 253, 248, 0.95)',
                  border: '1px solid #E4D0BD',
                  color: '#6B5A4E',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(92, 64, 40, 0.05)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#231A12';
                  e.currentTarget.style.borderColor = '#D97706';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B5A4E';
                  e.currentTarget.style.borderColor = '#E4D0BD';
                }}
              >
                Skip to Equity Summary Report &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Final Summary Report */}
        {currentStep === 'report' && analysisData && (
          <SummaryReport
            metrics={analysisData.metrics}
            speakers={analysisData.speakers}
            seats={seatAssignments}
            interruptions={analysisData.interruptions}
            onReplay={handleReplay}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Docked Cozy Footer matching Landing Page */}
      <footer style={{
        padding: '1.25rem 2rem',
        borderTop: '1px solid #E8DACB',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.75rem',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#8C7A6D',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#231A12' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
          <span>Silence Map &bull; Made with love, by Devika Anup</span>
        </div>
        <div>
          Built with React, FastAPI, WebRTC VAD, and pyannote-audio neural diarization.
        </div>
      </footer>
    </div>
  );
}
