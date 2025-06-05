import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('‏https://localhost:7007/api/User', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();

      if (!data.isAdmin) {
        throw new Error('Only admin users can log in here.');
      }

      localStorage.setItem('loggedInUser', JSON.stringify({
        userId: data.userId,
        token: data.token,
        role: data.role,
        isAdmin: data.isAdmin,
      }));

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="petflix-feedback-page" style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      <h1 className="petflix-page-title">
        <FontAwesomeIcon icon={faUser} className="petflix-title-icon" />
        Admin Login
      </h1>
      {error && <div className="petflix-error-message">{error}</div>}
      <form onSubmit={handleLogin} className="petflix-edit-form">
        <div className="petflix-form-group">
          <label>
            <FontAwesomeIcon icon={faUser} /> Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="petflix-feedback-response-input"
            placeholder="Enter admin username"
          />
        </div>
        <div className="petflix-form-group">
          <label>
            <FontAwesomeIcon icon={faLock} /> Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="petflix-feedback-response-input"
            placeholder="Enter password"
          />
        </div>
        <button
          type="submit"
          className="petflix-primary-button"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSignInAlt} /> {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;