import React, { useState, useEffect, forwardRef } from 'react';
import '../Components/Popular/Popular.css';
import Item from '../Components/Item/Item.jsx';
import axios from 'axios';

const MadeForYou = forwardRef((props, ref) => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ name: '' });

  useEffect(() => {
    // Retrieve user data from local storage
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const fullName = userData.name;
      const firstName = fullName.split(' ')[0]; // Split and get the first name
      setUser({ name: firstName });
    }
  }, []);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await axios.get('‏https://localhost:7007/api/Animals');
        setAnimals(response.data.slice(0,8));
      } catch (err) {
        console.error("Error fetching animals:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  if (error) {
    let message = error.message;

    if (error.response) {
      message = `Error: ${error.response.status} - ${error.response.data.message || error.message}`;
    } else if (error.request) {
      message = "No Connection to the server try connecting to the internet";
    } else {
      message = `Error: ${error.message}`;
    }

    return (
      <div className="error-overlay show">
        <div className="error-message">
          {message}
          <p>"Failed to fetch"</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='popular'>
        <h1 className='popular-h1'>Don't Miss These Deals</h1>
        <hr />
     <div className="clinics-loading">Loading Animals ...</div>
     </div>
    )
  }

  return (
    <div className='popular' ref={ref}>
      <h1 className='popular-h1'>Don't Miss These Deals {user.name} </h1>
      <hr />
      <div className="popular-item">
        {animals.map((animal) => (
          <Item
            key={animal.animal_id}
            {...animal}
          />
        ))}
      </div>
    </div>
  );
});

export default MadeForYou;