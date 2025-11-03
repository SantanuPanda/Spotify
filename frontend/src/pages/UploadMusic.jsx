import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Music, Image, Upload, X, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import './UploadMusic.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function UploadMusic() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [musicFile, setMusicFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState({ cover: false, audio: false });

  const coverPreview = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : ''), [coverFile]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleDrag = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive({ ...dragActive, [type]: true });
    } else if (e.type === 'dragleave') {
      setDragActive({ ...dragActive, [type]: false });
    }
  };

  const handleDrop = (setter, type) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [type]: false });

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setter(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (setter, type) => (e) => {
    const file = e.target.files?.[0];
    setter(file || null);
  };

  const removeFile = (setter, type) => {
    setter(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) return setError('Please enter a track title.');
    if (!musicFile) return setError('Please select a music file.');
    if (!coverFile) return setError('Please select a cover image.');

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('musicurl', musicFile);
      formData.append('coverimageurl', coverFile);

      await axios.post(`${BACKEND_URL}/api/music/upload`, formData, {
        withCredentials: true,
      });

      setSuccess('Track uploaded successfully!');
      setTimeout(() => navigate('/artist/dashboard'), 1500);
    } catch (err) {
      console.error('Upload failed', err);
      setError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-wrapper">

        <header className="page-header">
                    <Link to="/artist/dashboard" className="back-button">
            <ArrowLeft size={20} />
          </Link>
          <div className="header-text">
            <h1 className="page-title">Upload Your Track</h1>
            <p className="page-subtitle">Share your music with listeners around the world</p>
          </div>
        </header>

        <form onSubmit={onSubmit} className="upload-form-container">
          <div className="form-card">
            <div className="input-section">
              <label htmlFor="title" className="form-label">
                Track Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter your track title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="track-title-input"
                disabled={submitting}
              />
            </div>

            <div className="upload-sections-grid">
              <div className="upload-section">
                <label className="section-label">
                  <Image size={18} />
                  Cover Art
                </label>

                <div
                  className={`drop-zone ${dragActive.cover ? 'drag-active' : ''} ${coverFile ? 'has-file' : ''}`}
                  onDragEnter={(e) => handleDrag('cover', e)}
                  onDragLeave={(e) => handleDrag('cover', e)}
                  onDragOver={(e) => handleDrag('cover', e)}
                  onDrop={handleDrop(setCoverFile, 'cover')}
                >
                  <input
                    id="cover-input"
                    type="file"
                    accept="image/*"
                    onChange={onFileSelect(setCoverFile, 'cover')}
                    className="file-input"
                    disabled={submitting}
                  />

                  {coverPreview ? (
                    <div className="file-preview">
                      <img src={coverPreview} alt="Cover preview" className="preview-image" />
                      <div className="preview-overlay">
                        <button
                          type="button"
                          onClick={() => removeFile(setCoverFile, 'cover')}
                          className="remove-button"
                          disabled={submitting}
                        >
                          <X size={50} />
                        </button>
                      </div>
                      <label htmlFor="cover-input" className="change-label">
                        Click to change image
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="cover-input" className="drop-zone-content">
                      <div className="drop-icon">
                        <Upload size={32} />
                      </div>
                      <h4 className="drop-title">Drop your cover art here</h4>
                      <p className="drop-text">or click to browse</p>
                      <span className="drop-hint">PNG, JPG up to 10MB</span>
                    </label>
                  )}
                </div>

                {coverFile && (
                  <div className="file-details">
                    <span className="file-name">{coverFile.name}</span>
                    <span className="file-size">{(coverFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )}
              </div>

              <div className="upload-section">
                <label className="section-label">
                  <Music size={18} />
                  Audio File
                </label>

                <div
                  className={`drop-zone ${dragActive.audio ? 'drag-active' : ''} ${musicFile ? 'has-file' : ''}`}
                  onDragEnter={(e) => handleDrag('audio', e)}
                  onDragLeave={(e) => handleDrag('audio', e)}
                  onDragOver={(e) => handleDrag('audio', e)}
                  onDrop={handleDrop(setMusicFile, 'audio')}
                >
                  <input
                    id="audio-input"
                    type="file"
                    accept="audio/*"
                    onChange={onFileSelect(setMusicFile, 'audio')}
                    className="file-input"
                    disabled={submitting}
                  />

                  {musicFile ? (
                    <div className="audio-file-preview">
                      <div className="audio-icon-wrapper">
                        <Music size={48} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(setMusicFile, 'audio')}
                        className="remove-button-top"
                        disabled={submitting}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="audio-input" className="drop-zone-content">
                      <div className="drop-icon">
                        <Upload size={32} />
                      </div>
                      <h4 className="drop-title">Drop your audio file here</h4>
                      <p className="drop-text">or click to browse</p>
                      <span className="drop-hint">MP3, WAV, FLAC up to 50MB</span>
                    </label>
                  )}
                </div>

                {musicFile && (
                  <>
                    <div className="file-details">
                      <span className="file-name">{musicFile.name}</span>
                      <span className="file-size">{(musicFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <audio controls src={URL.createObjectURL(musicFile)} className="audio-player" />
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="spinner"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload Track
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
