import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    password: "",
    role: "user",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${BACKEND_URL}/api/auth/register`,
        {
          email: formData.email,
          firstname: formData.firstname,
          lastname: formData.lastname,
          password: formData.password,
          role: formData.role,
        },
        {
          withCredentials: true,
        }
      );
      navigate("/login");

    } catch (err) {
      console.error("Error during registration:", err);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Join Spotify</h1>
          <p>Sign up to start listening</p>
        </div>

        <div className="register-content">
          <div className="social-section">
            <button
              type="button"
              className="google-btn"
              onClick={() => {
                window.location.href = `${AuthURL}/api/auth/google`;
              }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <div className="divider"><span>OR</span></div>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-grid">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
              />
              <div className="name-row">
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min 6 characters)"
                minLength="6"
                required
              />
            </div>

            <div className="role-section">
              <span className="role-label">I am a: (optional)</span>
              <div className="role-options">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === "user"}
                    onChange={handleChange}
                  />
                  <span>Listener</span>
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="artist"
                    checked={formData.role === "artist"}
                    onChange={handleChange}
                  />
                  <span>Artist</span>
                </label>
              </div>
            </div>

            <button type="submit" className="signup-btn">Sign Up</button>
          </form>

          <p className="login-link">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
