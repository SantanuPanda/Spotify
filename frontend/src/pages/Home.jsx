import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

console.log(BACKEND_URL);

function MusicCard({ music,socket }) {
  const navigate = useNavigate();

  const handlePlay = () => {
    // Emit the play event to the socket
    if (socket) {
      socket.emit("play", { musicId: music._id });
    }
    // Navigate to the music page
    navigate(`/music/${music._id}`, { state: { autoplay: true } });
  };
  return (
    <div className="music-card card">
      <div className="music-cover">
        <img src={music.coverimageurl} alt={`${music.title} cover`} />
      </div>
      <div className="music-info">
        <h4 className="music-title" title={music.title}>{music.title}</h4>
        <p className="music-artist" title={music.artist}>{music.artist}</p>
      </div>
      <div className="music-actions">
        <button
          className="button button-sm"
          onClick={handlePlay}
          
        >
          Play
        </button>
      </div>
    </div>
  );
}

function PlaylistCard({ playlist }) {
  return (
    <div className="playlist-card card">
      <div className="playlist-info">
        <h4 className="playlist-title" title={playlist.title}>{playlist.title}</h4>
        <p className="playlist-meta">{playlist.artist} • {playlist.songs?.length || 0} songs</p>
      </div>
      <div className="playlist-actions">
        <Link className="button button-sm" to={`/music/playlist/${playlist._id}`}>Open</Link>
      </div>
    </div>
  );
}

export default function Home({socket}) {
  const [loading, setLoading] = useState(true);
  const [musics, setMusics] = useState([]);
  const [allMusics, setAllMusics] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState('');
  const [displayCount, setDisplayCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadMusic = async () => {
      try {
        const musicRes = await axios.get(`${BACKEND_URL}/api/music/`, { withCredentials: true });
        if (mounted) {
          const fetchedMusic = Array.isArray(musicRes?.data?.music) ? musicRes.data.music : [];
          setAllMusics(fetchedMusic);
          setMusics(fetchedMusic.slice(0, 10));
        }
      } catch (err) {
        if (mounted) console.error('Failed to load music:', err);
      }
    };

    const loadPlaylists = async () => {
      try {
        const playlistRes = await axios.get(`${BACKEND_URL}/api/music/playlists`, { withCredentials: true });
        if (mounted) {
          const fetchedPlaylists = Array.isArray(playlistRes?.data?.playlists) ? playlistRes.data.playlists : [];
          setPlaylists(fetchedPlaylists);
        }
      } catch (err) {
        if (mounted) console.error('Failed to load playlists:', err);
      }
    };

    const load = async () => {
      setLoading(true);
      setError('');
      await Promise.allSettled([loadMusic(), loadPlaylists()]);
      if (mounted) setLoading(false);
    };

    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || musics.length >= allMusics.length) return;
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      // Load more when user is 300px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        setLoadingMore(true);
        setTimeout(() => {
          const nextCount = displayCount + 10;
          setMusics(allMusics.slice(0, nextCount));
          setDisplayCount(nextCount);
          setLoadingMore(false);
        }, 500); // Small delay to simulate loading
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, musics.length, allMusics.length, displayCount, allMusics]);

  if (loading) return <div className="loading" aria-label="Loading" />;

  return (
    <div className="home-page">
      <div style={{flexDirection:"column"}} className="page-header">
        <h1>Discover</h1>
        <p className="text-secondary">Browse the latest tracks and curated playlists</p>
      </div>
      

      {error && (
        <div className="card" style={{ border: '1px solid var(--color-border-light)' }}>
          <p className="text-secondary">{error}</p>
        </div>
      )}

      <section className="section-block">
        <div className="section-head">
          <h2>Playlists</h2>
        </div>
        {playlists.length === 0 ? (
          <div className="empty-state card"><p>No playlists yet.</p></div>
        ) : (
          <div className="grid grid-playlists">
            {playlists.map((p) => (
              <PlaylistCard key={p._id} playlist={p} />
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-head">
          <h2>Trending Music</h2>
          <p className="text-secondary" style={{ margin: 0, fontSize: 'var(--font-size-sm, 0.875rem)' }}>
            {musics.length} of {allMusics.length} songs
          </p>
        </div>
        {musics.length === 0 ? (
          <div className="empty-state card"><p>No tracks available.</p></div>
        ) : (
          <>
            <div className="grid grid-music">
              
              {musics.map((m) => <MusicCard key={m._id} music={m} socket={socket} />)}
            </div>
            {loadingMore && (
              <div style={{ textAlign: 'center', padding: 'var(--space-lg, 1.5rem)' }}>
                <div className="loading" aria-label="Loading more tracks" />
              </div>
            )}
            {musics.length >= allMusics.length && allMusics.length > 10 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-lg, 1.5rem)', color: 'rgba(255,255,255,0.6)' }}>
                <p>All tracks loaded</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
