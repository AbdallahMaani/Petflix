import React from 'react';
import '../Pages.css/ConnectionLost.css'
import Footer from '../Components/Footer/Footer.jsx'
const ConnectionLost = () => {
  return (
    <>
    <div className="connection-lost-container">
      <h1 className="connection-lost-title">Connection Lost</h1>
      <p className="connection-lost-message">
        It seems you've lost your internet connection.  Please check your
        connection and try again.
      </p>
      <div className="connection-lost-suggestions">
        <ul className="connection-lost-list">
          <li>Check your Wi-Fi or mobile data connection.</li>
          <li>Make sure your device is not in airplane mode.</li>
          <li>Restart your router or modem.</li>
          <li>Try visiting other websites to see if the problem is with this site.</li>
        </ul>
      </div>
      <button className="connection-lost-retry-button" onClick={() => window.location.reload()}>
        Try Again
      </button>
       <p className="connection-lost-contact">
        If the problem persists, please contact us.
      </p>
    </div>
    </>
  );
};

export default ConnectionLost;