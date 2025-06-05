import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Ads.jsx/Ad.css';
import coverImage from '../Assets/AdAnimalCover.png';
import catAd from '../Assets/CatAd.png';
import catAd2 from '../Assets/CatAd2.png';
import hourseAd from '../Assets/HourseAd.png';
import birdAd from '../Assets/BirdAd.png';

const AnimalAd = forwardRef(({ scrollToAnimals }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [user, setUser] = useState({ name: '' });
  const intervalRef = useRef(null);
  const SLIDE_INTERVAL = 5000;
  const images = [coverImage, catAd, catAd2, hourseAd, birdAd];

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
  }, [location.state]);

  const startInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(goToNext, SLIDE_INTERVAL);
  };

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleButtonClick = () => {
    navigate('/animals');
    window.scrollTo({ top: 0 });
  };

  const goToPrevious = () => {
    setAnimate(true);
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    setTimeout(() => setAnimate(false), 500);
    startInterval(); // Reset timer
  };

  const goToNext = () => {
    setAnimate(true);
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    setTimeout(() => setAnimate(false), 500);
    startInterval(); // Reset timer
  };

  return (
    <div className="animal-ad" ref={ref}>
      <h1 style={{ textAlign: 'center', margin: '2rem auto' }} className='popular-h1'>Check Our Latest Pets</h1>
      <div className="image-slider">
        <img
          src={images[currentImageIndex]}
          alt="Animal Ad"
          className={`ad-image ${animate ? 'fade-in-right' : ''}`}
        />
        <div className="slider-buttons-container">
          <button className="slider-button prev" onClick={goToPrevious}>
            Previous
          </button>
          <button className="slider-button next" onClick={goToNext}>
            Next
          </button>
        </div>
      </div>
      <div className="ad-content">
        {user.name ? (
          <h1>Just For You {user.name}</h1>
        ) : (
          <h1>Sign Up To Join Petflix World</h1>
        )}
        <h2>Find Your Furry Friend Today!</h2>
        <p>Discover the latest adorable animals looking for loving homes.</p>
        <p>Browse our selection and find your perfect companion!</p>
        <button className="ad-button" onClick={handleButtonClick}>
          Discover All Pets
        </button>
      </div>
    </div>
  );
});

export default AnimalAd;