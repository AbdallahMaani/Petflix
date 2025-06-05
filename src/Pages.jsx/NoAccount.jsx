// NoAccount.jsx
import React from 'react';
import '../Pages.css/NoAccount.css'; // Import the CSS file
import { Link } from 'react-router-dom'; // Import Link
import Footer from '../Components/Footer/Footer'; // Import Footer

const NoAccount = () => {
  return (
    <>
    <div className="no-account-container">
      <div className="no-account-message">
        <h2>Oops!</h2>
        <p>You do not have an account. To use all <span style={{fontWeight : "bolder"}}>Petflix</span> Featuers Please create an account or sign in to continue.</p>
        <div className="no-account-buttons"> {/* Add buttons container */}
            <Link to="/"><button className="no-account-button">Guest mode</button></Link>
            <Link to="/login"><button className="no-account-button">Sign In</button></Link>
        </div>
      </div>
    </div>
</>
  );
};

export default NoAccount;