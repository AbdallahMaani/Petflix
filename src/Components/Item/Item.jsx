import React, { useState, useEffect, useCallback, memo } from 'react';
import './Item.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import Popup from '../Popup/Popup.jsx';
import axios from 'axios';

const Item = memo((props) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isInCart, setIsInCart] = useState(false);

  const itemId = props.animal_id || props.product_id;
  const itemType = props.animal_id ? 'Animal' : props.product_id ? 'Product' : '';

  // Memoize the props that are passed to Popup
  const popupProps = {
    name: props.animal_title || props.product_title,
    animal_pic: props.animal_pic,
    product_pic: props.product_pic,
    animal_new_price: props.animal_new_price,
    product_new_price: props.product_new_price,
    animal_old_price: props.animal_old_price,
    product_old_price: props.product_old_price,
    animal_description: props.animal_description,
    product_description: props.product_description,
    userId: props.userId,
  };

  const fetchInitialData = useCallback(async (userId, id, type) => {
    try {
      // Fetch favorite status
      const favResponse = await axios.get(`https://petflix-backend-620z.onrender.com/api/Favorite/${userId}`);
      const favorites = favResponse.data;
      const isFavorited = favorites.some((fav) =>
        fav.itemId === id &&
        (type === 'Animal' ? !!fav.animalId : !!fav.productId)
      );
      setIsFavorite(isFavorited);

      // Fetch cart status
      const cartResponse = await axios.get(`https://petflix-backend-620z.onrender.com/api/Carts/${userId}`, {
        headers: { 'Authorization': `Bearer ${loggedInUser?.token}` }
      });
      const cartItems = cartResponse.data.cartItems || [];
      const isItemInCart = cartItems.some((item) =>
        item.itemId === id && item.itemType === type
      );
      setIsInCart(isItemInCart);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setErrorMessage('Failed to load data.');
      setTimeout(() => setErrorMessage(''), 3500);
    }
  }, [loggedInUser?.token]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    setLoggedInUser(user);

    if (!itemId || itemId === 0) {
      console.error("Invalid item ID from props:", props);
      return;
    }

    if (!itemType) {
      console.error("Invalid item Type from props:", props);
      return;
    }

    if (user && itemId && itemType) {
      fetchInitialData(user.userId, itemId, itemType);
    }

    // Handle URL params for popup
    const urlParams = new URLSearchParams(window.location.search);
    const urlItemId = urlParams.get('itemId');
    const urlItemType = urlParams.get('itemType');

    if (urlItemId === itemId?.toString() && urlItemType?.toLowerCase() === itemType?.toLowerCase()) {
      setIsPopupOpen(true);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [itemId, itemType, props, fetchInitialData]);

  const toggleFavorite = useCallback(async () => {
    if (!loggedInUser) {
      setErrorMessage("Please log in to add/remove favorites.");
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }

    if (!itemId || !itemType) {
      setErrorMessage("Invalid item ID or type.");
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }

    try {
      const userId = loggedInUser.userId;
      const response = await axios.get(`https://petflix-backend-620z.onrender.com/api/Favorite/${userId}`);
      const favorites = response.data;
      const existingFav = favorites.find((fav) =>
        fav.itemId === itemId &&
        (itemType === 'Animal' ? !!fav.animalId : !!fav.productId)
      );

      if (isFavorite && existingFav) {
        await axios.delete(`https://petflix-backend-620z.onrender.com/api/Favorite?userId=${userId}&itemId=${itemId}`, {
          headers: { 'Authorization': `Bearer ${loggedInUser.token}` }
        });
        setIsFavorite(false);
        setSuccessMessage('Item removed from favorites!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3500);
        setErrorMessage('');
      } else if (!isFavorite && !existingFav) {
        const favoriteData = {
          userId: userId,
          itemId: itemId,
          ...(itemType === 'Animal' ? { animalId: itemId } : { productId: itemId }),
        };
        await axios.post(`https://petflix-backend-620z.onrender.com/api/Favorite`, favoriteData, {
          headers: { 'Authorization': `Bearer ${loggedInUser.token}` }
        });
        setIsFavorite(true);
        setSuccessMessage('Item added to favorites!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3500);
        setErrorMessage('');
      } else {
        setErrorMessage(`Item is already ${isFavorite ? 'in' : 'not in'} your favorites.`);
        setTimeout(() => setErrorMessage(''), 3500);
      }

      if (props.onFavoriteChange) {
        props.onFavoriteChange(itemId, isFavorite ? 0 : 1);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setErrorMessage(`Failed to update favorite: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  }, [isFavorite, itemId, itemType, loggedInUser, props.onFavoriteChange]);

  const handleRating = useCallback((newRating) => {
    setRating(newRating);
  }, []);

  const openPopup = useCallback(() => {
    setIsPopupOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    document.body.style.overflow = '';
    if (window.location.search.includes('itemId')) {
      window.history.pushState({}, '', window.location.pathname);
    }
  }, []);

  const handleDelete = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    setShowConfirmation(false);
    try {
      if (!loggedInUser || loggedInUser.userId !== props.userId) {
        setErrorMessage("You are not authorized to delete this item.");
        setTimeout(() => setErrorMessage(''), 3500);
        return;
      }

      if (!itemId) {
        setErrorMessage("Error: Item ID is missing or invalid.");
        setTimeout(() => setErrorMessage(''), 3500);
        return;
      }

      const apiUrl = `https://petflix-backend-620z.onrender.com/api/${itemType}s/${itemId}`;
      await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${loggedInUser.token}`,
        },
      });

      setSuccessMessage("Item deleted successfully!");
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      setErrorMessage('');
      if (props.onDelete) {
        props.onDelete(itemId, itemType);
      }
      setTimeout(() => {
        closePopup();
      }, 3000);
    } catch (error) {
      console.error("Error deleting item:", error);
      setErrorMessage(`Failed to delete item: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  }, [closePopup, itemId, itemType, props.onDelete, props.userId, loggedInUser]);

  const cancelDelete = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  const addToCart = useCallback(async (itemId, quantity, itemType) => {
    if (!loggedInUser) {
      setErrorMessage("Please log in to add items to your cart.");
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }
  
    if (!itemId || itemId === 0 || !quantity || quantity <= 0) {
      setErrorMessage("Invalid item ID or quantity.");
      console.error('Item: Invalid addToCart params', { itemId, quantity, itemType });
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }
  
    console.log('Item: Adding to cart', { itemId, quantity, itemType }); // Debug log
  
    try {
      await axios.post(
        `https://petflix-backend-620z.onrender.com/api/Carts/${loggedInUser.userId}/items`,
        { itemId, quantity, itemType },
        {
          headers: {
            'Authorization': `Bearer ${loggedInUser.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setIsInCart(true);
      setSuccessMessage("Item added to cart successfully!");
      setTimeout(() => {
        setSuccessMessage('');
      }, 3500);
      setErrorMessage('');
    } catch (error) {
      console.error("Item: Error adding to cart:", error);
      setErrorMessage(`Failed to add item to cart: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  }, [loggedInUser]);

  const removeFromCart = useCallback(async () => {
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
      const cartItem = cartItems.find((item) => item.itemId === itemId && item.itemType === itemType);

      if (!cartItem) {
        setErrorMessage("Item not found in cart.");
        setTimeout(() => setErrorMessage(''), 3500);
        return;
      }

      await axios.delete(`https://petflix-backend-620z.onrender.com/api/Carts/${loggedInUser.userId}/items/${cartItem.cartItemId}`, {
        headers: { 'Authorization': `Bearer ${loggedInUser.token}` }
      });
      setIsInCart(false);
      setSuccessMessage("Item removed from cart successfully!");
      setTimeout(() => {
        setSuccessMessage('');
      }, 3500);
      setErrorMessage('');
    } catch (error) {
      console.error("Error removing from cart:", error);
      setErrorMessage(`Failed to remove item from cart: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  }, [itemId, itemType, loggedInUser]);

  return (
    <div>
      <div className={`item ${props.className || ''}`}>
        <img src={props.animal_pic || props.product_pic} alt={props.animal_title || props.product_title} />
        <p>{props.animal_title || props.product_title}</p>

        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={toggleFavorite}
        >
          <FontAwesomeIcon
            icon={faHeart}
            style={{ fontSize: '.9rem' }}
          />
          {isFavorite ? ' Remove Favorite' : ' Add to Favorite'}
        </button>

        {loggedInUser && loggedInUser.userId === props.userId && (
          <button style={{ top: '2.75rem' }} className="favorite-btn" onClick={handleDelete}>
            Delete Item
          </button>
        )}

        {/* Show rating only for products */}
        {itemType === 'Product' && (
          <div className="item-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? 'filled' : ''}`}
                onClick={() => handleRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        )}

        <div className="item-prices">
          <span className="item-price-new">{props.animal_new_price || props.product_new_price} JD</span>
          <span className="item-price-old">{props.animal_old_price || props.product_old_price} JD</span>
        </div>

        <button className="view-btn" onClick={openPopup}>
          View
        </button>
      </div>

      {showConfirmation && (
        <div className="confirmation-popup">
          <p>Are you sure you want to delete this {props.animal_title || props.product_title}?</p>
          <div className="popup-buttons">
            <button className='delete-btn' onClick={confirmDelete}>Yes, Delete</button>
            <button onClick={cancelDelete}>Cancel</button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="error-message3">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="succsess-message">
          {successMessage}
        </div>
      )}

      {isPopupOpen && (
        <Popup
          closePopup={closePopup}
          handleRating={handleRating}
          itemId={itemId}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          isInCart={isInCart}
          itemType={itemType}
          {...popupProps}
        />
      )}
    </div>
  );
});

export default Item;