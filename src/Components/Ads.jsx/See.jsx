import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Ads.jsx/Ad.css';
import catAd from '../Assets/Covers/CoverPic1.jpeg';
import catAd2 from '../Assets/Covers/CoverPic2.jpeg';
import hourseAd from '../Assets/Covers/CoverPic3.jpeg';
import birdAd from '../Assets/Covers/CoverPic4.jpeg';

const AnimalAd = ({ scrollToAnimals }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const intervalRef = useRef(null);
  const SLIDE_INTERVAL = 8000;
  const images = [catAd, catAd2, hourseAd, birdAd];
  const [user, setUser] = useState({ name: '' });

  const startInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(goToNext, SLIDE_INTERVAL);
  };

  useEffect(() => {
    if (location.state && location.state.userName) {
      const fullName = location.state.userName;
      const firstName = fullName.split(' ')[0];
      setUser({ name: firstName });
    } else {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const fullName = userData.name;
        const firstName = fullName.split(' ')[0];
        setUser({ name: firstName });
      }
    }
    startInterval();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [location.state]);

  useEffect(() => {
    setAnimate(true);
    const timeoutId = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(timeoutId);
  }, [currentImageIndex]);

  const handleButtonClick = () => {
    navigate('/products');
    window.scrollTo({ top: 0 });
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    startInterval(); // Reset timer
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    startInterval(); // Reset timer
  };

  return (
    <div className="animal-ad">
      <div className="image-slider">
        <img
          src={images[currentImageIndex]}
          alt="Animal Ad"
          className={`ad-image ${animate ? 'fade-in-right' : ''}`}
        />
      </div>
      <div style={{width:'33%'}} className="ad-content">
        <p>We Will</p>
        <br />
        <p>Make You</p>
        <br />
        <h2>See Your</h2>
        <h2>Lovely Pet</h2>
        <h1>Clearer</h1>
        <button className="ad-button" onClick={handleButtonClick}>
          Browse Pets Products
        </button>
      </div>
    </div>
  );
};

export default AnimalAd;