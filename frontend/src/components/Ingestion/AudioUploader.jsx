import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, ArrowRight, Users, Loader2, AlertCircle } from 'lucide-react';

export default function AudioUploader({ onUpload, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [numSpeakers, setNumSpeakers] = useState('');
  const [fileError, setFileError] = useState(null);
  const inputRef = useRef(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const validateAndSetFile = (selectedFile) => {
    setFileError(null);
    if (!selectedFile) return;
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError('File exceeds 50MB limit. Please upload a shorter discussion audio file.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || fileError) return;
    onUpload(file, numSpeakers ? parseInt(numSpeakers, 10) : null);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '640px',
        borderRadius: '1.25rem',
        background: 'rgba(255, 253, 248, 0.94)',
        border: '1px solid #E8DACB',
        boxShadow: '0 8px 24px -4px rgba(92, 64, 40, 0.08)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
        <h3 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#231A12',
          marginBottom: '0.4rem',
          fontFamily: 'Playfair Display, Georgia, serif'
        }}>
          Upload Classroom Audio
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6B5A4E', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Upload a multi-speaker classroom discussion (.wav, .mp3, .m4a). The server will perform voice activity filtering, diarization, and collision detection.
        </p>

        {fileError && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{fileError}</span>
          </div>
        )}

        <div
          role="button"
          tabIndex={0}
          aria-label="Upload discussion audio file"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          style={{
            border: `2px dashed ${dragActive ? '#D97706' : file ? '#E07A5F' : '#E4D0BD'}`,
            borderRadius: '1rem',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragActive ? '#FEF3C7' : file ? '#FAF4ED' : '#FAF3EB',
            transition: 'all 0.2s ease',
            marginBottom: '1.5rem',
            outline: 'none'
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={handleChange}
          />

          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: file ? '#FEF3C7' : '#F5E6D8',
            color: file ? '#D97706' : '#7A6150',
            border: '1px solid #E4D0BD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: file ? '0 2px 10px rgba(217, 119, 6, 0.2)' : 'none'
          }}>
            {file ? <FileAudio size={26} /> : <UploadCloud size={26} />}
          </div>

          {file ? (
            <div>
              <p style={{ fontWeight: 700, color: '#231A12', fontSize: '0.95rem' }}>{file.name}</p>
              <p style={{ fontSize: '0.8rem', color: '#D97706', marginTop: '0.25rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to analyze
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: 700, color: '#231A12', fontSize: '0.95rem' }}>
                Click to browse or drag and drop audio
              </p>
              <p style={{ fontSize: '0.8rem', color: '#8A7565', marginTop: '0.25rem' }}>
                WAV, MP3, M4A, OGG up to 50MB
              </p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#231A12', marginBottom: '0.4rem' }}>
            Expected Number of Speakers <span style={{ color: '#8A7565', fontWeight: 400 }}>(Optional hint for better accuracy)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <Users size={16} color="#8A7565" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="number"
              min="2"
              max="20"
              placeholder="e.g. 6 (leave blank for automatic detection)"
              value={numSpeakers}
              onChange={(e) => setNumSpeakers(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #E4D0BD',
                background: '#FFFFFF',
                color: '#231A12',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'JetBrains Mono, monospace'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#D97706'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E4D0BD'}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!file || isLoading}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '0.85rem',
            background: file ? 'linear-gradient(135deg, #F59E0B 0%, #E88E50 100%)' : '#E8DACB',
            color: file ? '#231A12' : '#8A7565',
            border: file ? '1px solid rgba(217, 119, 6, 0.4)' : '1px solid #D9C3AE',
            fontSize: '0.95rem',
            fontWeight: 800,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            cursor: file && !isLoading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: file ? '0 4px 14px rgba(245, 158, 11, 0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Running Diarization Pipeline...</span>
            </>
          ) : (
            <>
              <span>Process & Map Audio</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
