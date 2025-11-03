import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './pages/Logout';
import ArtistDashboard from './pages/ArtistDashboard';
import UploadMusic from './pages/UploadMusic';
import CreatePlaylist from './pages/CreatePlaylist';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Music from './pages/Music';
import Playlist from './pages/Playlist';
import './App.css';
import {io} from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [socket,setSocket]=useState(null);
  const location = useLocation();

  useEffect(() => {
    const s = io(`${BACKEND_URL}`, { withCredentials: true });
    setSocket(s);

    s.on('play', (data) => {
      const musicId = data?.musicId;
      window.location.href = `/music/${musicId}`;
    });

    return () => {
      s.disconnect();
    };
  }, []);


  useEffect(() => {
    let mounted = true;
    const check = async () => {
      setChecking(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        if (!mounted) return;
        const u = res?.data?.user ?? res?.data ?? null;
        setUser(u);
      } catch (e) {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    check();
    return () => { mounted = false; };
  }, []);

  // Re-check auth on route changes so UI updates immediately after logout/login
  useEffect(() => {
    let mounted = true;
    const recheck = async () => {
      setChecking(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        if (!mounted) return;
        const u = res?.data?.user ?? res?.data ?? null;
        setUser(u);
      } catch (e) {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    recheck();
    return () => { mounted = false; };
  }, [location.pathname]);

  return (
    <div className="app">
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {checking ? null : user ? (
            <>
              <li className={`nav-user ${dropdownOpen ? 'open' : ''}`} onClick={() => setDropdownOpen(!dropdownOpen)} title={getDisplayName(user)}>
                <div className="avatar" aria-hidden="true">{getInitials(user)}</div>
                <span className="nav-username">{getDisplayName(user)}</span>
                <div className="user-dropdown">
                  {user?.role === 'artist' && <Link to="/artist/dashboard" onClick={(e) => e.stopPropagation()}>Dashboard</Link>}
                  <Link to="/logout" onClick={(e) => e.stopPropagation()}>Logout</Link>
                </div>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<ProtectedRoute user={user} checking={checking}><Home socket={socket} /></ProtectedRoute>} />
          <Route path="/artist/dashboard" element={<ProtectedRoute roles={["artist"]} user={user} checking={checking}><ArtistDashboard /></ProtectedRoute>} />
          <Route path="/artist/dashboard/upload-music" element={<ProtectedRoute roles={["artist"]} user={user} checking={checking}><UploadMusic /></ProtectedRoute>} />
          <Route path="/artist/dashboard/create-playlist" element={<ProtectedRoute roles={["artist"]} user={user} checking={checking}><CreatePlaylist /></ProtectedRoute>} />
          <Route path="/music/:id" element={<Music/>} />
          <Route path="/music/playlist/:id" element={<Playlist />} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

// Helpers
function getDisplayName(u) {
  const first = u?.fullname?.firstname || u?.firstname || u?.firstName || '';
  const last = u?.fullname?.lastname || u?.lastname || u?.lastName || '';
  const fullname = `${first} ${last}`.replace(/\s+/g, ' ').trim();
  const name = fullname || u?.name || u?.fullName || u?.username || '';
  return name || 'User';
}

function getInitials(u) {
  const first = (u?.fullname?.firstname || u?.firstname || u?.firstName || '').trim();
  const last = (u?.fullname?.lastname || u?.lastname || u?.lastName || '').trim();
  const fromName = `${first} ${last}`.trim();
  if (fromName) {
    const parts = fromName.split(/\s+/);
    const initials = parts.slice(0, 2).map(p => p[0]).join('');
    return initials.toUpperCase();
  }
  const fallback = (u?.name || u?.fullName || u?.username || '').trim();
  return fallback ? fallback[0].toUpperCase() : '?';
}
