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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const images = [AdCover3, AdCover5, AdCover1, AdCover4];

  useEffect(() => {
    setAnimate(true);
    const timeoutId = setTimeout(() => setAnimate(false), 2250);

    const intervalId = setInterval(() => {
      goToNext();
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [currentImageIndex]);

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div
      className={`hero ${animate ? 'fade-in-right' : ''}`}
      style={{
        backgroundImage: `url(${images[currentImageIndex]})`,
        backgroundColor: 'transparent',
      }}
    >
      <div className="hero-content-container">
        <div className="sales-info-container">
          <p>
            New Sales On <img className="logo2-image" src={Logo2} alt="Logo2" />{' '}
            {user && user.name
              ? `For You ${user.name.split(' ')[0]}`
              : (
                <>
                  <br />
                  For New Arrivals
                </>
              )}
          </p>
        </div>
        <div className="welcome-container">
          <p className='p3'>
            Discover the latest products and animals on <span style={{ fontWeight: '1000' }}>PETFLIX</span>
          </p>
          <p className='p2'>
            Explore our wide range of cat food, toys, and accessories. Keep your kitty happy and healthy
          </p>
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