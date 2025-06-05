// NoAccount.jsx
import React from 'react';
import '../Pages.css/NoAccount.css';
import { Link, useNavigate } from 'react-router-dom';

const NoAccount = ({ onGuestMode }) => {
  const navigate = useNavigate();

  const handleGuest = () => {
    if (onGuestMode) {
      onGuestMode();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="no-account-container">
      <div className="no-account-message">
        <h2>Oops!</h2>
        <p>
          You do not have an account. To use all <span style={{ fontWeight: "bolder" }}>Petflix</span> Featuers Please create an account or sign in to continue.
        </p>
        <div className="no-account-buttons">
          <button className="no-account-button" onClick={handleGuest}>Guest mode</button>
          <Link to="/login"><button className="no-account-button">Sign In</button></Link>
        </div>
      </div>
    </div>
  );
};

export default NoAccount;