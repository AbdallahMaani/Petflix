import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SummaryModal.css';

const SummaryModal = ({ totalPrice, cartItems, onClose, onConfirm }) => {
  const [includeDelivery, setIncludeDelivery] = useState(false);
  const [tip, setTip] = useState(0);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const userId = JSON.parse(localStorage.getItem('loggedInUser'))?.userId;
  const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
      setUserData(loggedInUser);
      setEditedEmail(loggedInUser.email || '');
      setEditedLocation(loggedInUser.location || '');
      setEditedPhone(loggedInUser.phone || '');
    }
  }, []);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleTipChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setTip(value >= 0 ? value : 0);
  };

  const deliveryCost = includeDelivery ? 5 : 0;
  const finalTotal = totalPrice + deliveryCost + tip;


  const handleConfirm = () => {
    if (!userId) {
      setErrorMessage('User ID is missing. Please log in again.');
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      setErrorMessage('Cart is empty. Please add items to proceed.');
      return;
    }
    if (isNaN(finalTotal) || finalTotal <= 0) {
      setErrorMessage('Invalid total price. Please check your cart.');
      return;
    }

    onConfirm({ includeDelivery, tip });
    navigate('/orderspage');
  };


  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    const updatedUserData = {
      ...userData,
      email: editedEmail,
      location: editedLocation,
      phone: editedPhone,
    };

    try {
      await axios.put(`http://localhost:5024/api/User/${userData.userId}`, updatedUserData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUserData(updatedUserData);
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUserData));
      setIsEditing(false);
      setSuccessMessage('Your details updated successfully!');
    } catch (error) {
      console.error('Error updating user details:', error);
      setErrorMessage('Failed to update details. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedEmail(userData?.email || '');
    setEditedLocation(userData?.location || '');
    setEditedPhone(userData?.phone || '');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Order Summary</h3>
        
        {/* Cart Items Summary */}
        <div className="cart-items-summary">
          <h4>Items in Your Cart</h4>
          {cartItems.length === 0 ? (
            <p>No items in cart.</p>
          ) : (
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.cartItemId}>
                    <td>{item.name}</td>
                    <td>{item.inferredType}</td>
                    <td>{item.quantity}</td>
                    <td>{(item.price * item.quantity).toFixed(2)} JD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* User Information */}
        <div className="user-info">
          <h4>Your Details</h4>
          {isEditing ? (
            <>
              <div className="user-info-row">
                <label>Email</label>
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  required
                />
              </div>
              <div className="user-info-row">
                <label>Location</label>
                <input
                  type="text"
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                />
              </div>
              <div className="user-info-row">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                />
              </div>
              <div className="edit-actions">
                <button className="cancel-button" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="confirm-button" onClick={handleSaveClick}>
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="user-info-row">
                <span>Email:</span>
                <span>{userData?.email || 'Not specified'}</span>
              </div>
              <div className="user-info-row">
                <span>Location:</span>
                <span>{userData?.location || 'Not specified'}</span>
              </div>
              <div className="user-info-row">
                <span>Phone:</span>
                <span>{userData?.phone || 'Not specified'}</span>
              </div>
              <button className="edit-button" onClick={handleEditClick}>
                Edit Details
              </button>
            </>
          )}
        </div>

        {/* Order Pricing */}
        <div className="order-pricing">
          <h4>Pricing</h4>
          <table className="summary-table">
            <tbody>
              <tr>
                <th>Subtotal:</th>
                <td>{totalPrice.toFixed(2)} JD</td>
              </tr>
              <tr>
                <th>Delivery:</th>
                <td>
                  <label className="delivery-option">
                    <input
                      type="checkbox"
                      checked={includeDelivery}
                      onChange={(e) => setIncludeDelivery(e.target.checked)}
                      style={{width:'5%'}}
                    />
                    Include Delivery (5 JD)
                  </label>
                </td>
              </tr>
              <tr>
                <th>Tip:</th>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={tip}
                    onChange={handleTipChange}
                    placeholder="Enter tip amount"
                    className="tip-input"
                  />
                </td>
              </tr>
              <tr>
                <th>Final Total:</th>
                <td><strong>{finalTotal.toFixed(2)} JD</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-button" onClick={handleConfirm} disabled={isEditing}>
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;