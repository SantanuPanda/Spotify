import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Trash2, Music, ListMusic, Plus, TrendingUp } from 'lucide-react';
import './ArtistDashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


function MusicCard({ music, onDelete, deletingId }) {
	const [imageError, setImageError] = useState(false);

	return (
		<div className="music-card">
			<div className="music-cover">
				{!imageError ? (
					<img
						src={music.coverimageurl}
						alt={`${music.title} cover`}
						onError={() => setImageError(true)}
					/>
				) : (
					<div className="music-cover-fallback">
						<Music size={48} />
					</div>
				)}
				<div className="music-overlay">
					<Link
						className="play-button"
						to={`/music/${music._id}`}
						state={{ autoplay: true }}
						title="Play track"
					>
						<Play size={24} fill="currentColor" />
					</Link>
				</div>
			</div>
			<div className="music-info">
				<h4 className="music-title" title={music.title}>{music.title}</h4>
				<p className="music-artist" title={music.artist}>{music.artist}</p>
			</div>
			<div className="music-actions">
				<button
					className="button button-sm button-danger"
					onClick={() => onDelete?.(music._id)}
					disabled={deletingId === music._id}
					title="Delete this track"
				>
					<Trash2 size={16} />
				</button>
			</div>
		</div>
	);
}

function PlaylistCard({ playlist, covers = [], onDelete, deletingId }) {
	// Calculate grid columns based on total number of covers
	const getCols = (count) => {
		if (count <= 1) return 1;
		if (count <= 4) return 2;
		if (count <= 9) return 3;
		if (count <= 16) return 4;
		if (count <= 25) return 5;
		return 6; // Max 6 columns for very large playlists
	};
	const cols = getCols(covers.length);

	return (
		<div className="playlist-card">
			<div className="playlist-cover" style={{ '--cols': cols }}>
				{covers.length > 0 ? (
					covers.map((src, i) => (
						<div className="tile" key={i}>
							<img src={src} alt={`${playlist.title} cover ${i + 1}`} />
						</div>
					))
				) : (
					<div className="playlist-cover-fallback">
						<ListMusic size={48} />
					</div>
				)}
				<div className="playlist-overlay">
					<Link
						className="play-button"
						to={`/music/playlist/${playlist._id}`}
						title="Open playlist"
					>
						<Play size={24} fill="currentColor" />
					</Link>
				</div>
			</div>
			<div className="playlist-info">
				<h4 className="playlist-title" title={playlist.title}>{playlist.title}</h4>
				<p className="playlist-meta">
					<span className="playlist-artist">{playlist.artist}</span>
					<span className="playlist-separator">•</span>
					<span className="playlist-count">{playlist.songs?.length || 0} songs</span>
				</p>
			</div>
			<div className="playlist-actions">
				<button
					className="button button-sm button-danger"
					onClick={() => onDelete?.(playlist._id)}
					disabled={deletingId === playlist._id}
					title="Delete this playlist"
				>
					<Trash2 size={16} />
				</button>
			</div>
		</div>
	);
}

function StatCard({ icon: Icon, label, value, trend }) {
	return (
		<div className="stat-card">
			<div className="stat-icon">
				<Icon size={24} />
			</div>
			<div className="stat-content">
				<p className="stat-label">{label}</p>
				<h3 className="stat-value">{value}</h3>
				{trend && (
					<p className="stat-trend">
						<TrendingUp size={14} />
						<span>{trend}</span>
					</p>
				)}
			</div>
		</div>
	);
}

