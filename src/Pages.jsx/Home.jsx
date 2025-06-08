import React, { useRef, useState, useEffect, Suspense, lazy, memo } from 'react';
import AnimalAd from '../Components/Ads.jsx/AnimalAd';
import ProductAd from '../Components/Ads.jsx/ProductAd';
import See from '../Components/Ads.jsx/See';
import BestClinics from '../Components/BestClinics/BestClinics';
import BestUsers from '../Components/BestClinics/BestUsers';
import Footer from '../Components/Footer/Footer';

// Lazy-loaded components
const Content = lazy(() => import('../Components/Content/Content'));
const Animals_Popular = lazy(() => import('../Components/Popular/Animals_Popular'));
const Products_Popular = lazy(() => import('../Components/Popular/Products_Popular'));
const BestDealInAnimals = lazy(() => import('../Components/BestDeals/BestDealInAnimals'));
const BestDealInProducts = lazy(() => import('../Components/BestDeals/BestDealInProducts'));
const HeroSplash = lazy(() => import('../Components/CoverPages/HeroSplash'));

const Home = () => {
  const popularRef = useRef(null);
  const popular2Ref = useRef(null);
  const animalAdRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!loggedInUser) {
          setUser(null);
          return;
        }
        const response = await fetch(`https://petflix-backend-620z.onrender.com/api/User/${loggedInUser.userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const scrollToPopular = () => {
    popularRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPopular2 = () => {
    popular2Ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAnimalAd = () => {
    animalAdRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  if (loading) return <div></div>;
  if (error) return <div>Error fetching user data: {error}</div>;

  return (
    <>
      <div>
        <Suspense fallback={<div></div>}>
          <HeroSplash user={user} onExploreClick={scrollToAnimalAd} />
        </Suspense>
        <Suspense fallback={<div></div>}>
          <Content user={user} onPopularClick={scrollToPopular} onPopular2Click={scrollToPopular2}/>
        </Suspense>
        <BestUsers/>
        <AnimalAd ref={animalAdRef}/>
        <BestClinics />
        <See/>
        <Suspense fallback={<div>Loading Deals...</div>}>
          <BestDealInAnimals />
        </Suspense>
        <Suspense fallback={<div>Loading Popular Animals...</div>}>
          <Animals_Popular ref={popularRef} />
        </Suspense>
        <Suspense fallback={<div>Loading Deals...</div>}>
          <BestDealInProducts />
        </Suspense>
        <ProductAd/>
        <Suspense fallback={<div>Loading Popular Products...</div>}>
          <Products_Popular ref={popular2Ref} />
        </Suspense>
      </div>
      <Footer />
    </>
  );
};

export default Home;