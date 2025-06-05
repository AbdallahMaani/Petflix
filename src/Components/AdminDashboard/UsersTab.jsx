import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronDown, faChevronUp, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import axios from 'axios';

const UsersTab = ({ users, carts, orders, onDelete, onDeleteCart, setSuccessMessage, setErrorMessage, allProducts = [], allAnimals = [] }) => {
  const [expandedUserIds, setExpandedUserIds] = useState([]);
  const [activeTab, setActiveTab] = useState({});
  const [itemDetails, setItemDetails] = useState({}); // { [itemId_itemType]: { name, price, type } }
  const [deletingId, setDeletingId] = useState(null);
  const [deletingCartId, setDeletingCartId] = useState(null);

  // Helper to get item details from allProducts and allAnimals
  const getItemInfo = (itemId, itemType) => {
    if (!itemId || !itemType) return { name: 'N/A', price: 0, type: itemType || 'N/A' };
    if (itemType === 'Product') {
      const prod = allProducts.find(p => p.product_id === itemId);
      return prod
        ? { name: prod.product_title, price: prod.product_new_price, type: 'Product' }
        : { name: 'Product #' + itemId, price: 0, type: 'Product' };
    }
    if (itemType === 'Animal') {
      const animal = allAnimals.find(a => a.animal_id === itemId);
      return animal
        ? { name: animal.animal_title, price: animal.animal_new_price, type: 'Animal' }
        : { name: 'Animal #' + itemId, price: 0, type: 'Animal' };
    }
    return { name: 'N/A', price: 0, type: itemType };
  };

  // Preload item details for all cart and order items
  useEffect(() => {
    const details = {};
    // Cart items
    Object.values(carts).forEach(cart => {
      cart.cartItems?.forEach(item => {
        const key = `${item.itemId}_${item.itemType}`;
        if (!details[key]) {
          details[key] = getItemInfo(item.itemId, item.itemType);
        }
      });
    });
    // Order items
    Object.values(orders).forEach(userOrders => {
      userOrders?.forEach(order => {
        order.orderItems?.forEach(item => {
          const key = `${item.itemId}_${item.itemType || 'Product'}`;
          if (!details[key]) {
            details[key] = getItemInfo(item.itemId, item.itemType || 'Product');
          }
        });
      });
    });
    setItemDetails(details);
    // eslint-disable-next-line
  }, [carts, orders, allProducts, allAnimals]);

  const toggleExpand = (userId) => {
    setExpandedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
    if (!activeTab[userId]) {
      setActiveTab(prev => ({ ...prev, [userId]: 'Cart' }));
    }
  };

  const switchTab = (userId, tab) => {
    setActiveTab(prev => ({ ...prev, [userId]: tab }));
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
  };

  const handleDeleteCartClick = (cartId) => {
    setDeletingCartId(cartId);
  };

  const confirmDelete = async (type, id) => {
    try {
      await onDelete(type, id);
      setSuccessMessage('User deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(`Failed to delete user: ${err.message}`);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDeleteCart = async (userId, cartId) => {
    try {
      await onDeleteCart(userId, cartId);
      setSuccessMessage('Cart deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(`Failed to delete cart: ${err.message}`);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setDeletingCartId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
    setDeletingCartId(null);
  };

  return (
    <div className="petflix-dashboard-tab">
      <h2 className="petflix-dashboard-section-title">Manage Users</h2>
      <div className="petflix-dashboard-table-container">
        <table className="petflix-dashboard-table">
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <React.Fragment key={user.userId}>
                <tr>
                  <td>
                    <button
                      className="petflix-dashboard-expand-arrow"
                      onClick={() => toggleExpand(user.userId)}
                      aria-label={expandedUserIds.includes(user.userId) ? "Collapse details" : "Expand details"}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <FontAwesomeIcon icon={expandedUserIds.includes(user.userId) ? faChevronUp : faChevronDown} />
                    </button>
                  </td>
                  <td>{user.userId}</td>
                  <td>{user.username}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.location}</td>
                  <td>
                    {deletingId === user.userId ? (
                      <div className="petflix-dashboard-confirm-delete">
                        <button
                          onClick={() => confirmDelete('User', user.userId)}
                          className="petflix-feedback-save-response-btn"
                        >
                          <FontAwesomeIcon icon={faSave} /> Confirm
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="petflix-feedback-cancel-response-btn"
                          style={{ width: '6.35rem', marginLeft: '1rem' }}
                        >
                          <FontAwesomeIcon icon={faTimes} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteClick(user.userId)}
                        className="petflix-dashboard-delete-button"
                        title="Delete User"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
                {expandedUserIds.includes(user.userId) && (
                  <tr>
                    <td colSpan="7">
                      <div className="petflix-dashboard-user-details">
                        <div className="petflix-dashboard-tabs">
                          <button
                            className={`petflix-dashboard-tab-button ${activeTab[user.userId] === 'Cart' ? 'active' : ''}`}
                            onClick={() => switchTab(user.userId, 'Cart')}
                          >
                            Cart
                          </button>
                          <button
                            className={`petflix-dashboard-tab-button ${activeTab[user.userId] === 'Orders' ? 'active' : ''}`}
                            onClick={() => switchTab(user.userId, 'Orders')}
                          >
                            Orders
                          </button>
                          <button
                            className={`petflix-dashboard-tab-button ${activeTab[user.userId] === 'Details' ? 'active' : ''}`}
                            onClick={() => switchTab(user.userId, 'Details')}
                          >
                            User Details
                          </button>
                        </div>
                        {activeTab[user.userId] === 'Cart' && (
                          <div className="petflix-dashboard-cart-container">
                            {carts[user.userId] && carts[user.userId].cartItems?.length > 0 ? (
                              <>
                                <h4 className="petflix-dashboard-subsection-title">Cart ID: {carts[user.userId].cartId}</h4>
                                <table className="petflix-dashboard-inner-table">
                                  <thead>
                                    <tr>
                                      <th>Cart Item ID</th>
                                      <th>Item ID</th>
                                      <th>Name</th>
                                      <th>Type</th>
                                      <th>Price</th>
                                      <th>Quantity</th>
                                      <th>Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {carts[user.userId].cartItems.map(item => {
                                      const key = `${item.itemId}_${item.itemType}`;
                                      const info = itemDetails[key] || {};
                                      const total = (info.price || 0) * item.quantity;
                                      return (
                                        <tr key={item.cartItemId}>
                                          <td>{item.cartItemId}</td>
                                          <td>{item.itemId}</td>
                                          <td>{info.name}</td>
                                          <td>{info.type}</td>
                                          <td>{info.price} JD</td>
                                          <td>{item.quantity}</td>
                                          <td>{total} JD</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                                {deletingCartId === carts[user.userId].cartId ? (
                                  <div className="petflix-dashboard-confirm-delete"
                                  style={{marginTop:'1rem'}}
                                  >
                                    <button
                                      onClick={() => confirmDeleteCart(user.userId, carts[user.userId].cartId)}
                                      className="petflix-feedback-save-response-btn"
                                    >
                                      <FontAwesomeIcon icon={faSave} /> Confirm
                                    </button>
                                    <button
                                      onClick={cancelDelete}
                                      className="petflix-feedback-cancel-response-btn"
                                      style={{width:'6.35rem' , marginLeft:'1rem'}}
                                    >
                                      <FontAwesomeIcon icon={faTimes} /> Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteCartClick(carts[user.userId].cartId)}
                                    className="petflix-dashboard-delete-button"
                                    style={{ marginTop: '1rem' }}
                                  >
                                    <FontAwesomeIcon icon={faTrash} /> Delete Cart
                                  </button>
                                )}
                              </>
                            ) : (
                              <p className="petflix-dashboard-no-data">No cart items</p>
                            )}
                          </div>
                        )}
                        {activeTab[user.userId] === 'Orders' && (
                          <div className="petflix-dashboard-orders-container">
                            {orders[user.userId]?.length > 0 ? (
                              <table className="petflix-dashboard-inner-table">
                                <thead>
                                  <tr>
                                    <th>Order ID</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Delivery</th>
                                    <th>Tip</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orders[user.userId].map(order => {
                                    let orderTotal = 0;
                                    order.orderItems.forEach(item => {
                                      const key = `${item.itemId}_${item.itemType || 'Product'}`;
                                      const info = itemDetails[key] || {};
                                      orderTotal += (info.price || 0) * item.quantity;
                                    });
                                    return (
                                      <tr key={order.orderId}>
                                        <td>{order.orderId}</td>
                                        <td>{order.status}</td>
                                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td>{order.includeDelivery ? 'Yes' : 'No'}</td>
                                        <td>{order.tip} JD</td>
                                        <td>
                                          <table className="petflix-dashboard-inner-table petflix-dashboard-order-items-table">
                                            <thead>
                                              <tr>
                                                <th>Order Item ID</th>
                                                <th>Item ID</th>
                                                <th>Name</th>
                                                <th>Type</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Total</th>
                                                <th>Owner ID</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {order.orderItems.map(item => {
                                                const key = `${item.itemId}_${item.itemType || 'Product'}`;
                                                const info = itemDetails[key] || {};
                                                const total = (info.price || 0) * item.quantity;
                                                return (
                                                  <tr key={item.orderItemId}>
                                                    <td>{item.orderItemId}</td>
                                                    <td>{item.itemId}</td>
                                                    <td>{info.name}</td>
                                                    <td>{info.type}</td>
                                                    <td>{info.price} JD</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{total} JD</td>
                                                    <td>{item.ownerId}</td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          </table>
                                        </td>
                                        <td>{orderTotal} JD</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            ) : (
                              <p className="petflix-dashboard-no-data">No orders</p>
                            )}
                          </div>
                        )}
                        {activeTab[user.userId] === 'Details' && (
                          <div className="petflix-dashboard-user-details-container">
                            <h4 className="petflix-dashboard-subsection-title">User Details</h4>
                            <table className="petflix-dashboard-inner-table">
                              <tbody>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Username:</td>
                                  <td>{user.username}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Name:</td>
                                  <td>{user.name}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Email:</td>
                                  <td>{user.email}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Location:</td>
                                  <td>{user.location}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Delivery Method:</td>
                                  <td>{user.delivery_method || 'N/A'}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Gender:</td>
                                  <td>{user.gender === 0 ? 'Male' : user.gender === 1 ? 'Female' : 'Other'}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Phone:</td>
                                  <td>{user.phone || 'N/A'}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Birthday:</td>
                                  <td>{user.birthDay ? new Date(user.birthDay).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Available Days:</td>
                                  <td>{user.availableDays || 'N/A'}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Available Hours:</td>
                                  <td>{user.availableHours || 'N/A'}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Rating:</td>
                                  <td>{user.rating ? user.rating.toFixed(1) : 'N/A'}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Bio:</td>
                                  <td>{user.bio || 'N/A'}</td>
                                </tr>
                                <tr>
                                  <td className="petflix-dashboard-user-details-label">Profile Picture:</td>
                                  <td>
                                    {user.profilePic ? (
                                      <a href={user.profilePic} target="_blank" rel="noopener noreferrer">
                                        <img
                                          src={user.profilePic}
                                          alt={`${user.username}'s profile`}
                                          className="petflix-dashboard-user-profile-pic"
                                        />
                                      </a>
                                    ) : (
                                      <span>N/A</span>
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;