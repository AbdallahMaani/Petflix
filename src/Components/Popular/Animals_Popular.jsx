import React, { useState, useEffect, forwardRef } from 'react';
import './Popular.css';
import Item from '../Item/Item';
import axios from 'axios';

const Popular = forwardRef((props, ref) => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await axios.get('https://petflix-backend-620z.onrender.com/api/Animals');
        setAnimals(response.data.slice(0, 8));
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
      <div className='popular' ref={ref}>
        <h1 className='popular-h1'>GREAT VALUES IN ANIMALS</h1>
        <hr />
     <div className="clinics-loading">Loading Animals ...</div>
     </div>
    )
  }

  return (
    <div className='popular' ref={ref}>
      <h1 className='popular-h1'>GREAT VALUES IN ANIMALS</h1>
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

export default Popular;