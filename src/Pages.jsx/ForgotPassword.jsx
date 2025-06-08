import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Pages.css/ForgotPassword.css'; // Create this CSS file
import Footer from '../Components/Footer/Footer';

const ForgotPassword = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Sending email...'); // Initial message

    try {
      const response = await fetch('https://petflix-backend-620z.onrender.com/api/User/ForgotPassword', { // Replace with your API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message); // Success message from the API
        setTimeout(() => {
          navigate('/login'); // Redirect to login page after a delay
        }, 3000); // Adjust delay as needed
      } else {
        setMessage(data.message); // Error message from the API
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
          <p>Enter your username or email address and we'll send you instructions on how to reset your password.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username or Email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
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