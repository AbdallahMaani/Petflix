import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen,
  faBoxesPacking,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faShoppingBag,
  faArrowLeft,
  faPhone,
  faEnvelope,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import '../Checkout/OrdersPage.css';
import Footer from '../Footer/Footer.jsx';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, orderId }) => {
  if (!isOpen) return null;

  let title, message, confirmButtonClass;
  if (action === 'cancel') {
    title = 'Cancel Order';
    message = `Are you sure you want to cancel Order #${orderId}? This action cannot be undone.`;
    confirmButtonClass = 'modal-confirm-button-902';
  } else if (action === 'pay') {
    title = 'Pay Order';
    message = `Are you sure you want to pay for Order #${orderId}? You will be redirected to the payment page.`;
    confirmButtonClass = 'modal-confirm-button-903';
  } else if (action === 'confirmDelivery') {
    title = 'Confirm Delivery';
    message = `Are you sure you want to confirm that Order #${orderId} has been delivered? This will mark the order as successfully delivered.`;
    confirmButtonClass = 'modal-confirm-button-903';
  }

  return (
    <div className="confirmation-modal-overlay-901">
      <div className="confirmation-modal-901">
        <h2 className="modal-title-901">{title}</h2>
        <p className="modal-message-901">{message}</p>
        <div className="modal-buttons-901">
          <button className={confirmButtonClass} onClick={onConfirm}>
            Confirm
          </button>
          <button className="modal-close-button-904" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('loggedInUser'))?.userId;
  const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
  const [userLocation, setUserLocation] = useState('');

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const userResponse = await axios.get(`https://petflix-backend-620z.onrender.com/api/User/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUserLocation(userResponse.data.location || 'N/A');
      } catch (error) {
        console.error("Error fetching user location:", error);
        setUserLocation('N/A');
      }
    };

    if (userId) {
      fetchUserLocation();
    } else {
      setUserLocation('N/A');
    }
  }, [userId, token]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setError('Please log in to view your orders.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`https://petflix-backend-620z.onrender.com/api/Order/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const ordersData = response.data;

        const enhancedOrders = await Promise.all(
          ordersData.map(async (order) => {
            const itemsWithDetails = await Promise.all(
              order.orderItems.map(async (item) => {
                let itemDetails = {};
                try {
                  const animalRes = await axios.get(`https://petflix-backend-620z.onrender.com/api/Animals/${item.itemId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  itemDetails = {
                    ...animalRes.data,
                    inferredType: 'Animal',
                    name: animalRes.data.animal_title,
                    price: animalRes.data.animal_new_price,
                    imageUrl: animalRes.data.animal_pic || 'https://via.placeholder.com/150',
                    description: animalRes.data.animal_description
                  };
                } catch (animalErr) {
                  try {
                    const productRes = await axios.get(`https://petflix-backend-620z.onrender.com/api/Products/${item.itemId}`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    itemDetails = {
                      ...productRes.data,
                      inferredType: 'Product',
                      name: productRes.data.product_title,
                      price: productRes.data.product_new_price,
                      imageUrl: productRes.data.product_pic || 'https://via.placeholder.com/150',
                      description: productRes.data.product_description
                    };
                  } catch (productErr) {
                    console.error("Error fetching product details:", productErr);
                    itemDetails = {
                      inferredType: 'Unknown',
                      name: 'Item Not Found',
                      price: 0,
                      imageUrl: 'https://via.placeholder.com/150',
                      description: 'N/A'
                    };
                  }
                }

                let ownerDetails = {};
                try {
                  const ownerRes = await axios.get(`https://petflix-backend-620z.onrender.com/api/User/${item.ownerId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  ownerDetails = ownerRes.data;
                } catch (ownerErr) {
                  console.error("Error fetching owner details:", ownerErr);
                  ownerDetails = {
                    name: 'Unknown',
                    userId: item.ownerId,
                    email: 'N/A',
                    phone: 'N/A',
                    location: 'N/A',
                    availableDays: 'N/A',
                    availableHours: 'N/A',
                    delivery_method: 'N/A',
                    profilePic: 'https://via.placeholder.com/30'
                  };
                }

                return {
                  ...item,
                  ...itemDetails,
                  ownerDetails
                };
              })
            );

            return {
              ...order,
              orderItems: itemsWithDetails
            };
          })
        );

        setOrders(enhancedOrders);

        const newOrder = location.state?.newOrder;
        if (newOrder) {
          const isDuplicate = enhancedOrders.some(order => order.orderId === newOrder.orderId);
          if (!isDuplicate) {
            const enhancedNewOrder = await Promise.all(
              [newOrder].map(async (order) => {
                const itemsWithDetails = await Promise.all(
                  order.orderItems.map(async (item) => {
                    let itemDetails = {};
                    try {
                      const animalRes = await axios.get(`https://petflix-backend-620z.onrender.com/api/Animals/${item.itemId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      itemDetails = {
                        ...animalRes.data,
                        inferredType: 'Animal',
                        name: animalRes.data.animal_title,
                        price: animalRes.data.animal_new_price,
                        imageUrl: animalRes.data.animal_pic || 'https://via.placeholder.com/150',
                        description: animalRes.data.animal_description
                      };
                    } catch (animalErr) {
                      try {
                        const productRes = await axios.get(`https://petflix-backend-620z.onrender.com/api/Products/${item.itemId}`, {
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        itemDetails = {
                          ...productRes.data,
                          inferredType: 'Product',
                          name: productRes.data.product_title,
                          price: productRes.data.product_new_price,
                          imageUrl: productRes.data.product_pic || 'https://via.placeholder.com/150',
                          description: productRes.data.product_description
                        };
                      } catch (productErr) {
                        console.error("Error fetching product details for new order:", productErr);
                        itemDetails = {
                          inferredType: 'Unknown',
                          name: 'Item Not Found',
                          price: 0,
                          imageUrl: 'https://via.placeholder.com/150',
                          description: 'N/A'
                        };
                      }
                    }

                    let ownerDetails = {};
                    try {
                      const ownerRes = await axios.get(`https://petflix-backend-620z.onrender.com/api/User/${item.ownerId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      ownerDetails = ownerRes.data;
                    } catch (ownerErr) {
                      console.error("Error fetching owner details for new order:", ownerErr);
                      ownerDetails = {
                        name: 'Unknown',
                        userId: item.ownerId,
                        email: 'N/A',
                        phone: 'N/A',
                        location: 'N/A',
                        availableDays: 'N/A',
                        availableHours: 'N/A',
                        delivery_method: 'N/A',
                        profilePic: 'https://via.placeholder.com/30'
                      };
                    }

                    return {
                      ...item,
                      ...itemDetails,
                      ownerDetails
                    };
                  })
                );

                return {
                  ...order,
                  orderItems: itemsWithDetails
                };
              })
            );

            setOrders((prevOrders) => [...prevOrders, ...enhancedNewOrder]);
          }
        }

        if (location.state?.paymentSuccess) {
          setActiveTab('successful');
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(`Failed to load orders: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, token, location.state]);

  const handleCancelOrder = async (orderId) => {
    try {
      const orderToCancel = orders.find(order => order.orderId === orderId);
      if (!orderToCancel || orderToCancel.status !== 'Processing') {
        setError('Only Processing orders can be canceled.');
        return;
      }

      await axios.patch(
        `https://petflix-backend-620z.onrender.com/api/Order/${orderId}/status`,
        "Canceled",
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === orderId ? { ...order, status: 'Canceled' } : order
        )
      );

      setActiveTab('canceled');
      setError(null);
    } catch (err) {
      console.error("Error canceling order:", err);
      setError(`Failed to cancel order: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    try {
      const orderToConfirm = orders.find(order => order.orderId === orderId);
      if (!orderToConfirm || orderToConfirm.status !== 'Shipped') {
        setError('Only Shipped orders can be confirmed as delivered.');
        return;
      }

      await axios.patch(
        `https://petflix-backend-620z.onrender.com/api/Order/${orderId}/status`,
        "Delivered",
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === orderId ? { ...order, status: 'Delivered' } : order
        )
      );

      setActiveTab('successful');
      setError(null);
    } catch (err) {
      console.error("Error confirming delivery:", err);
      setError(`Failed to confirm delivery: ${err.response?.data?.message || err.message}`);
    }
  };

  const confirmCancel = (orderId) => {
    setModalAction('cancel');
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const confirmPay = (orderId) => {
    setModalAction('pay');
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const confirmDelivery = (orderId) => {
    setModalAction('confirmDelivery');
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction === 'cancel') {
      await handleCancelOrder(selectedOrderId);
    } else if (modalAction === 'pay') {
      const order = orders.find(o => o.orderId === selectedOrderId);
      if (order) {
        if (order.status !== 'Processing') {
          setError('Only Processing orders can be paid.');
          return;
        }
        const totalAmount = (
          parseFloat(calculateSubtotal(order)) +
          (order.tip || 0) +
          (order.includeDelivery ? 5 : 0)
        ).toFixed(2);
        navigate('/payment', {
          state: {
            orderId: selectedOrderId,
            totalAmount,
            subtotal: calculateSubtotal(order),
            delivery: order.includeDelivery ? 5 : 0,
            tip: order.tip || 0
          }
        });
      }
    } else if (modalAction === 'confirmDelivery') {
      await handleConfirmDelivery(selectedOrderId);
    }
    setModalOpen(false);
    setSelectedOrderId(null);
    setModalAction('');
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOrderId(null);
    setModalAction('');
  };

  const currentOrders = orders.filter((order) => order.status === 'Processing' || order.status === 'Shipped');
  const successfulOrders = orders.filter((order) => order.status === 'Delivered');
  const canceledOrders = orders.filter((order) => order.status === 'Canceled');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing':
        return <FontAwesomeIcon icon={faClock} className="order-status-icon processing" />;
      case 'Shipped':
        return <FontAwesomeIcon icon={faBoxesPacking} className="order-status-icon shipped" />;
      case 'Delivered':
        return <FontAwesomeIcon icon={faCheckCircle} className="order-status-icon delivered" />;
      case 'Canceled':
        return <FontAwesomeIcon icon={faTimesCircle} className="order-status-icon canceled" />;
      default:
        return <FontAwesomeIcon icon={faClock} className="order-status-icon" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateSubtotal = (order) => {
    return order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="order-page-container">
        <div className="order-loading-spinner">
          <div className="order-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-page-container">
        <div className="order-error-message">{error}</div>
      </div>
    );
  }

  const hasNoOrders = orders.length === 0;

  const handleOwnerClick = (ownerId) => {
    navigate('/myprofile', { state: { ownerId } });
  };

  return (
    <>
      <div className="order-page-container">
        <button
          onClick={() => navigate('/myprofile')}
          className="order-view-btn"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        <h1 className="order-page-title">
          <FontAwesomeIcon icon={faShoppingBag} className="order-title-icon" />
          Your Orders
        </h1>

        {hasNoOrders ? (
          <div className="order-empty-state">
            <FontAwesomeIcon icon={faBoxOpen} className="order-empty-icon" />
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <button className="order-shop-button" onClick={() => navigate('/')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="order-tabs-container">
              <button
                className={`order-tab-button ${activeTab === 'current' ? 'order-tab-active' : ''}`}
                onClick={() => setActiveTab('current')}
              >
                <FontAwesomeIcon icon={faClock} /> Current
                {currentOrders.length > 0 && (
                  <span className="order-tab-count">{currentOrders.length}</span>
                )}
              </button>
              <button
                className={`order-tab-button ${activeTab === 'successful' ? 'order-tab-active' : ''}`}
                onClick={() => setActiveTab('successful')}
              >
                <FontAwesomeIcon icon={faCheckCircle} /> Successful
                {successfulOrders.length > 0 && (
                  <span className="order-tab-count">{successfulOrders.length}</span>
                )}
              </button>
              <button
                className={`order-tab-button ${activeTab === 'canceled' ? 'order-tab-active' : ''}`}
                onClick={() => setActiveTab('canceled')}
              >
                <FontAwesomeIcon icon={faTimesCircle} /> Canceled
                {canceledOrders.length > 0 && (
                  <span className="order-tab-count">{canceledOrders.length}</span>
                )}
              </button>
            </div>

            <div className="order-list-container">
              {activeTab === 'current' && (
                <div className="order-section">
                  {currentOrders.length === 0 ? (
                    <div className="order-empty-section">
                      <FontAwesomeIcon icon={faClock} className="order-section-icon" />
                      <p>No current orders</p>
                    </div>
                  ) : (
                    currentOrders.map((order) => (
                      <div key={order.orderId} className="order-card-item">
                        <div className="order-card-header">
                          <div className="order-id-number">Order #{order.orderId}</div>
                          <div className="order-status-container">
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                        </div>
                        <div className="order-details-container">
                          {order.orderItems.map((item) => (
                            <div key={item.orderItemId} className="order-item-detail">
                              <div className="item-image">
                                <img src={item.imageUrl} alt={item.name} />
                              </div>
                              <div className="order-item-info">
                                <h3 className="order-item-name">{item.name}</h3>
                                <div className="order-item-meta">
                                  <div>
                                    <span>Type:</span> {item.inferredType}
                                  </div>
                                  {item.inferredType === 'Animal' && (
                                    <>
                                      <div>
                                        <span>Category:</span> {item.animal_category || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Breed:</span> {item.animal_type || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Age:</span> {item.age || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Health Status:</span> {item.health_status || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Vaccine Status:</span> {item.vaccineStatus || 'N/A'}
                                      </div>
                                    </>
                                  )}
                                  {item.inferredType === 'Product' && (
                                    <>
                                      <div>
                                        <span>Category:</span> {item.product_category || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Type:</span> {item.product_type || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Expiration:</span> {item.expiration ? formatDate(item.expiration) : 'N/A'}
                                      </div>
                                    </>
                                  )}
                                  <div>
                                    <span>Quantity:</span> <span className="order-item-quantity">x{item.quantity}</span>
                                  </div>
                                  <div>
                                    <span>Price:</span> {item.price?.toFixed(2) || '0.00'} JD
                                  </div>
                                </div>
                                
                                {item.ownerDetails && (
                                  <div className="order-item-seller">
                                    <div className="seller-header">
                                      <img
                                        src={item.ownerDetails.profilePic || 'https://via.placeholder.com/30'}
                                        alt={`${item.ownerDetails.name}'s profile`}
                                        className="owner-pic"
                                      />
                                      <div>
                                        <h4>{item.inferredType === 'Animal' ? 'Owner' : 'Seller'}</h4>
                                        <button
                                          className="seller-link"
                                          onClick={() => handleOwnerClick(item.ownerId)}
                                        >
                                          {item.ownerDetails.name || 'Unknown'}
                                        </button>
                                      </div>
                                    </div>
                                    <div className="seller-info-grid">
                                      <div className="seller-info-item">
                                        <span><FontAwesomeIcon icon={faEnvelope} /> Email:</span>
                                        <a href={`mailto:${item.ownerDetails.email}`}>{item.ownerDetails.email || 'N/A'}</a>
                                      </div>
                                      <div className="seller-info-item">
                                        <span><FontAwesomeIcon icon={faPhone} /> Phone:</span>
                                        <a href={`tel:${item.ownerDetails.phone}`}>{item.ownerDetails.phone || 'N/A'}</a>
                                      </div>
                                      <div className="seller-info-item">
                                        <span>Location:</span> {item.ownerDetails.location || 'N/A'}
                                      </div>
                                      <div className="seller-info-item">
                                        <span>Available Days:</span> {item.ownerDetails.availableDays || 'N/A'}
                                      </div>
                                      <div className="seller-info-item">
                                        <span>Available Time:</span> {item.ownerDetails.availableHours || 'N/A'}
                                      </div>
                                      <div className="seller-info-item">
                                        <span>Delivery Method:</span> {item.ownerDetails.delivery_method || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="order-item-price">
                                  <div className="order-item-total">
                                    Total : {(item.price * item.quantity).toFixed(2)} JD
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-summary-container">
                          <div className="order-summary-item">
                            <div>Order Date:</div> {formatDate(order.orderDate)}
                          </div>
                          <div className="order-summary-item">
                            <div>Location:</div> {userLocation}
                          </div>
                          <div className="order-summary-item">
                            <div>Status:</div> {order.status}
                          </div>
                          <div className="order-summary-item">
                            <div>Subtotal:</div> {calculateSubtotal(order)} JD
                          </div>
                          <div className="order-summary-item">
                            <div>Delivery:</div> {order.includeDelivery ? '5.00 JD' : 'No Delivery Included'}
                          </div>
                          <div className="order-summary-item">
                            <div>Tip:</div> {order.tip?.toFixed(2) || '0.00'} JD
                          </div>
                        </div>

                        <div className="order-card-footer">
                          {order.status === 'Processing' && (
                            <div className="order-actions-123">
                              <button
                                className="order-cancel-button-456"
                                onClick={() => confirmCancel(order.orderId)}
                              >
                                Cancel Order
                              </button>
                              <button
                                className="order-pay-button-789"
                                onClick={() => confirmPay(order.orderId)}
                              >
                                Proceed to Pay
                              </button>
                            </div>
                          )}
                          {order.status === 'Shipped' && (
                            <div className="order-actions-123">
                              <button
                                className="order-confirm-delivery-button"
                                onClick={() => confirmDelivery(order.orderId)}
                              >
                                Confirm Delivery
                              </button>
                            </div>
                          )}
                          <div className="order-total-container">
                            <span>Total Amount:</span>
                            <span className="order-total-price">
                              {(parseFloat(calculateSubtotal(order)) + (order.tip || 0) + (order.includeDelivery ? 5 : 0)).toFixed(2)} JD
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'successful' && (
                <div className="order-section">
                  {successfulOrders.length === 0 ? (
                    <div className="order-empty-section">
                      <FontAwesomeIcon icon={faCheckCircle} className="order-section-icon" />
                      <p>No successful orders yet</p>
                    </div>
                  ) : (
                    successfulOrders.map((order) => (
                      <div key={order.orderId} className="order-card-item">
                        <div className="order-card-header">
                          <div className="order-id-number">Order #{order.orderId}</div>
                          <div className="order-status-container">
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                        </div>
                        <div className="order-details-container">
                          {order.orderItems.map((item) => (
                            <div key={item.orderItemId} className="order-item-detail">
                              <div className="item-image">
                                <img src={item.imageUrl} alt={item.name} />
                              </div>
                              <div className="order-item-info">
                                <h3 className="order-item-name">{item.name}</h3>
                                <div className="order-item-meta">
                                  <div>
                                    <span>Type:</span> {item.inferredType}
                                  </div>
                                  {item.inferredType === 'Animal' && (
                                    <>
                                      <div>
                                        <span>Category:</span> {item.animal_category || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Breed:</span> {item.animal_type || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Age:</span> {item.age || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Health Status:</span> {item.health_status || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Vaccine Status:</span> {item.vaccineStatus || 'N/A'}
                                      </div>
                                    </>
                                  )}
                                  {item.inferredType === 'Product' && (
                                    <>
                                      <div>
                                        <span>Category:</span> {item.product_category || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Type:</span> {item.product_type || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Expiration:</span> {item.expiration ? formatDate(item.expiration) : 'N/A'}
                                      </div>
                                    </>
                                  )}
                                  <div>
                                    <span>Quantity:</span> <span className="order-item-quantity">x{item.quantity}</span>
                                  </div>
                                  <div>
                                    <span>Price:</span> {item.price?.toFixed(2) || '0.00'} JD
                                  </div>
                                </div>
                                
                                {item.ownerDetails && (
                                  <div className="order-item-seller">
                                    <div className="seller-header">
                                      <img
                                        src={item.ownerDetails.profilePic || 'https://via.placeholder.com/30'}
                                        alt={`${item.ownerDetails.name}'s profile`}
                                        className="owner-pic"
                                      />
                                      <div>
                                        <h4>{item.inferredType === 'Animal' ? 'Owner' : 'Seller'}</h4>
                                        <div>
                                          <button
                                            className="seller-link"
                                            onClick={() => handleOwnerClick(item.ownerId)}
                                          >
                                            {item.ownerDetails.name || 'Unknown'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="seller-info-grid">
                                      <div className="seller-info-item">
                                        <div><FontAwesomeIcon icon={faEnvelope} /> Email:</div>
                                        <a href={`mailto:${item.ownerDetails.email}`}>{item.ownerDetails.email || 'N/A'}</a>
                                      </div>
                                      <div className="seller-info-item">
                                        <div><FontAwesomeIcon icon={faPhone} /> Phone:</div>
                                        <a href={`tel:${item.ownerDetails.phone}`}>{item.ownerDetails.phone || 'N/A'}</a>
                                      </div>
                                      <div className="seller-info-item">
                                        <div>Location:</div> {item.ownerDetails.location || 'N/A'}
                                      </div>
                                      <div className="seller-info-item">
                                        <div>Available Days:</div> {item.ownerDetails.availableDays || 'N/A'}
                                      </div>
                                      <div className="seller-info-item">
                                        <div>Available Time:</div> {item.ownerDetails.availableHours || 'N/A'}
                                      </div>
                                      <div className="seller-info-item">
                                        <div>Delivery Method:</div> {item.ownerDetails.delivery_method || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="order-item-price">
                                  <div className="order-item-total">
                                    Total : {(item.price * item.quantity).toFixed(2)} JD
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-summary-container">
                          <div className="order-summary-item">
                            <div>Order Date:</div> {formatDate(order.orderDate)}
                          </div>
                          <div className="order-summary-item">
                            <div>Location:</div> {userLocation}
                          </div>
                          <div className="order-summary-item">
                            <div>Status:</div> {order.status}
                          </div>
                          <div className="order-summary-item">
                            <div>Subtotal:</div> {calculateSubtotal(order)} JD
                          </div>
                          <div className="order-summary-item">
                            <div>Delivery:</div> {order.includeDelivery ? '5.00 JD' : 'No Delivery Included'}
                          </div>
                          <div className="order-summary-item">
                            <div>Tip:</div> {order.tip?.toFixed(2) || '0.00'} JD
                          </div>
                        </div>

                        <div className="order-card-footer">
                          <div className="order-total-container">
                            <span>Total Amount:</span>
                            <span className="order-total-price">
                              {(parseFloat(calculateSubtotal(order)) + (order.tip || 0) + (order.includeDelivery ? 5 : 0)).toFixed(2)} JD
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'canceled' && (
                <div className="order-section">
                  {canceledOrders.length === 0 ? (
                    <div className="order-empty-section">
                      <FontAwesomeIcon icon={faTimesCircle} className="order-section-icon" />
                      <p>No canceled orders</p>
                    </div>
                  ) : (
                    canceledOrders.map((order) => (
                      <div key={order.orderId} className="order-card-item">
                        <div className="order-card-header">
                          <div className="order-id-number">Order #{order.orderId}</div>
                          <div className="order-status-container">
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                        </div>
                        <div className="order-details-container">
                          {order.orderItems.map((item) => (
                            <div key={item.orderItemId} className="order-item-detail">
                              <div className="item-image">
                                <img src={item.imageUrl} alt={item.name} />
                              </div>
                              <div className="order-item-info">
                                <h3 className="order-item-name">{item.name}</h3>
                                <div className="order-item-meta">
                                  <div>
                                    <span>Type:</span> {item.inferredType}
                                  </div>
                                  {item.inferredType === 'Animal' && (
                                    <>
                                      <div>
                                        <span>Category:</span> {item.animal_category || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Breed:</span> {item.animal_type || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Age:</span> {item.age || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Health Status:</span> {item.health_status || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Vaccine Status:</span> {item.vaccineStatus || 'N/A'}
                                      </div>
                                    </>
                                  )}
                                  {item.inferredType === 'Product' && (
                                    <>
                                      <div>
                                        <span>Category:</span> {item.product_category || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Type:</span> {item.product_type || 'N/A'}
                                      </div>
                                      <div>
                                        <span>Expiration:</span> {item.expiration ? formatDate(item.expiration) : 'N/A'}
                                      </div>
                                    </>
                                  )}
                                  <div>
                                    <span>Quantity:</span> <span className="order-item-digit">x{item.quantity}</span>
                                  </div>
                                  <div>
                                    <span>Price:</span> {item.price?.toFixed(2) || '0.00'} JD
                                  </div>
                                </div>
                                
                                {item.ownerDetails && (
                                  <div className="order-item-seller">
                                    <div className="seller-header">
                                      <img
                                        src={item.ownerDetails.profilePic || 'https://via.placeholder.com/30'}
                                        alt={`${item.ownerDetails.name}'s profile`}
                                        className="owner-pic"
                                      />
                                      <div>
                                        <h4>{item.inferredType === 'Animal' ? 'Owner' : 'Seller'}</h4>
                                        <div>
                                          <button
                                            className="seller-link"
                                            onClick={() => handleOwnerClick(item.ownerId)}
                                          >
                                            {item.ownerDetails.name || 'Unknown'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="seller-info-grid">
                                      <div className="seller-info-item">
                                        <div><FontAwesomeIcon icon={faEnvelope} /> Email:</div>
                                        <a href={`mailto:${item.ownerDetails.email}`}>{item.ownerDetails.email || 'N/A'}</a>
                                      </div>
                                      <div className="seller-info-item">
                                        <div><FontAwesomeIcon icon={faPhone} /> Phone:</div>
                                        <a href={`tel:${item.ownerDetails.phone}`}>{item.ownerDetails.phone || 'N/A'}</a>
                                      </div>
                                      <div className="seller-info-item">
                                        <div>Location:</div> {item.ownerDetails.location || 'N/A'}
                                      </div>
                                      <div className="seller-info-item">
                                        <div>Available Days:</div> {item.ownerDetails.days || 'N/A'}
                                      </div>
                                      <div className="seller-info-item">
                                        <div>Available Time:</div> {item.ownerDetails.hours || 'N/A'}
                                      </div>
                                      <div className="seller-info-item">
                                        <div>Delivery Method:</div> {item.ownerDetails.method || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="order-item-price">
                                  <div className="item-total">
                                    Total : {(item.price * item.quantity).toFixed(2)} JD
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-summary-container">
                          <div className="order-item">
                            <div>Order Date:</div> {formatDate(order.orderDate)}
                          </div>
                          <div className="order-item">
                            <div>Location:</div> {userLocation}
                          </div>
                          <div className="order-item">
                            <div>Status:</div> {order.status}
                          </div>
                          <div className="order-item">
                            <div>Subtotal:</div> {calculateSubtotal(order)} JD
                          </div>
                          <div className="order-item">
                            <div>Delivery:</div> {order.includeDelivery ? '5.00 JD' : 'No Delivery Included'}
                          </div>
                          <div className="order-item">
                            <div>Tip:</div> {order.tip?.toFixed(2) || '0.00'} JD
                          </div>
                        </div>

                        <div className="order-card-footer">
                          <div className="order-total-container">
                            <span>Total Amount:</span>
                            <span className="order-total">
                              {(parseFloat(calculateSubtotal(order)) + (order.tip || 0) + (order.includeDelivery ? 5 : 0)).toFixed(2)} JD
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        action={modalAction}
        orderId={selectedOrderId}
      />
      <Footer />
    </>
  );
};

export default OrdersPage;