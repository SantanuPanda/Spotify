import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link,useLocation } from 'react-router-dom';
import axios from 'axios';
import { HugeiconsIcon } from '@hugeicons/react';
import { GoForward10SecIcon,GoBackward10SecIcon} from '@hugeicons/core-free-icons';
import { Play, Pause, Volume2, VolumeX,ArrowLeft } from 'lucide-react';
import './Music.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function formatTime(sec) {
  if (!isFinite(sec)) return '0:00';
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(1, '0');
  return `${m}:${s}`;
}

export default function Music() {
  const location = useLocation();
  const { id } = useParams();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [metaError, setMetaError] = useState('');
  const [metaLoading, setMetaLoading] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    const autoplay = location.state?.autoplay;
    const audio = audioRef.current;

    if (autoplay && audio) {
      const playAudio = async () => {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (err) {
          console.warn("Autoplay blocked by browser:", err);
        }
      };
      const timer = setTimeout(playAudio, 500);
      return () => clearTimeout(timer);
    }
  }, [location.state]);


  const media = useMemo(() => {
    const fallbackTitle = decodeURIComponent(id || '').replace(/[-_]/g, ' ');
    const base = {
      audioSrc: `/music/${id}.mp3`,
      coverSrc: `/covers/${id}.jpg`,
      title: fallbackTitle,
      artist: '',
    };
    if (!meta) return base;
    const m = meta.music || meta;
    return {
      audioSrc: m?.musicurl || base.audioSrc,
      coverSrc: m?.coverimageurl || base.coverSrc,
      title: m?.title || base.title,
      artist: m?.artist || '',
    };
  }, [id, meta]);

  useEffect(() => {
    setCoverFailed(false);
  }, [media.coverSrc]);

  useEffect(() => {
    let cancelled = false;
    async function fetchMeta() {
      setMetaLoading(true);
      setMetaError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/music/get-details/${encodeURIComponent(id)}`, { withCredentials: true });
        if (!cancelled) setMeta(res.data);
      } catch (e) {
        if (!cancelled) setMetaError('Could not load track details. Using defaults.');
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    }
    if (id) fetchMeta();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setError('');
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const onLoaded = () => {
      setDuration(audio.duration || 0);
    };
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => setIsPlaying(false);
    const onError = () => setError('Unable to load audio.');

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [media.audioSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    audio.muted = muted;
    if (!muted) {
      audio.volume = volume;
    }
  }, [rate, volume, muted]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      setError('Press Play to start playback.');
    }
  };

  const onSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const onChangeVolume = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const v = Number(e.target.value);
    setVolume(v);
    audio.volume = muted ? 0 : v;
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    setMuted(next);
    audio.muted = next;
    if (!next) {
      audio.volume = volume;
    }
  };

  const onChangeRate = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const r = Number(e.target.value);
    setRate(r);
    audio.playbackRate = r;
  };

  const skipTime = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="container music-container">
      <Link to="/" className="music-back">
        <ArrowLeft size={18} />
        <span>Back to Home</span>
      </Link>

      <div className="card music-card">
        <div className="music-grid">
          <div className="music-body">
            <div className="music-header">
              <div className="music-cover-wrapper">
                <div className={`music-cover ${isPlaying ? 'playing' : ''}`}>
                  <img
                    src={coverFailed ? '/covers/default.jpg' : media.coverSrc}
                    alt={`${media.title} cover`}
                    onError={() => setCoverFailed(true)}
                    referrerPolicy="no-referrer"
                    decoding="async"
                    loading="eager"
                  />
                  {isPlaying && (
                    <div className="music-vinyl-effect"></div>
                  )}
                </div>
              </div>

              <div className="music-info">
                <h1 className="music-title">{media.title || `Track ${id}`}</h1>
                {media.artist && (
                  <p className="music-artist">{media.artist}</p>
                )}
              </div>
            </div>

            {(error || metaError) && (
              <div className="music-error">
                <p>{error || metaError}</p>
              </div>
            )}
            {metaLoading && (
              <div className="music-loading">
                <p>Loading track details...</p>
              </div>
            )}
          </div>

          <audio ref={audioRef} src={media.audioSrc} preload="metadata" />

          <div className="music-controls">
            <div className="music-timeline">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={onSeek}
                className="music-range"
                style={{ '--progress': `${progress}%` }}
              />
              <div className="music-time">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="music-playback-controls">
              <button
                className="btn-secondary btn-skip"
                onClick={() => skipTime(-10)}
                title="Rewind 10 seconds"
              >
                <HugeiconsIcon icon={GoBackward10SecIcon} size={30} color="currentColor" strokeWidth={1.5} />
              </button>

              <button
                className="btn-play"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>

              <button
                className="btn-secondary btn-skip"
                onClick={() => skipTime(10)}
                title="Forward 10 seconds"
              >
                <HugeiconsIcon icon={GoForward10SecIcon} size={30} color="currentColor" strokeWidth={1.5} />
              </button>
            </div>

            <div className="music-settings">
              <div className="music-volume-control">
                <button
                  className="btn-icon"
                  onClick={toggleMute}
                  title={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={onChangeVolume}
                  className="music-volume"
                  style={{ '--volume': `${(muted ? 0 : volume) * 100}%` }}
                />
              </div>

              <div className="music-speed-control">
                <label htmlFor="rate" className="music-rate-label">
                  Speed
                </label>
                <select id="rate" value={rate} onChange={onChangeRate} className="music-speed-select">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                    <option key={r} value={r}>{r}x</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
