import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SummaryModal from '../Components/Popup/SummaryModal.jsx';
import Popup from '../Components/Popup/Popup.jsx';
import '../Pages.css/Cart.css';
import Footer from '../Components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showClearCartConfirmation, setShowClearCartConfirmation] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const userId = JSON.parse(localStorage.getItem('loggedInUser'))?.userId;
  const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const cartResponse = await axios.get(`http://localhost:5024/api/Carts/${userId}`);
        const cartData = cartResponse.data;

        if (!cartData.cartItems || cartData.cartItems.length === 0) {
          setCartItems([]);
          return;
        }

        const itemsWithDetails = await Promise.all(
          cartData.cartItems.map(async (item) => {
            let itemResponse;
            let ownerResponse;
            try {
              itemResponse = await axios.get(`http://localhost:5024/api/Animals/${item.itemId}`);
            } catch (animalErr) {
              console.error(`Failed to fetch animal details for item ${item.itemId}:`, animalErr);
              try {
                itemResponse = await axios.get(`http://localhost:5024/api/Products/${item.itemId}`);
              } catch (productErr) {
                console.error(`Failed to fetch product details for item ${item.itemId}:`, productErr);
                return { ...item, name: 'Item Not Found' };
              }
            }

            if (!itemResponse || !itemResponse.data) {
              console.error(`itemResponse or itemResponse.data is undefined for item ${item.itemId}`);
              return { ...item, name: 'Item Data Not Found', ownerName: 'Unknown', location: 'N/A', availableDays: 'N/A', availableHours: 'N/A', delivery_method: 'N/A' };
            }

            try {
              ownerResponse = await axios.get(`http://localhost:5024/api/User/${itemResponse.data.userId}`);
            } catch (ownerErr) {
              console.error(`Failed to fetch owner details for user ${itemResponse.data.userId}:`, ownerErr);
              return { ...item, name: itemResponse.data.name || 'Item Not Found', ownerName: 'Unknown', location: 'N/A', availableDays: 'N/A', availableHours: 'N/A', delivery_method: 'N/A' };
            }

            const itemDetails = itemResponse.data;
            const ownerDetails = ownerResponse.data;

            const inferredType = itemDetails.gender !== undefined ? 'Animal' : 'Product';

            return {
              ...item,
              name: itemDetails.animal_title || itemDetails.product_title || 'Item Not Found',
              description: itemDetails.animal_description || itemDetails.product_description || 'No description',
              price: itemDetails.animal_new_price || itemDetails.product_new_price || 0,
              imageUrl: itemDetails.animal_pic || itemDetails.product_pic || '',
              ownerName: ownerDetails.name || 'Unknown',
              ownerId: ownerDetails.userId,
              location: ownerDetails.location ?? 'N/A',
              availableDays: ownerDetails.availableDays ?? 'N/A',
              availableHours: ownerDetails.availableHours ?? 'N/A',
              delivery_method: ownerDetails.delivery_method ?? 'N/A',
              profilePic: ownerDetails.profilePic || 'https://via.placeholder.com/30',
              inferredType,
              phone: ownerDetails.phone,
              email: ownerDetails.email
            };
          })
        );

        setCartItems(itemsWithDetails.filter(item => item.name !== 'Item Not Found'));
      } catch (err) {
        console.error("Error fetching cart items:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [userId]);

  const handleQuantityChange = async (cartItemId, action) => {
    const updatedItems = cartItems.map((item) =>
      item.cartItemId === cartItemId
        ? {
            ...item,
            quantity: action === 'increase' ? item.quantity + 1 : Math.max(item.quantity - 1, 1),
          }
        : item
    );

    setCartItems(updatedItems);

    const itemToUpdate = updatedItems.find((item) => item.cartItemId === cartItemId);

    try {
      await axios.put(`http://localhost:5024/api/Carts/${userId}/items/${cartItemId}`, {
        quantity: itemToUpdate.quantity,
      });
    } catch (err) {
      console.error("Error updating cart item:", err);
      setError(err);
      setCartItems(cartItems); // Revert on error
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = () => {
    setShowModal(true);
  };

  const handleOwnerClick = (ownerId) => {
    navigate('/myprofile', { state: { ownerId } });
  };

  const handleConfirmOrder = async ({ includeDelivery, tip }) => {
    try {
      const orderData = {
        userId,
        totalPrice: totalPrice + (includeDelivery ? 5 : 0) + (tip || 0),
        includeDelivery,
        tip: tip || 0,
        status: 'Processing',
        orderItems: cartItems.map(item => ({
          orderId: 0,
          itemId: item.itemId,
          quantity: item.quantity,
          ownerId: item.ownerId
        })),
      };

      console.log("Submitting order:", orderData);

      const response = await axios.post(
        `http://localhost:5024/api/Order`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 201) {
        await axios.delete(`http://localhost:5024/api/Carts/${userId}/items`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setCartItems([]);
        setErrorMessage('Order placed successfully!');
        setTimeout(() => setErrorMessage(''), 3000);
        navigate('/orderspage', { state: { newOrder: response.data } });
      }
    } catch (err) {
      console.error("Error confirming order:", err.response?.data || err);
      setError(err);
      setErrorMessage(`Failed to place order: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setShowModal(false);
    }
  };

  const handleViewItem = async (item) => {
    try {
      const endpoint = item.itemId && (await axios.get(`http://localhost:5024/api/Animals/${item.itemId}`).catch(() => axios.get(`http://localhost:5024/api/Products/${item.itemId}`))).then(res => res.data);
      setSelectedItem(endpoint || item);
      setShowPopup(true);
    } catch (err) {
      console.error("Error fetching item details:", err);
      setSelectedItem(item);
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = (cartItemId) => {
    setItemToDelete(cartItemId);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5024/api/Carts/${userId}/items/${itemToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCartItems(cartItems.filter(item => item.cartItemId !== itemToDelete));
      setErrorMessage('Item deleted successfully!');
      setTimeout(() => setErrorMessage(''), 3000);
    } catch (err) {
      console.error("Error deleting cart item:", err);
      setError(err);
      setErrorMessage('Error deleting item. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setShowConfirmation(false);
      setItemToDelete(null);
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    const cartItem = cartItems.find(item => item.itemId === itemId);
    if (!cartItem) return;

    try {
      await axios.delete(`http://localhost:5024/api/Carts/${userId}/items/${cartItem.cartItemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCartItems(cartItems.filter(item => item.cartItemId !== cartItem.cartItemId));
      setErrorMessage('Item removed from cart successfully!');
      setTimeout(() => setErrorMessage(''), 3000);
    } catch (err) {
      console.error("Error removing item from cart:", err);
      setErrorMessage('Error removing item. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleAddToCart = async (itemId, quantity) => {
    try {
      const itemType = selectedItem.inferredType || (selectedItem.gender !== undefined ? 'Animal' : 'Product');
      await axios.post(
        `http://localhost:5024/api/Carts/${userId}/items`,
        { itemId, quantity, itemType },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const updatedCart = await axios.get(`http://localhost:5024/api/Carts/${userId}`);
      setCartItems(updatedCart.data.cartItems.map(item => ({
        ...item,
        name: selectedItem.name,
        description: selectedItem.description,
        price: selectedItem.price,
        imageUrl: selectedItem.imageUrl,
        ownerName: selectedItem.ownerName,
        ownerId: selectedItem.ownerId,
        location: selectedItem.location,
        availableDays: selectedItem.availableDays,
        availableHours: selectedItem.availableHours,
        delivery_method: selectedItem.delivery_method,
        profilePic: selectedItem.profilePic,
        inferredType: itemType,
        phone: selectedItem.phone,
        email: selectedItem.email
      })));
      setErrorMessage('Item added to cart successfully!');
      setTimeout(() => setErrorMessage(''), 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setErrorMessage('Error adding item to cart. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setItemToDelete(null);
  };

  const handleClearCart = () => {
    setShowClearCartConfirmation(true);
  };

  const confirmClearCart = async () => {
    try {
      await axios.delete(`http://localhost:5024/api/Carts/${userId}/clear`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCartItems([]);
      setErrorMessage('Cart cleared successfully!');
      setTimeout(() => setErrorMessage(''), 3000);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError(err);
      setErrorMessage('Error clearing cart. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setShowClearCartConfirmation(false);
    }
  };

  const cancelClearCart = () => {
    setShowClearCartConfirmation(false);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "Not set";
    
    const cleaned = phone.replace(/\D/g, '');
    
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{3})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
    
    return phone;
  };

  if (loading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon={faSpinner} spin /> Loading...
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error.message}. Please try again later.</div>;
  }

  return (
    <>
      <div className="cart-container">
        <h2 className='cart-container-h2'>Your Cart</h2>
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p style={{marginBottom:'1.5rem'}}>Your cart is empty.</p>
          ) : (
            <>
              {/* Products Section */}
              {cartItems.filter(item => item.inferredType === 'Product').length > 0 && (
                <div className="cart-section products-section">
                  <div className="section-header">
                    <h3>Products ({cartItems.filter(item => item.inferredType === 'Product').length})</h3>
                  </div>

                  {errorMessage && (
                    <div className="error-message3">
                      {errorMessage}
                    </div>
                  )}

                  {cartItems.filter(item => item.inferredType === 'Product').map((item) => (
                    <div className="cart-item" key={item.cartItemId}>
                      <div className="item-image2">
                        <img src={item.imageUrl} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <div className="item-meta">
                          <h3 className="item-name" style={{marginBottom:'.5rem'}}>{item.name}</h3>
                          
                          <div className="item-owner">
                            <span>Seller :</span>
                            <img
                              src={item.profilePic}
                              alt={`${item.ownerName}'s profile`}
                              className="owner-pic"
                            />
                            <button className="owner-link" style={{fontWeight:'1000'}} onClick={() => handleOwnerClick(item.ownerId)}>
                              {item.ownerName || 'Unknown'}
                            </button>
                          </div>
                          
                          <div className="item-description">{item.description}</div>
                        </div>
                        <div className="item-info-grid">
                          <div className="info-item">
                            <span>Seller's Location :</span>
                            <p>{item.location}</p>
                          </div>
                          <div className="info-item">
                            <span>Available Days :</span>
                            <p>{item.availableDays}</p>
                          </div>
                          <div className="info-item">
                            <span>Available Time :</span>
                            <p>{item.availableHours}</p>
                          </div>
                          <div className="info-item">
                            <span>Delivery :</span>
                            <p>{item.delivery_method}</p>
                          </div>
                        </div>
                      </div>
                      <div className="item-controls">
                        <div className="item-actions">
                          <button className="view-button" onClick={() => handleViewItem(item)}>
                            View The Product
                          </button>
                          <button className="delete-button" onClick={() => handleDeleteItem(item.cartItemId)}>
                            Remove From Cart
                          </button>
                        </div>
                        <div className="item-quantity">
                          <button onClick={() => handleQuantityChange(item.cartItemId, 'decrease')}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.cartItemId, 'increase')}>+</button>
                        </div>
                        <div className="item-pricing">
                          <div className="item-price">{formatPrice(item.price)} JD each</div>
                          <div className="item-total">Total: {formatPrice(item.price * item.quantity)} JD</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Section Divider */}
              {cartItems.filter(item => item.inferredType === 'Animal').length > 0 &&
               cartItems.filter(item => item.inferredType === 'Product').length > 0 && (
                <hr className="section-divider" />
              )}

              {/* Animals Section */}
              {cartItems.filter(item => item.inferredType === 'Animal').length > 0 && (
                <div className="cart-section animals-section">
                  <div className="section-header">
                    <h3>Animals ({cartItems.filter(item => item.inferredType === 'Animal').length})</h3>
                  </div>

                  {errorMessage && (
                    <div className="error-message3">
                      {errorMessage}
                    </div>
                  )}

                  {cartItems.filter(item => item.inferredType === 'Animal').map((item) => (
                    <div className="cart-item" key={item.cartItemId}>
                      <div className="item-image2">
                        <img src={item.imageUrl} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <div className="item-meta">
                        <h3 className="item-name" style={{marginBottom:'1rem'}}>{item.name}</h3>
                        <div className="item-owner">
                            <span>Owner :</span>
                            <img
                              src={item.profilePic}
                              alt={`${item.ownerName}'s profile`}
                              className="owner-pic"
                            />
                            <button className="owner-link" style={{fontWeight:'1000'}} onClick={() => handleOwnerClick(item.ownerId)}>
                              {item.ownerName || 'Unknown'}
                            </button>
                          </div>
                          <div className="item-description">{item.description}</div>
                        </div>
                        <div className="item-info-grid">
                          <div className="info-item">
                            <span>Owner's Location :</span>
                            <p>{item.location}</p>
                          </div>
                          <div className="info-item">
                            <span>Available Days :</span>
                            <p>{item.availableDays}</p>
                          </div>
                          <div className="info-item">
                            <span>Available Time :</span>
                            <p>{item.availableHours}</p>
                          </div>
                          <div className="info-item">
                            <span>Delivery :</span>
                            <p>{item.delivery_method}</p>
                          </div>
                        </div>
                      </div>
                      <div className="item-controls">
                        <div className="item-actions">
                          <button className="view-button" onClick={() => handleViewItem(item)}>
                            View The Animal
                          </button>
                          <button className="delete-button" onClick={() => handleDeleteItem(item.cartItemId)}>
                            Remove From Cart
                          </button>
                        </div>
                        <div className="item-quantity">
                          {/* No increment/decrement for animals, just display quantity */}
                        </div>
                        <div className="item-pricing">
                          <div className="item-total">Total: {formatPrice(item.price * item.quantity)} JD</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <table className="cart-summary-table">
              <thead>
                <tr>
                  <th>Owner/Seller</th>
                  <th>Item Name</th>
                  <th>Item Type</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Delivery</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.cartItemId} className="cart-summary-item">
                    <td>
                      <img
                        src={item.profilePic}
                        alt={`${item.ownerName}'s profile`}
                        className="owner-pic"
                      />
                      <button className="owner-link" style={{fontWeight:'1000'}} onClick={() => handleOwnerClick(item.ownerId)}>
                        {item.ownerName}
                      </button>
                    </td>
                    <td>{item.name}</td>
                    <td>{item.inferredType}</td>
                    <td>{item.location}</td>
                    <td>
                    <a href={`tel:${item.phone}`} style={{ color: "black", textDecoration: "none", display: "inline-block" }} className="phone-link">
                      {formatPhoneNumber(item.phone)}
                    </a>
                    </td>
                    <td>{item.delivery_method}</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.price * item.quantity)} JD</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="total-price-cart">
              <span>
                Animals ({cartItems.filter((item) => item.inferredType === 'Animal').reduce((acc, item) => acc + item.quantity, 0)}) : {' '}
                {formatPrice(
                  cartItems
                    .filter((item) => item.inferredType === 'Animal')
                    .reduce((acc, item) => acc + item.price * item.quantity, 0)
                )} JD
              </span>
              <span>
                Products ({cartItems.filter((item) => item.inferredType === 'Product').reduce((acc, item) => acc + item.quantity, 0)}) : {' '}
                {formatPrice(
                  cartItems
                    .filter((item) => item.inferredType === 'Product')
                    .reduce((acc, item) => acc + item.price * item.quantity, 0)
                )} JD
              </span>
              <hr />
              <span>
                Total : {' '}
                {formatPrice(totalPrice)} JD
              </span>
            </div>

            <div className="cart-actions">
              <button className="clear-cart-button" onClick={handleClearCart}>
                Clear Cart
              </button>
              <button className="checkout-button" onClick={handleCheckout} disabled={cartItems.length === 0}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {showPopup && selectedItem && (
          <Popup
            name={selectedItem.name}
            closePopup={closePopup}
            handleRating={() => {}}
            itemId={selectedItem.itemId}
            addToCart={handleAddToCart}
            removeFromCart={handleRemoveFromCart}
            isInCart={cartItems.some(item => item.itemId === selectedItem.itemId)}
            itemType={selectedItem.inferredType}
            animal_pic={selectedItem.imageUrl}
            product_pic={selectedItem.imageUrl}
            animal_new_price={selectedItem.price}
            product_new_price={selectedItem.price}
            animal_description={selectedItem.description}
            product_description={selectedItem.description}
          />
        )}

        {showModal && (
          <SummaryModal
            totalPrice={totalPrice}
            cartItems={cartItems} // Pass cartItems to SummaryModal
            onClose={() => setShowModal(false)}
            onConfirm={handleConfirmOrder}
          />
        )}

        {showConfirmation && (
          <div className="confirmation-popup">
            <p>Are you sure you want to remove this item from your cart?</p>
            <div className="popup-buttons">
              <button className='delete-btn' onClick={confirmDelete}>Yes, Remove</button>
              <button onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        )}

        {showClearCartConfirmation && (
          <div className="confirmation-popup">
            <p>Are you sure you want to clear all items from your cart?</p>
            <div className="popup-buttons">
              <button className='delete-btn' onClick={confirmClearCart}>Yes, Clear Cart</button>
              <button onClick={cancelClearCart}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Cart;