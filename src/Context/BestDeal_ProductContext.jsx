import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import Popup from '../Components/Popup/Popup.jsx';
import '../Components/BestDeals/BestDeal.css';
import axios from 'axios';

const BestDeal = () => {
  const [bestItem, setBestItem] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState(5);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isInCart, setIsInCart] = useState(false); // New state for cart status
  const [errorMessage, setErrorMessage] = useState(''); // For feedback messages
  const [loading, setLoading] = useState(true);

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const userId = loggedInUser?.userId;

  useEffect(() => {
    const fetchBestProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://petflix-backend-620z.onrender.com/api/Products');
        const products = response.data;
        const bestProduct = products.length > 0 ? products[31] : null;
        setBestItem(bestProduct);

        if (bestProduct && userId) {
          const favResponse = await axios.get(`https://petflix-backend-620z.onrender.com/api/Favorite/${userId}`);
          const favorites = favResponse.data;
          const isFav = favorites.some(fav => fav.itemId === bestProduct.product_id);
          setIsFavorite(isFav);

          // Fetch cart status
          fetchCartStatus(userId, bestProduct.product_id, 'Product');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setErrorMessage(`Failed to load product: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBestProduct();
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

    const itemId = bestItem.product_id;
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
        const payload = { userId, itemId, productId: itemId };
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

    const payload = { itemId, quantity, itemType: 'Product' };
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
      const cartItem = cartItems.find((item) => item.itemId === itemId && item.itemType === 'Product');

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

  const handleRating = (star) => {
    setRating(star);
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
        <h1 className='popular-h1'>BEST DEAL NOW ON PRODUCTS</h1>
        <hr />
        <div className="clinics-loading">Loading Products ...</div>
      </div>
    );
  }

  if (!bestItem) {
    return (
      <div className='popular'>
        <h1 className='popular-h1'>BEST DEAL NOW ON PRODUCTS</h1>
        <hr />
        <div className="clinics-loading">No products available.</div>
      </div>
    );
  }

  return (
    <div className="best-deal">
      <div className="cover-section">
        <div className="deal-details">
          <h1 className="deal-heading">BEST DEAL NOW ON PRODUCTS</h1>
          <hr className='best-deal-hr' />
        </div>
        <div className="image-container">
          <img src={bestItem.product_pic} alt={bestItem.product_title} className="cover-image2" />
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

          <div className="item-rating-best-deal">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star-best-deal ${star <= rating ? 'filled' : ''}`}
                onClick={() => handleRating(star)}
              >
                ★
              </span>
            ))}
          </div>

          <div className="overlay">
            <h1>{bestItem.product_title}</h1>
            <p>{bestItem.product_description}</p>
            <strong>New Price:</strong> {bestItem.product_new_price} JD <span className="old-price">{bestItem.product_old_price} JD</span>
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
          image={bestItem.product_pic}
          name={bestItem.product_title}
          new_price={bestItem.product_new_price}
          old_price={bestItem.product_old_price}
          rating={rating}
          handleRating={handleRating}
          toggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          description={bestItem.product_description}
          ownerName={bestItem.user?.name}
          ownerContact={bestItem.user?.email}
          ownerLocation={bestItem.user?.location}
          ownerPhone={bestItem.user?.phone}
          ownerDelivery={bestItem.user?.delivery_method}
          category={bestItem.product_category}
          type={bestItem.product_type}
          closePopup={closePopup}
          itemId={bestItem.product_id}
          itemType="Product" // Pass itemType
          addToCart={addToCart} // Pass addToCart function
          removeFromCart={removeFromCart} // Pass removeFromCart function
          isInCart={isInCart} // Pass cart status
        />
      )}
    </div>
  );
};

export default BestDeal;