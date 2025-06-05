import React, { useState, useEffect, useRef, useCallback } from 'react';
import './HeroSplash.css';
import Logo2 from '../Assets/LatestPetflixLogo.png';

// Import local images
import CatSplash from '../Assets/CatSplash.jpg';
import HorseSplash from '../Assets/HorseSplash.jpg';
import BirdSplash from '../Assets/BirdSplashHorseSpalsh.jpg';
import FishSplash from '../Assets/FishSpalsh.jpg';
import Dog2Splash from '../Assets/Dog2Splash.jpg';

const slidesData = [
  {
    image: CatSplash,
    title: "Feline Paradise",
    description: "Everything your cat needs for a perfect life."
  },
  {
    image: Dog2Splash,
    title: "All Dogs Welcome",
    description: "We cater to all your dogs' needs, no matter the breed."
  },
  {
    image: HorseSplash,
    title: "Equestrian Excellence",
    description: "Premium care for your noble equine companions."
  },
  {
    image: BirdSplash,
    title: "Avian Adventures",
    description: "Let your birds soar with our specialized products."
  },
  {
    image: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    title: "Happy Pets, Happy Life",
    description: "Bring joy to your furry friends with our premium pet care products."
  },
  {
    image: FishSplash,
    title: "Aquatic Wonders",
    description: "Create an underwater paradise for your fish friends."
  }
];

const HeroSplash = ({ user, onExploreClick }) => {
  const [hovered2, setHovered2] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('right');
  const intervalRef = useRef(null);
  const SLIDE_INTERVAL = 7000; // 7 seconds
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setSlideDirection('right');
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL);
  }, [slides.length]);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        // Preload images
        const imagePromises = slidesData.map(slide => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = slide.image;
            img.onload = () => resolve(slide);
            img.onerror = () => {
              console.error(`Failed to load image: ${slide.image}`);
              resolve(slide); // Resolve even on error to not block other images
            };
          });
        });

        await Promise.all(imagePromises);

        // Simulate loading time (replace with actual image loading if needed)
        // await new Promise(resolve => setTimeout(resolve, 500));

        // Set the slides after "loading"
        setSlides(slidesData);
        setLoading(false);
        setImageLoaded(true); // Set imageLoaded to true after images are preloaded
      } catch (error) {
        console.error("Error loading slides:", error);
        setLoading(false);
      }
    };

    loadSlides();
  }, []);

  useEffect(() => {
    setIsVisible2(true);
    if (!loading && imageLoaded) {
      startInterval();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loading, startInterval, imageLoaded]);

  const goToSlide = useCallback((direction) => {
    setSlideDirection(direction);
    if (direction === 'right') {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
    startInterval();
  }, [slides.length, startInterval]);

  const nextSlide = useCallback(() => goToSlide('right'), [goToSlide]);
  const prevSlide = useCallback(() => goToSlide('left'), [goToSlide]);

  

  return (
    <div className={`hero-container2 ${isVisible2 ? 'visible2' : ''}`}>
      <div className="hero-content2">
        <div className="hero-media2">
          <div className="media-wrapper2">
            <div 
              className={`slide-container ${slideDirection} ${imageLoaded ? 'image-loaded' : ''}`}
              key={currentSlide}
            >
              <img
                src={slides[currentSlide].image}
                alt="Happy pet"
                className="hero-image2"
              />
              <div className="media-overlay2"></div>
              <div className="slide-text-overlay">
                <h2>{slides[currentSlide].title}</h2>
                <p>{slides[currentSlide].description}</p>
              </div>
            </div>
            <button className="slide-nav-button prev" onClick={prevSlide}>
              &lt;
            </button>
            <button className="slide-nav-button next" onClick={nextSlide}>
              &gt;
            </button>
          </div>
        </div>

        <div className="hero-text2">
          <h1 className="hero-title2">
            {user && user.name ? (
              <>
                <span className="title-line2">Welcome back,</span>
                <span className="title-line2 username-welcome2">
                  {user.name.split(' ')[0]} !
                  {user.profilePic && ( <img src={user.profilePic} alt="Profile" className="profile-pic-wlc" style={{ margin: '0rem 1rem' }} /> )}
                </span>     
                </>
                ) : (
                <>
                  <span className="title-line2">Welcome</span>
                  <span className="title-line2 username-welcome2">To Petflix !</span>
                </>
                )}

          </h1>
          <p className="hero-description2">
            Discover our exceptional products and services designed to keep your pets healthy, happy, and thriving.
          </p>
          <button
            className={`hero-button2 ${hovered2 ? 'hovered2' : ''}`}
            onMouseEnter={() => setHovered2(true)}
            onMouseLeave={() => setHovered2(false)}
            onClick={onExploreClick}
          >
            Explore Petflix Now
            <span className="button-arrow2">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSplash;