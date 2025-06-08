import React, { useState, useEffect, useRef } from 'react';
import AnimalsContext from '../Context/AnimalsContext.jsx';
import BestDeal from '../Context/BestDeal_AnimalContext.jsx';
import MadeForYouAnimal from '../Context/MadeForYouAnimal.jsx';
import AddAnimal from '../Components/AddItems/AddAnimal.jsx';
import AnimalAd from '../Components/Ads.jsx/AnimalAd.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import NoAccount from './NoAccount.jsx'; // Import NoAccount component
import Footer from '../Components/Footer/Footer.jsx';

export const Animals = () => {
  const [animalData, setAnimalData] = useState([]);
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const animalsContextRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://petflix-backend-620z.onrender.com/api/Animals');
        if (!response.ok) {
          throw new Error('Failed to fetch animal data');
        }
        const data = await response.json();
        setAnimalData(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchData();

    // Check if the user is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollBottom = documentHeight - (scrollTop + windowHeight);

      setShowFloatingButton(scrollBottom > 180);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToAnimalsContext = () => {
    animalsContextRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="animals-container">
        <AnimalAd scrollToAnimals={scrollToAnimalsContext} />
        <BestDeal />
        <MadeForYouAnimal />

        {showAddAnimal && (
          <div className="popup-overlay">
            <div className="popup-content">
            <button className="close-btn" onClick={() => setShowAddAnimal(false)}>
              <FontAwesomeIcon icon={faCircleXmark} size="xl" style={{ color: "#ffffff" }} />
            </button>
              {isLoggedIn ? <AddAnimal /> : <NoAccount />} {/* Conditionally render AddAnimal or NoAccount */}
            </div>
          </div>
        )}

        <AnimalsContext data={animalData} ref={animalsContextRef} />
        {showFloatingButton && (
          <button className="floating-button" onClick={() => setShowAddAnimal(true)}>
            <FontAwesomeIcon icon={faCirclePlus} size="2xl" style={{ color: "#ffffff", marginRight: '8px' }} /> {/* Add margin */}
            Add Your Animal
          </button>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Animals;