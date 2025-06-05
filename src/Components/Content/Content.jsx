import React, { useState, useEffect } from 'react';
import './Content.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowRight } from '@fortawesome/free-solid-svg-icons';
import Logo2 from '../Assets/LatestPetflixLogo.png';
import AdCover1 from '../Assets/AdCover1.jpg';
import AdCover3 from '../Assets/AdCover3.jpg';
import AdCover4 from '../Assets/AdCover4.jpg';
import AdCover5 from '../Assets/AdCover5.jpg';
import AdCover6 from '../Assets/AdCover6.jpg';

const Hero = ({ user, onPopularClick, onPopular2Click }) => {
  const welcomeMessage = user && user.name ? `${user.name} !` : " To Petflix";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const images = [AdCover3, AdCover5, AdCover1, AdCover4];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setAnimate(false);
      if (!user) setLoading(false); // Only set loading to false if no user
    }, 1000);

    const intervalId = setInterval(() => {
      goToNext();
    }, 10000);

    setAnimate(true);
    if (!user) setLoading(true); // Only set loading to true if no user

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [currentImageIndex, user]); // Add user as dependency

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div
      className={`hero ${animate ? 'fade-in-right' : ' '}`}
      style={{
        backgroundImage: (!loading || user) ? `url(${images[currentImageIndex]})` : 'none',
        backgroundColor: (!loading || user) ? 'transparent' : '#f0f0f0',
      }}
    >
      <div className="hero-content-container">
        {/*
        <div className="welcome-container">
        <h2>
          {user && user.name ? (
            <>
              Welcome back , <span className="username-welcome">{user.name.split(' ')[0]} !</span>
            </>
          ) : (
            <>
              Welcome <span className="username-welcome">To Petflix</span>
            </>
          )}
        </h2>
        </div>
        */}
        <div className="sales-info-container">
          <p>New Sales
          On <img className="logo2-image" src={Logo2} alt="Logo2"/> {user && user.name ? `For You ${user.name.split(' ')[0]}` : <><br />For New Arrivals</>}</p>
        </div>
        <div className="welcome-container">
        <p className='p3'>Discover the latest products and animals on <span style={{fontWeight:'1000'}}>PETFLIX</span></p>
        <p className='p2'>Explore our wide range of cat food, toys, and accessories. Keep your kitty happy and healthy</p>
        </div>
      </div>
      <div className="hero-latest-buttons">
        <div className="hero-latest-btn" onClick={onPopularClick}>
          <div>Most Popular In Pets</div>
          <FontAwesomeIcon icon={faCircleArrowRight} size="xl" className="arrow-icon" />
        </div>
        <div className="hero-latest-btn" onClick={onPopular2Click}>
          <div>Most Popular In Products</div>
          <FontAwesomeIcon icon={faCircleArrowRight} size="xl" className="arrow-icon" />
        </div>
      </div>
    </div>
  );
};

export default Hero;