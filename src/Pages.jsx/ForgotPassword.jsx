import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Pages.css/ForgotPassword.css';
import Footer from '../Components/Footer/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Sending email...');

    try {
      const response = await fetch('https://petflix-backend-620z.onrender.com/api/User/ForgotPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Forgot Password Error:', error);
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <>
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <h1>Forgot Your Password?</h1>
          <p>Enter your email address and we'll send you your password.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send Email</button>
          </form>
          {message && <p className="message">{message}</p>}
          <button type="button" onClick={() => navigate('/login')} className="back-to-login-btn">
            Back to Login
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;