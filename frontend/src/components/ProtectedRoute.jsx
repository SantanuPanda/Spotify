import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ProtectedRoute({ children, roles, user: userProp, checking: checkingProp }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [authorized, setAuthorized] = useState(true);

  // If App passes user/checking, prefer that to avoid double-fetch and blank states
  if (typeof checkingProp !== 'undefined' || typeof userProp !== 'undefined') {
    const checking = !!checkingProp;
    const user = userProp ?? null;
    if (checking) return <div className="page-header"><p>Checking authentication...</p></div>;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && roles.length) {
      const role = String(user?.role || '').toLowerCase();
      const allowed = Array.isArray(roles) ? roles : [roles];
      const allowedNorm = allowed.map(r => String(r).toLowerCase());
      const ok = allowedNorm.includes(role);
      if (!ok) return <Navigate to="/" replace />;
    }
    return children;
  }

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        if (!mounted) return;
        setAuthed(true);
        if (roles && roles.length) {
          const user = res?.data?.user ?? res?.data ?? null;
          const role = String(user?.role || '').toLowerCase();
          const allowed = Array.isArray(roles) ? roles : [roles];
          const allowedNorm = allowed.map(r => String(r).toLowerCase());
          const ok = allowedNorm.includes(role);
          setAuthorized(!!ok);
        } else {
          setAuthorized(true);
        }
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
  if (!authed) return <Navigate to="/login" replace />;
  if (!authorized) return <Navigate to="/" replace />;
  return children;
}
