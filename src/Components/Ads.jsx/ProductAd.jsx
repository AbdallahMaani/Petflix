import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Ads.jsx/Ad.css';
import coverImage from '../Assets/DryCat.avif';
import productAd4 from '../Assets/prodctAd2.jpg';
import productAd3 from '../Assets/ProductAd3.jpg';
import productAd2 from '../Assets/ProductAd4.webp';

const ProductAd = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const intervalRef = useRef(null);
  const SLIDE_INTERVAL = 5000;
  const images = [coverImage, productAd2, productAd3, productAd4];

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
    window.scrollTo(0, 0);
    navigate('/products');
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
    <div className="animal-ad">
      <h1 style={{ textAlign: 'center', margin: '2rem auto' }} className='popular-h1'>Check Our Latest Pets Products</h1>
      <div className="image-slider">
        <img
          src={images[currentImageIndex]}
          alt="Product Ad"
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
        <h1>Healthy Products for Your Feline Friend!</h1>
        <h2>Find The Best Products For Your Lovely Pet!</h2>
        <p>Explore our wide range of cat food, toys, and accessories. Keep your kitty happy and healthy!</p>
        <button className="ad-button" onClick={handleButtonClick}>
          Discover All Products
        </button>
      </div>
    </div>
  );
};

export default ProductAd;