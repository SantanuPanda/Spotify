import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePlaylist.css';

export default function CreatePlaylist() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [allSongs, setAllSongs] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    let mounted = true;
    const loadSongs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/music/artist-music`, { withCredentials: true });
        if (!mounted) return;
        const music = Array.isArray(res?.data?.music) ? res.data.music : [];
        setAllSongs(music);
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to load songs:', err);
        setError(err?.response?.data?.message || 'Failed to load your songs.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadSongs();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSongs;
    return allSongs.filter(m =>
      m.title?.toLowerCase().includes(q) || m.artist?.toLowerCase().includes(q)
    );
  }, [allSongs, query]);

  const toggleSong = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Please enter a playlist title.');
    if (selected.size === 0) return setError('Please select at least one song.');

    const payload = { title: title.trim(), songs: Array.from(selected) };

    try {
      setSubmitting(true);
      await axios.post(`${BACKEND_URL}/api/music/create-playlist`, payload, { withCredentials: true });
      navigate('/artist/dashboard');
    } catch (err) {
      console.error('Create playlist failed:', err);
      setError(err?.response?.data?.message || 'Failed to create playlist.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="playlist-container">
      <div className="playlist-header">
        <div className="header-content">
          <h1 className="header-title">Create New Playlist</h1>
          <p className="header-subtitle">Build your perfect collection</p>
        </div>
      </div>

      <div className="playlist-content">
        <form onSubmit={onSubmit} className="playlist-form">
          <div className="form-section">
            <label htmlFor="title" className="form-label">Playlist Name</label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="My Awesome Playlist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-section">
            <div className="section-header">
              <label className="form-label">Select Songs</label>
              <span className="selection-badge">{selected.size} songs selected</span>
            </div>

            <div className="search-box">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search by title or artist..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search songs"
              />
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading your music...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-container">
                <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
                <p className="empty-text">No songs found</p>
                <p className="empty-hint">Try a different search or upload some music first</p>
              </div>
            ) : (
              <div className="songs-list">
                {filtered.map((m) => {
                  const isSelected = selected.has(m._id);
                  return (
                    <div
                      key={m._id}
                      className={`song-card ${isSelected ? 'song-selected' : ''}`}
                      onClick={() => toggleSong(m._id)}
                    >
                      <div className="song-checkbox-wrapper">
                        <input
                          type="checkbox"
                          className="song-checkbox"
                          checked={isSelected}
                          onChange={() => toggleSong(m._id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="checkbox-custom"></div>
                      </div>

                      <div className="song-thumbnail">
                        <img src={m.coverimageurl} alt={`${m.title} cover`} />
                        <div className="thumbnail-overlay"></div>
                      </div>

                      <div className="song-details">
                        <h3 className="song-name" title={m.title}>{m.title}</h3>
                        <p className="song-artist-name" title={m.artist}>{m.artist}</p>
                      </div>

                      {isSelected && (
                        <div className="selected-indicator">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="error-box">
              <svg className="error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="form-actions">
            <Link to="/artist/dashboard" className="btn btn-cancel">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="btn-spinner"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Create Playlist
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