export default function ArtistDashboard() {
	const [loading, setLoading] = useState(true);
	const [musics, setMusics] = useState([]);
	const [playlists, setPlaylists] = useState([]);
	const [error, setError] = useState('');
	const [deletingMusicId, setDeletingMusicId] = useState(null);
	const [deletingPlaylistId, setDeletingPlaylistId] = useState(null);

	const musicById = useMemo(() => {
		const map = Object.create(null);
		for (const m of musics) map[m._id] = m;
		return map;
	}, [musics]);

	const stats = useMemo(() => ({
		totalTracks: musics.length,
		totalPlaylists: playlists.length,
		totalSongs: playlists.reduce((sum, p) => sum + (p.songs?.length || 0), 0)
	}), [musics, playlists]);

	useEffect(() => {
		let mounted = true;

		const loadMusic = async () => {
			try {
				const musicRes = await axios.get(`${BACKEND_URL}/api/music/artist-music`, { withCredentials: true });
				if (mounted) {
					const fetchedMusic = Array.isArray(musicRes?.data?.music) ? musicRes.data.music : [];
					setMusics(fetchedMusic);
				}
			} catch (err) {
				if (mounted) {
					console.error('Failed to load music:', err);
				}
			}
		};

		const loadPlaylists = async () => {
			try {
				const playlistRes = await axios.get(`${BACKEND_URL}/api/music/artist-playlists`, { withCredentials: true });
				if (mounted) {
					const fetchedPlaylists = Array.isArray(playlistRes?.data?.playlists) ? playlistRes.data.playlists : [];
					setPlaylists(fetchedPlaylists);
				}
			} catch (err) {
				if (mounted) {
					console.error('Failed to load playlists:', err);
				}
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

	const requestDelete = async (method, url) => {
		try {
			if (method === 'DELETE') {
				return await axios.delete(url, { withCredentials: true });
			}
			return await axios.get(url, { withCredentials: true });
		} catch (err) {
			if (method === 'DELETE' && (err?.response?.status === 405 || err?.response?.status === 404)) {
				return await axios.get(url, { withCredentials: true });
			}
			throw err;
		}
	};

	const handleDeleteMusic = async (id) => {
		if (!id) return;
		const ok = window.confirm('Delete this track permanently?');
		if (!ok) return;
		setDeletingMusicId(id);
		try {
			await requestDelete('DELETE', `${BACKEND_URL}/api/music/delete-music/${encodeURIComponent(id)}`);
			setMusics((prev) => prev.filter((m) => m._id !== id));
			setPlaylists((prev) => prev.map(p => ({
				...p,
				songs: (p.songs || []).filter(s => (typeof s === 'string' ? s : s?._id) !== id)
			})));
		} catch (err) {
			console.error('Failed to delete music:', err);
			window.alert('Could not delete the track. Please try again.');
		} finally {
			setDeletingMusicId(null);
		}
	};

	const handleDeletePlaylist = async (id) => {
		if (!id) return;
		const ok = window.confirm('Delete this playlist permanently?');
		if (!ok) return;
		setDeletingPlaylistId(id);
		try {
			await requestDelete('DELETE', `${BACKEND_URL}/api/music/delete-playlist/${encodeURIComponent(id)}`);
			setPlaylists((prev) => prev.filter((p) => p._id !== id));
		} catch (err) {
			console.error('Failed to delete playlist:', err);
			window.alert('Could not delete the playlist. Please try again.');
		} finally {
			setDeletingPlaylistId(null);
		}
	};

	return (
		<div className="artist-dashboard">
			<header className="dashboard-header">
				<div className="header-content">
					<h1>Artist Dashboard</h1>
					<p className="header-subtitle">Manage your tracks and playlists</p>
				</div>
				<div className="dashboard-actions">
					<Link to="/artist/dashboard/upload-music" className="button button-primary">
						<Plus size={20} />
						<span>Create Music</span>
					</Link>
					<Link to="/artist/dashboard/create-playlist" className="button button-secondary">
						<Plus size={20} />
						<span>Create Playlist</span>
					</Link>
				</div>
			</header>

			{loading ? (
				<div className="loading-container">
					<div className="loading" aria-label="Loading" />
					<p className="loading-text">Loading your content...</p>
				</div>
			) : (
				<>
					{error && (
						<div className="error-banner">
							<p>{error}</p>
						</div>
					)}

					<div className="stats-grid">
						<StatCard
							icon={Music}
							label="Total Tracks"
							value={stats.totalTracks}
						/>
						<StatCard
							icon={ListMusic}
							label="Total Playlists"
							value={stats.totalPlaylists}
						/>
						<StatCard
							icon={Music}
							label="Songs in Playlists"
							value={stats.totalSongs}
						/>
					</div>

					<section className="section-block">
						<div className="section-head">
							<div className="section-title-wrapper">
								<Music size={28} className="section-icon" />
								<h2>Your Music</h2>
							</div>
							<Link className="link-view-all" to="#">
								View all
								<span className="arrow">→</span>
							</Link>
						</div>
						{musics.length === 0 ? (
							<div className="empty-state">
								<div className="empty-icon">
									<Music size={64} />
								</div>
								<h3>No tracks yet</h3>
								<p>Click "Create Music" to upload your first song and start building your music library.</p>
								<Link to="/artist/dashboard/upload-music" className="button button-primary">
									<Plus size={20} />
									<span>Upload Your First Track</span>
								</Link>
							</div>
						) : (
							<div className="grid grid-music">
								{musics.map((m) => (
									<MusicCard key={m._id} music={m} onDelete={handleDeleteMusic} deletingId={deletingMusicId} />
								))}
							</div>
						)}
					</section>

					<section className="section-block">
						<div className="section-head">
							<div className="section-title-wrapper">
								<ListMusic size={28} className="section-icon" />
								<h2>Your Playlists</h2>
							</div>
							<Link className="link-view-all" to="#">
								View all
								<span className="arrow">→</span>
							</Link>
						</div>
						{playlists.length === 0 ? (
							<div className="empty-state">
								<div className="empty-icon">
									<ListMusic size={64} />
								</div>
								<h3>No playlists yet</h3>
								<p>Click "Create Playlist" to curate your first collection and organize your music.</p>
								<Link to="/artist/dashboard/create-playlist" className="button button-primary">
									<Plus size={20} />
									<span>Create Your First Playlist</span>
								</Link>
							</div>
						) : (
							<div className="grid grid-playlists">
								{playlists.map((p) => {
									const songIds = (p.songs || []).map((s) => typeof s === 'string' ? s : s?._id).filter(Boolean);
									const covers = songIds
										.map((id) => musicById[id]?.coverimageurl)
										.filter(Boolean);
									return (
										<PlaylistCard key={p._id} playlist={p} covers={covers} onDelete={handleDeletePlaylist} deletingId={deletingPlaylistId} />
									);
								})}
							</div>
						)}
					</section>
				</>
			)}
		</div>
	);
}
