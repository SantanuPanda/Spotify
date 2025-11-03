import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Logout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const doLogout = async () => {
    setLoading(true);
    setError("");
    try {
      // Call backend logout endpoint. Use POST to be explicit; backend should accept this.
      await axios.get(
        `${BACKEND_URL}/api/auth/logout`,
        { withCredentials: true }
      );

      // Clear any client-side tokens/storage (best-effort)
      try {
        localStorage.removeItem('authtoken');
        sessionStorage.removeItem('authtoken');
      } catch (e) {
        // ignore
      }

      // Redirect to login (or home) after successful logout
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      setError(
        err?.response?.data?.message || 'Logout failed. Please try again.'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    doLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-header">
      <h1>Logging Out</h1>
      <p>Please wait while we securely log you out...</p>

      {loading ? (
        <div className="loading" aria-hidden="true" />
      ) : error ? (
        <div>
          <p className="text-danger">{error}</p>
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <button onClick={doLogout}>Try Again</button>
            <button
              onClick={() => navigate('/')}
              style={{ marginLeft: 'var(--space-sm)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Logout;
