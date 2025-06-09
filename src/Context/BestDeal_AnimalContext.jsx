import React, { useState, useEffect } from 'react';
import '../Components/BestDeals/BestDeal.css';
import Popup from '../Components/Popup/Popup.jsx'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import ConnectionLost from '../Pages.jsx/ConnectionLost.jsx';
import axios from 'axios';

const BestDeal = () => {
  const [bestItem, setBestItem] = useState(null);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInCart, setIsInCart] = useState(false); // New state for cart status
  const [errorMessage, setErrorMessage] = useState(''); // For feedback messages

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const userId = loggedInUser?.userId;

  useEffect(() => {
    fetch('https://petflix-backend-620z.onrender.com/api/Animals')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch animal data');
        return response.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          const bestDealAnimal = data[3];
          setBestItem(bestDealAnimal);

          if (bestDealAnimal.userId) {
            fetch(`https://petflix-backend-620z.onrender.com/api/User/${bestDealAnimal.userId}`)
              .then(response => {
                if (!response.ok) throw new Error('Failed to fetch user data');
                return response.json();
              })
              .then(userData => {
                setUser(userData);
                setLoading(false);
              })
              .catch(error => {
                console.error('Error fetching user data:', error);
                setError(error.message);
                setLoading(false);
              });

            if (userId) {
              axios.get(`https://petflix-backend-620z.onrender.com/api/Favorite/${userId}`)
                .then(response => {
                  const favorites = response.data;
                  const isFav = favorites.some(fav => fav.itemId === bestDealAnimal.animal_id);
                  setIsFavorite(isFav);
                })
                .catch(error => console.error('Error checking favorites:', error));

              // Fetch cart status
              fetchCartStatus(userId, bestDealAnimal.animal_id, 'Animal');
            }
          } else {
            setError('Invalid or missing userId in animal data');
            setLoading(false);
          }
        } else {
          setError('No animals available');
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching animal data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [userId]);

  const fetchCartStatus = async (userId, itemId, itemType) => {
    try {
      const response = await axios.get(`https://petflix-backend-620z.onrender.com/api/Carts/${userId}`, {
        headers: { 'Authorization': `Bearer ${loggedInUser?.token}` }
      });
      const cartItems = response.data.cartItems || [];
      const isItemInCart = cartItems.some((item) => 
        item.itemId === itemId && item.itemType === itemType
      );
      setIsInCart(isItemInCart);
    } catch (error) {
      console.error('Error fetching cart status:', error);
      setErrorMessage('Failed to load cart status.');
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

  const toggleFavorite = async () => {
    if (!userId) {
      setErrorMessage('Please log in to manage favorites.');
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }

    const itemId = bestItem.animal_id;
    try {
      const response = await axios.get(`https://petflix-backend-620z.onrender.com/api/Favorite/${userId}`);
      const favorites = response.data;
      const existingFav = favorites.find(fav => fav.itemId === itemId);

      if (isFavorite && existingFav) {
        await axios.delete(`https://petflix-backend-620z.onrender.com/api/Favorite?userId=${userId}&itemId=${itemId}`, {
          headers: { 'Authorization': `Bearer ${loggedInUser.token}` }
        });
        setIsFavorite(false);
        setErrorMessage('Item removed from favorites.');
      } else if (!isFavorite && !existingFav) {
        const payload = { userId, itemId, animalId: itemId };
        await axios.post('https://petflix-backend-620z.onrender.com/api/Favorite', payload, {
          headers: { 'Authorization': `Bearer ${loggedInUser.token}` }
        });
        setIsFavorite(true);
        setErrorMessage('Item added to favorites.');
      } else {
        setErrorMessage(`Item is already ${isFavorite ? 'in' : 'not in'} favorites.`);
      }
      setTimeout(() => setErrorMessage(''), 3500);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setErrorMessage(`Failed to update favorites: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

  const addToCart = async (itemId, quantity) => {
    if (!loggedInUser) {
      setErrorMessage("Please log in to add items to your cart.");
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }

    if (!itemId || itemId === 0 || !quantity || quantity <= 0) {
      setErrorMessage("Invalid item ID or quantity.");
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }

    const payload = { itemId, quantity, itemType: 'Animal' };
    try {
      await axios.post(
        `https://petflix-backend-620z.onrender.com/api/Carts/${loggedInUser.userId}/items`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${loggedInUser.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setIsInCart(true);
      setErrorMessage("Item added to cart successfully!");
      setTimeout(() => setErrorMessage(''), 3500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setErrorMessage(`Failed to add item to cart: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!loggedInUser) {
      setErrorMessage("Please log in to remove items from your cart.");
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }

    try {
      const cartResponse = await axios.get(`https://petflix-backend-620z.onrender.com/api/Carts/${loggedInUser.userId}`, {
        headers: { 'Authorization': `Bearer ${loggedInUser.token}` }
      });
      const cartItems = cartResponse.data.cartItems || [];
      const cartItem = cartItems.find((item) => item.itemId === itemId && item.itemType === 'Animal');

      if (!cartItem) {
        setErrorMessage("Item not found in cart.");
        setTimeout(() => setErrorMessage(''), 3500);
        return;
      }

      await axios.delete(`https://petflix-backend-620z.onrender.com/api/Carts/${loggedInUser.userId}/items/${cartItem.cartItemId}`, {
        headers: { 'Authorization': `Bearer ${loggedInUser.token}` }
      });
      setIsInCart(false);
      setErrorMessage("Item removed from cart successfully!");
      setTimeout(() => setErrorMessage(''), 3500);
    } catch (error) {
      console.error("Error removing from cart:", error);
      setErrorMessage(`Failed to remove item from cart: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };


  const openPopup = () => {
    setIsPopupOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    document.body.style.overflow = '';
  };

  if (loading) {
    return (
      <div className='popular'>
        <h1 className='popular-h1'>BEST DEAL NOW ON ANIMALS</h1>
        <hr />
     <div className="clinics-loading">Loading Animals ...</div>
     </div>
    )
  }
  
  if (error || !bestItem || !user) {
    return (
      <div>
        <div className='error-message2'>{error || 'Loading Animals ...'}</div>
        <ConnectionLost />
      </div>
    );
  }

  return (
    <div className="best-deal">
      <div className="cover-section">
        <div className="deal-details">
          <h1 className="deal-heading">BEST DEAL NOW ON ANIMALS</h1>
          <hr className='best-deal-hr' />
        </div>
        <div className="image-container">
          <img src={bestItem.animal_pic} alt={bestItem.animal_title} className="cover-image2" />
          <button
            className={`favorite-btn-best-deal ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
          >
            <FontAwesomeIcon
              icon={faHeart}
              style={{ color: 'white', fontSize: '1.28rem' }}
            />
            {isFavorite ? ' Remove Favorite' : ' Add to Favorite'}
          </button>

          

          <div className="overlay">
            <h1>{bestItem.animal_title}</h1>
            <p>{bestItem.animal_description}</p>
            <strong>New Price :</strong> ${bestItem.animal_new_price} <span className="old-price">${bestItem.animal_old_price}</span>
          </div>
          <button className="buy-now" onClick={openPopup}>
            Buy Now
          </button>
        </div>
      </div>

      {errorMessage && (
  <div className={`message ${errorMessage === 'Please log in to manage favorites.' ? 'error-message3' : 'success2-message'}`}>
    {errorMessage}
  </div>
)}

      {isPopupOpen && (
        <Popup
          image={bestItem.animal_pic}
          name={bestItem.animal_title}
          new_price={bestItem.animal_new_price}
          old_price={bestItem.animal_old_price}
          
          toggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          description={bestItem.animal_description}
          ownerName={user.name}
          ownerContact={user.email}
          ownerDelivery={user.delivery_method}
          ownerLocation={user.location}
          ownerPhone={user.phone}
          category={bestItem.animal_category}
          type={bestItem.animal_type}
          gender={bestItem.gender}
          age={bestItem.age}
          weight={bestItem.animal_weight}
          healthStatus={bestItem.health_status}
          vaccinated={bestItem.vaccineStatus}
          closePopup={closePopup}
          itemId={bestItem.animal_id}
          itemType="Animal" // Pass itemType
          addToCart={addToCart} // Pass addToCart function
          removeFromCart={removeFromCart} // Pass removeFromCart function
          isInCart={isInCart} // Pass cart status
        />
      )}
    </div>
  );
};

export default BestDeal;