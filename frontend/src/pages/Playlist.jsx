import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './Playlist.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Playlist() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetails() {
      setLoading(true);
      setError('');
      setPlaylist(null);
      setTracks([]);
      try {
        // Try to fetch the playlist by id
        const res = await axios.get(`${BACKEND_URL}/api/music/playlist/${encodeURIComponent(id)}`, { withCredentials: true });

        if (cancelled) return;
        const data = res?.data?.playlist || res?.data || null;
        setPlaylist(data);

        let songs = data?.songs || data?.tracks || [];

        // If songs are just IDs, resolve them via get-details
        if (Array.isArray(songs) && songs.length > 0) {
          const isObject = typeof songs[0] === 'object' && songs[0] !== null;
          if (isObject) {
            // Normalize object shape
            const normalized = songs.map((m) => ({
              _id: m._id || m.id,
              title: m.title || m.name,
              artist: m.artist || m.artistName || '',
              coverimageurl: m.coverimageurl || m.coverUrl || m.image || '',
              musicurl: m.musicurl || m.audioUrl || m.streamUrl || '',
            }));
            setTracks(normalized);
          } else {
            // Assume IDs and fetch details for each id
            const results = await Promise.allSettled(
              songs.map((sid) => axios.get(`${BACKEND_URL}/api/music/get-details/${encodeURIComponent(sid)}`,{ withCredentials: true }))
            );
            
            const resolved = results
              .map((r) => (r.status === 'fulfilled' ? (r.value?.data?.music || r.value?.data) : null))
              .filter(Boolean)
              .map((m) => ({
                _id: m._id || m.id,
                title: m.title || '',
                artist: m.artist || '',
                coverimageurl: m.coverimageurl || '',
                musicurl: m.musicurl || '',
              }));
            setTracks(resolved);
          }
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load playlist.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) fetchDetails();
    return () => { cancelled = true; };
  }, [id]);

  const title = useMemo(() => playlist?.title || playlist?.name || 'Playlist', [playlist]);

  if (loading) return <div className="loading" aria-label="Loading" />;

  return (
    <div className="playlist-container">
      <div className="page-header playlist-header">
        <div>
          <h1>{title}</h1>
          <p className="text-secondary playlist-subtitle">{tracks.length} songs</p>
        </div>
        <Link to="/" className="text-muted">← Back</Link>
      </div>

      {error && (
        <div className="card"><p className="text-danger">{error}</p></div>
      )}

      {tracks.length === 0 ? (
        <div className="empty-state card"><p>No songs found in this playlist.</p></div>
      ) : (
        <div className="card playlist-card">
          <ul className="playlist-tracks">
            {tracks.map((t) => (
              <li key={t._id} className="track-row">
                <div className="track-cover">
                  <img
                    className="track-cover-img"
                    src={t.coverimageurl || '/covers/default.jpg'}
                    alt={`${t.title} cover`}
                    onError={(e) => { e.currentTarget.src = '/covers/default.jpg'; }}
                    referrerPolicy="no-referrer"
                    decoding="async"
                  />
                </div>
                <div>
                  <div className="track-title">{t.title}</div>
                  <div className="text-secondary track-artist">{t.artist}</div>
                </div>
                <div>
                  <Link className="button button-sm" to={`/music/${t._id}`} state={{ autoplay: true }}>Play</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
