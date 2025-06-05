import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginSignup from './Pages.jsx/LoginSignup';
import Home from './Pages.jsx/Home';
import Animals from './Pages.jsx/Animals';
import Product from './Pages.jsx/Product';
import Cart from './Pages.jsx/Cart';
import Myprofile from './Pages.jsx/Myprofile';
import Layout from './Components/Navbar/Layout';
import About from './Pages.jsx/About';
import PetGuide from './Pages.jsx/PetGuide.jsx';
import ChatBot from './Components/ChatBot/ChatBot.jsx';
import './Pages.css/Global.css';
import NoAccount from './Pages.jsx/NoAccount';
import ConnectionLost from './Pages.jsx/ConnectionLost.jsx';
import ForgotPassword from './Pages.jsx/ForgotPassword';
import Report from './Pages.jsx/Report.jsx';
import HeroSplash from './Components/CoverPages/HeroSplash.jsx';
import AnimalAd from './Components/Ads.jsx/AnimalAd.jsx';
import FeedbackButton from './Components/FeedBack/FeedBackButton.jsx';
import FeedbackPage from './Components/FeedBack/FeedBackPage.jsx';
import OrdersPage from './Components/Checkout/OrdersPage.jsx';
import Payment from './Components/Checkout/Payment.jsx';
import AdminHome from './Components/AdminDashboard/Home.jsx';
import './Components/AdminDashboard/Dashboard.css';
import AdminLogin from './Components/AdminDashboard/AdminLogin.jsx';

function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

function App() {
  const navigate = useNavigate();
  const isOnline = useConnectionStatus();
  const [showFeedback, setShowFeedback] = useState(true);
  const [users, setUsers] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [products, setProducts] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [animalReviews, setAnimalReviews] = useState([]);
  const [productReviews, setProductReviews] = useState([]);
  const [carts, setCarts] = useState({});
  const [orders, setOrders] = useState({});
  const [error, setError] = useState(null);

  // Fetch data for admin dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, animalsRes, productsRes, feedbacksRes, animalReviewsRes, productReviewsRes] = await Promise.all([
          axios.get('‏https://localhost:7007/api/User'),
          axios.get('‏https://localhost:7007/api/Animals'),
          axios.get('‏https://localhost:7007/api/Products'),
          axios.get('‏https://localhost:7007/api/Feedback'),
          axios.get('‏https://localhost:7007/api/AR_'),
          axios.get('‏https://localhost:7007/api/PR_'),
        ]);
        
        setUsers(usersRes.data);
        setAnimals(animalsRes.data);
        setProducts(productsRes.data);
        setFeedbacks(feedbacksRes.data);
        setAnimalReviews(animalReviewsRes.data);
        setProductReviews(productReviewsRes.data);

        // Fetch carts and orders for each user
        const cartsData = {};
        const ordersData = {};
        for (const user of usersRes.data) {
          try {
            const cartRes = await axios.get(`‏https://localhost:7007/api/Carts/${user.userId}`);
            cartsData[user.userId] = cartRes.data || null;
          } catch (cartErr) {
            cartsData[user.userId] = null;
          }
          const ordersRes = await axios.get(`‏https://localhost:7007/api/Order/user/${user.userId}`);
          ordersData[user.userId] = ordersRes.data || [];
        }
        setCarts(cartsData);
        setOrders(ordersData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchData();
  }, []);

  // Handle delete operations
  const handleDelete = async (type, id) => {
    try {
      await axios.delete(`‏https://localhost:7007/api/${type}/${id}`);
      if (type === 'User') {
        setUsers(users.filter(user => user.userId !== id));
        setCarts(prev => {
          const newCarts = { ...prev };
          delete newCarts[id];
          return newCarts;
        });
        setOrders(prev => {
          const newOrders = { ...prev };
          delete newOrders[id];
          return newOrders;
        });
      }
      if (type === 'Animals') setAnimals(animals.filter(animal => animal.animal_id !== id));
      if (type === 'Products') setProducts(products.filter(product => product.product_id !== id));
      setError(null);
    } catch (err) {
      setError(`Failed to delete ${type}: ` + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteReview = async (type, reviewId) => {
    try {
      await axios.delete(`‏https://localhost:7007/api/${type}/${reviewId}`);
      if (type === 'AR_') setAnimalReviews(animalReviews.filter(review => review.animalReviewId !== reviewId));
      if (type === 'PR_') setProductReviews(productReviews.filter(review => review.productReviewId !== reviewId));
      setError(null);
    } catch (err) {
      setError(`Failed to delete ${type} review: ` + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCart = async (userId, cartId) => {
    try {
      await axios.delete(`‏https://localhost:7007/api/Carts/${cartId}`);
      setCarts(prev => ({
        ...prev,
        [userId]: null,
      }));
      setError(null);
    } catch (err) {
      setError(`Failed to delete cart: ` + (err.response?.data?.message || err.message));
    }
  };

  // Handle connection status
  useEffect(() => {
    if (!isOnline && window.location.pathname !== '/login' && !window.location.pathname.startsWith('/admin')) {
      navigate('/connectionlost');
    }
  }, [isOnline, navigate]);

  // Hide feedback button on certain pages
  useEffect(() => {
    const hideOnPages = ['/login', '/forgot-password', '/connectionlost', '/hero', '/admin'];
    setShowFeedback(!hideOnPages.includes(window.location.pathname));
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/petGuide" element={<PetGuide />} />
          <Route path="/" element={<Home />} />
          <Route path="/animals" element={<Animals />} />
          <Route path="/products" element={<Product />}>
            <Route path=":productId" element={<Product />} />
          </Route>
          <Route path="/cart" element={<Cart />} />
          <Route path="/myprofile" element={<Myprofile />} />
          <Route path="/report" element={<Report />} />
          <Route path="/about" element={<About />} />
          <Route path="/noaccount" element={<NoAccount />} />
          <Route path="/connectionlost" element={<ConnectionLost />} />
          <Route path="/hero" element={<HeroSplash />} />
          <Route path="/animalad" element={<AnimalAd />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/orderspage" element={<OrdersPage />} />
          <Route path="/payment" element={<Payment />} />
        </Route>

        {/* Admin Dashboard - Single Route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminHome 
            users={users}
            animals={animals}
            products={products}
            feedbacks={feedbacks}
            setFeedbacks={setFeedbacks}
            animalReviews={animalReviews}
            productReviews={productReviews}
            carts={carts}
            orders={orders}
            onDelete={handleDelete}
            onDeleteReview={handleDeleteReview}
            onDeleteCart={handleDeleteCart}
          />
        } />

        <Route path="/login" element={<LoginSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>

      <ChatBot />
      {showFeedback && <FeedbackButton />}
    </>
  );
}

export default App;