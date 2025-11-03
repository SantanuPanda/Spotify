import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Renders children only for guests (not authenticated). If authed, redirect to home.
export default function GuestRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        if (mounted) setAuthed(true);
      } catch (err) {
        if (mounted) setAuthed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    check();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="page-header"><p>Checking authentication...</p></div>;
  if (authed) return <Navigate to="/" replace />;
  return children;
}
