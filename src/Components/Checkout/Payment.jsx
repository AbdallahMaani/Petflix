import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaypal,
  faApple,
  faGoogle,
  faCcVisa,
  faCcMastercard,
  faCcAmex
} from '@fortawesome/free-brands-svg-icons';
import {
  faCheckCircle,
  faCreditCard,
  faLock,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import './Payment.css';

const SuccessModal = ({ isOpen, onClose, orderId }) => {
  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-content">
          <FontAwesomeIcon icon={faCheckCircle} className="payment-success-icon" />
          <h2 className="payment-modal-title">Payment Successful!</h2>
          <p className="payment-modal-message">
            Your order #{orderId} has been processed successfully. 
            A receipt has been sent to your email.
          </p>
          <div className="payment-modal-details">
            <div className="payment-modal-row">
              <span>Date</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="payment-modal-row">
              <span>Transaction ID</span>
              <span>{Math.random().toString(36).substring(2, 15)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="payment-back-button"
          >
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

const Payment = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [activePaymentMethod, setActivePaymentMethod] = useState('card');
  const [showSavedCards, setShowSavedCards] = useState(false);
  const [rememberCard, setRememberCard] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, totalAmount, subtotal, delivery, tip } = location.state || {};
  const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;

  const savedCards = [
    { id: 1, last4: '4242', brand: 'visa', expiry: '12/24' },
    { id: 2, last4: '5555', brand: 'mastercard', expiry: '06/25' }
  ];

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned
      .slice(0, 16)
      .match(/.{1,4}/g)
      ?.join(' ') || cleaned.slice(0, 16);
    return formatted;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    setCardNumber(formatCardNumber(value));
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let month = value.slice(0, 2);
    let year = value.slice(2, 4);

    // Prevent month > 12
    if (month.length === 2 && parseInt(month, 10) > 12) {
      month = '12';
    }

    // Prevent year > 30
    if (year.length === 2 && parseInt(year, 10) > 30) {
      year = '30';
    }

    let formatted = month;
    if (year.length > 0) {
      formatted += '/' + year;
    }

    setExpiryDate(formatted.slice(0, 5));
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.slice(0, 3));
  };

  const getCardType = (number) => {
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    return 'unknown';
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!orderId) {
      setError('No order selected for payment.');
      return;
    }

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await axios.patch(
        `https://petflix-backend-620z.onrender.com/api/Order/${orderId}/status`,
        "Shipped",
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setError(null);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(`Failed to process payment: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCardNumber('');
    setCardholderName('');
    setExpiryDate('');
    setCvv('');
    setError(null);
    navigate('/orderspage', { state: { paymentSuccess: false } });
  };

  const renderCardIcon = (type) => {
    switch(type) {
      case 'visa': return <FontAwesomeIcon icon={faCcVisa} />;
      case 'mastercard': return <FontAwesomeIcon icon={faCcMastercard} />;
      case 'amex': return <FontAwesomeIcon icon={faCcAmex} />;
      default: return <FontAwesomeIcon icon={faCreditCard} />;
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-wrapper">
        <div className="payment-header">
          <h1>Secure Checkout</h1>
          <div className="payment-security-badge">
            <FontAwesomeIcon icon={faLock} />
            <span>Secure SSL Encryption</span>
          </div>
        </div>

        {error && (
          <div className="payment-error">
            <p>{error}</p>
          </div>
        )}

        <div className="payment-order-summary">
          <h2>Order Summary</h2>
          <div className="payment-order-details">
            <div className="payment-order-row">
              <span>Order Number</span>
              <span>#{orderId || 'N/A'}</span>
            </div>
            <div className="payment-order-row">
              <span>Subtotal</span>
              <span>{subtotal ? `${subtotal} JD` : 'N/A'}</span>
            </div>
            <div className="payment-order-row">
              <span>Delivery</span>
              <span>{delivery ? `${delivery.toFixed(2)} JD` : 'Free'}</span>
            </div>
            <div className="payment-order-row">
              <span>Tip</span>
              <span>{tip ? `${tip.toFixed(2)} JD` : 'N/A'}</span>
            </div>
            <div className="payment-order-total">
              <span>Total Amount</span>
              <span>{totalAmount ? `${totalAmount} JD` : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="payment-methods">
          <h2>Payment Method</h2>
          <div className="payment-method-options">
            <button
              type="button"
              className={`payment-method-tab ${activePaymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setActivePaymentMethod('card')}
            >
              <FontAwesomeIcon icon={faCreditCard} />
              <span>Credit/Debit Card</span>
            </button>
            <button
              type="button"
              className={`payment-method-tab ${activePaymentMethod === 'paypal' ? 'active' : ''}`}
              onClick={() => setActivePaymentMethod('paypal')}
            >
              <FontAwesomeIcon icon={faPaypal} />
              <span>PayPal</span>
            </button>
            <button
              type="button"
              className={`payment-method-tab ${activePaymentMethod === 'apple' ? 'active' : ''}`}
              onClick={() => setActivePaymentMethod('apple')}
            >
              <FontAwesomeIcon icon={faApple} />
              <span>Apple Pay</span>
            </button>
          </div>

          {activePaymentMethod === 'card' && (
            <div className="payment-card-form">
              {savedCards.length > 0 && (
                <div className="saved-cards-section">
                  <button
                    type="button"
                    className="saved-cards-toggle"
                    onClick={() => setShowSavedCards(!showSavedCards)}
                  >
                    <span>Saved Payment Methods</span>
                    <FontAwesomeIcon icon={showSavedCards ? faChevronUp : faChevronDown} />
                  </button>
                  
                  {showSavedCards && (
                    <div className="saved-cards-list">
                      {savedCards.map(card => (
                        <div key={card.id} className="saved-card">
                          <div className="card-brand">
                            {renderCardIcon(card.brand)}
                            <span>•••• •••• •••• {card.last4}</span>
                          </div>
                          <div className="card-expiry">
                            Expires {card.expiry}
                          </div>
                          <button type="button" className="use-card-btn">
                            Use This Card
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handlePayNow}>
                <div className="form-group">
                  <label htmlFor="cardholderName">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardholderName"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Name on card"
                    className="payment-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <div className="card-input-wrapper">
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="payment-input"
                      required
                    />
                    {cardNumber && (
                      <div className="card-type-icon">
                        {renderCardIcon(getCardType(cardNumber.replace(/\s/g, '')))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="payment-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">Security Code</label>
                    <div className="cvv-input-wrapper">
                      <input
                        type="text"
                        id="cvv"
                        value={cvv}
                        onChange={handleCvvChange}
                        placeholder="CVV"
                        maxLength="3"
                        className="payment-input"
                        required
                      />
                      <div className="cvv-hint" title="3-digit code on back of card">
                        ?
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-options">
                  <label className="remember-card">
                    <input
                      type="checkbox"
                      checked={rememberCard}
                      onChange={(e) => setRememberCard(e.target.checked)}
                    />
                    <span>Save this card for future payments</span>
                  </label>
                </div>

                <div className="payment-security">
                  <div className="security-info">
                    <FontAwesomeIcon icon={faLock} />
                    <span>Secure payment encrypted with SSL</span>
                  </div>
                  <div className="accepted-cards">
                    <FontAwesomeIcon icon={faCcVisa} />
                    <FontAwesomeIcon icon={faCcMastercard} />
                    <FontAwesomeIcon icon={faCcAmex} />
                  </div>
                </div>

                <button
                  type="submit"
                  className="payment-submit-button"
                  disabled={!orderId}
                >
                  Pay {totalAmount ? `${totalAmount} JD` : ''}
                </button>
              </form>
            </div>
          )}

          {activePaymentMethod === 'paypal' && (
            <div className="payment-method-content">
              <div className="payment-method-description">
                <p>You will be redirected to PayPal to complete your payment securely.</p>
                <button className="payment-method-button paypal">
                  <FontAwesomeIcon icon={faPaypal} />
                  <span>Continue with PayPal</span>
                </button>
              </div>
            </div>
          )}

          {activePaymentMethod === 'apple' && (
            <div className="payment-method-content">
              <div className="payment-method-description">
                <p>Complete your payment quickly and securely with Apple Pay.</p>
                <button className="payment-method-button apple">
                  <FontAwesomeIcon icon={faApple} />
                  <span>Pay with Apple Pay</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SuccessModal isOpen={isModalOpen} onClose={handleCloseModal} orderId={orderId} />
    </div>
  );
};

export default Payment;