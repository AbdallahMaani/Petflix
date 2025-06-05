import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CoverPage.css';

// Updated vertical-oriented images from Unsplash
const petImages = {
  girlAndDog: 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dmVydGljYWwlMjBkb2clMjB3aXRoJTIwb3duZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
  redDog: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2F0fGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60',
  horse: 'https://images.unsplash.com/photo-1553284965-e2815db2e5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG9yc2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
  fish: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmlzaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60',
  bird: 'https://images.unsplash.com/photo-1551085254-e96b210db58a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmlyZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60'
};

// CoverPage Component
const CoverPage = ({ image, title, description, links, buttonText, buttonLink, className, index }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  const handleButtonClick = () => {
    navigate(buttonLink);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div 
      ref={ref}
      className={`${className} cover-container ${isVisible ? 'visible' : ''}`}
    >
      <div className="cover-image-container">
        <img 
          src={image} 
          alt="Cover" 
          className={`cover-image ${isVisible ? 'visible' : ''}`}
          loading="lazy" // Add lazy loading
        />
        <div className="cover-gradient-overlay" />
      </div>
      
      <div className="cover-content">
        <div className={`cover-text ${isVisible ? 'visible' : ''}`}>
          <div className={`index-badge ${isVisible ? 'visible' : ''}`}>
            {index + 1}
          </div>
          
          <h1 className={`cover-title ${isVisible ? 'visible' : ''}`}>
            {title}
          </h1>
          
          <hr className={`hr-cover ${isVisible ? 'visible' : ''}`} />
          
          <p className={`cover-description ${isVisible ? 'visible' : ''}`}>
            {description}
            {links.map((link, index) => (
              <a 
                key={index} 
                className='custom-link' 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <br />
                {link.text}
              </a>
            ))}
          </p>
          
          <div className={`cover-buttons ${isVisible ? 'visible' : ''}`}>
            <button 
              className="cover-button"
              onClick={handleButtonClick}
            >
              {buttonText}
              <span className="button-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// CoverPages Component
const CoverPages = () => {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const headerRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFooterVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (headerRef.current) headerObserver.observe(headerRef.current);
    if (footerRef.current) footerObserver.observe(footerRef.current);

    return () => {
      if (headerRef.current) headerObserver.unobserve(headerRef.current);
      if (footerRef.current) footerObserver.unobserve(footerRef.current);
    };
  }, []);

  const coverPagesData = [
    {
      image: petImages.girlAndDog,
      title: 'How Pets Transform Your Life',
      description: `Pets don't just share our homes they transform our lives. Scientific studies show that pet owners experience reduced stress levels, lower blood pressure, and increased physical activity. The unconditional love from a pet can combat loneliness and depression, while the responsibility of pet care adds structure and purpose to daily routines.`,
      links: [
        { url: 'https://www.helpguide.org/articles/mental-health/mood-boosting-power-of-dogs.htm', text: 'Read the Harvard study on pets and mental health' }
      ],
      buttonText: 'Explore Benefits',
      buttonLink: '/petGuide',
      className: 'cover-page'
    },
    {
      image: petImages.redDog,
      title: 'Finding Your Perfect Dog Companion',
      description: `Choosing a dog is a deeply personal decision that should align with your lifestyle. Our comprehensive matching system evaluates your living space, activity level, and preferences to recommend the ideal companion. From energetic breeds that thrive in active households to calmer dogs perfect for apartments.`,
      links: [
        { url: 'https://www.aspca.org/pet-care/general-pet-care/choosing-right-pet-you', text: 'ASPCA guide to pet selection' }
      ],
      buttonText: 'Take Our Quiz',
      buttonLink: '/petGuide',
      className: 'cover-page'
    },
    {
      image: petImages.cat,
      title: 'Feline Wellness & Care',
      description: `Cats have unique nutritional and behavioral needs. Our feline specialists explain how to create an enriching environment, recognize signs of stress, and choose foods that support urinary health, weight management, and coat condition. Learn why puzzle feeders and vertical spaces are essential for indoor cats.`,
      links: [
        { url: 'https://icatcare.org/advice/', text: 'International Cat Care advice' }
      ],
      buttonText: 'Cat Care Resources',
      buttonLink: '/petGuide',
      className: 'cover-page'
    },
    {
      image: petImages.horse,
      title: 'Equine Care & Training',
      description: `Horses require specialized care and understanding. Whether you're a first-time owner or experienced equestrian, our guides cover everything from proper nutrition and hoof care to training techniques and stable management for these majestic animals.`,
      links: [
        { url: 'https://thehorse.com/', text: 'The Horse - Equine Health Resources' }
      ],
      buttonText: 'Learn About Horses',
      buttonLink: '/petGuide',
      className: 'cover-page'
    },
    {
      image: petImages.fish,
      title: 'Aquarium Care Essentials',
      description: `Creating a healthy aquatic environment requires knowledge of water chemistry, filtration, and species compatibility. Our aquarium experts explain how to set up and maintain beautiful tanks for freshwater and saltwater fish, ensuring their health and vibrant colors.`,
      links: [
        { url: 'https://www.fishkeepingworld.com/', text: 'Fishkeeping World Resources' }
      ],
      buttonText: 'Aquarium Guides',
      buttonLink: '/petGuide',
      className: 'cover-page'
    },
    {
      image: petImages.bird,
      title: 'Avian Care & Enrichment',
      description: `Birds are intelligent creatures requiring mental stimulation and proper nutrition. Learn about cage setup, dietary needs, and behavioral enrichment for parrots, canaries, and other feathered companions to ensure their long-term health and happiness.`,
      links: [
        { url: 'https://lafeber.com/pet-birds/', text: 'Lafeber Company Bird Resources' }
      ],
      buttonText: 'Bird Care Tips',
      buttonLink: '/petGuide',
      className: 'cover-page'
    }
  ];

  return (
    <div className="cover-pages-container">
      <div 
        ref={headerRef}
        className={`cover-header ${headerVisible ? 'visible' : ''}`}
      >
        <h1>Paws, Hooves & Wings: Your Complete Pet Guide</h1>
        <p>Expert-curated resources for every type of pet owner</p>
      </div>
      
      <div className="cover-pages-grid">
        {coverPagesData.map((page, index) => (
          <CoverPage
            key={index}
            index={index}
            image={page.image}
            title={page.title}
            description={page.description}
            links={page.links}
            buttonText={page.buttonText}
            buttonLink={page.buttonLink}
            className={page.className}
          />
        ))}
      </div>
      
      <div 
        ref={footerRef}
        className={`cover-footer ${footerVisible ? 'visible' : ''}`}
      >
        <p>Join our community of pet lovers for exclusive content and expert advice</p>
        <button>Subscribe Now</button>
      </div>
    </div>
  );
};

export default CoverPages;