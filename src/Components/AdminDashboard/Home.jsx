import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import UsersTab from './UsersTab';
import AnimalsTab from './AnimalsTab.jsx';
import ProductsTab from './ProductsTab';
import FeedbackTab from './FeedbackTab';
import ReportTab from './ReportTab.jsx';
import './Dashboard.css';

const Home = ({ 
  users, 
  animals, 
  products, 
  feedbacks, 
  setFeedbacks,
  animalReviews, 
  productReviews, 
  carts, 
  orders,
  onDelete,
  onDeleteReview,
  onDeleteCart
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotAdminPopup, setShowNotAdminPopup] = useState(false);
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const latestUser = users?.find(u => u.userId === currentUser?.userId) || currentUser;

  useEffect(() => {
    if (!currentUser || currentUser.isAdmin !== true) {
      setShowNotAdminPopup(true);
      setTimeout(() => {
        localStorage.removeItem('loggedInUser');
        navigate('/login');
      }, 3000);
    }
  }, [currentUser, navigate]);

  // Fetch reports on component mount and when switching to reports tab
  useEffect(() => {
    fetchReports();
  }, []); // Empty dependency array to fetch on mount

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const response = await fetch('http://localhost:5024/api/Report');
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
      setErrorMessage(error.message || 'Failed to fetch reports');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Clear messages when switching tabs
  useEffect(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, [activeTab]);

  if (!currentUser || currentUser.isAdmin !== true) {
    return (
      <div className="petflix-not-admin-popup">
        <div className="petflix-not-admin-popup-content">
          <p>You are not authorized to access the admin dashboard.</p>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="petflix-dashboard-container">
      <div className="petflix-dashboard-topbar">
        <div className="petflix-dashboard-brand">
          <h1>Petflix Admin Dashboard</h1>
        </div>
        
        <div className="petflix-dashboard-user-profile">
          <button 
            className="petflix-profile-button"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <FontAwesomeIcon icon={faUserCircle} className="petflix-profile-icon" />
            <span className="petflix-profile-name">{latestUser.name}</span>
          </button>
          
          {showProfileDropdown && (
            <div className="petflix-profile-dropdown">
              <div className="petflix-profile-info">
                <FontAwesomeIcon icon={faUserCircle} className="petflix-dropdown-icon" />
                <div>
                  <p className="petflix-profile-email">{currentUser.email}</p>
                  <p className="petflix-profile-role">Administrator</p>
                </div>
              </div>
              <button 
                className="petflix-logout-button"
                onClick={() => {
                  localStorage.removeItem('loggedInUser');
                  navigate('/login');
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {(errorMessage || successMessage) && (
        <div
          className={successMessage ? 'succsess-message' : 'error-message2'}
          style={{ width: '27%', margin: '0 auto 1.5rem auto', textAlign: 'center' }}
        >
          {successMessage || errorMessage}
        </div>
      )}
      
      <nav className="petflix-dashboard-nav">
        <button 
          className={`petflix-dashboard-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`petflix-dashboard-nav-link ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`petflix-dashboard-nav-link ${activeTab === 'animals' ? 'active' : ''}`}
          onClick={() => setActiveTab('animals')}
        >
          Animals
        </button>
        <button 
          className={`petflix-dashboard-nav-link ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`petflix-dashboard-nav-link ${activeTab === 'feedbacks' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedbacks')}
        >
          Feedbacks
        </button>
        <button 
          className={`petflix-dashboard-nav-link ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </nav>

      <div className="petflix-dashboard-content">
        {activeTab === 'overview' && (
          <div className="petflix-dashboard-overview">
            <h2 className="petflix-dashboard-section-title">Dashboard Overview</h2>
            <div className="petflix-grid">
              <div className="petflix-dashboard-card petflix-card-bg-blue">
                <h3 className="petflix-dashboard-card-title">Total Users</h3>
                <p className="petflix-dashboard-card-value">{users.filter(u => !u.isAdmin).length}</p>
              </div>
              <div className="petflix-dashboard-card petflix-card-bg-indigo">
                <h3 className="petflix-dashboard-card-title">Total Admins</h3>
                <p className="petflix-dashboard-card-value">{users.filter(u => u.isAdmin).length}</p>
              </div>
              <div className="petflix-dashboard-card petflix-card-bg-green">
                <h3 className="petflix-dashboard-card-title">Total Animals</h3>
                <p className="petflix-dashboard-card-value">{animals.length}</p>
              </div>
              <div className="petflix-dashboard-card petflix-card-bg-yellow">
                <h3 className="petflix-dashboard-card-title">Total Products</h3>
                <p className="petflix-dashboard-card-value">{products.length}</p>
              </div>
              <div className="petflix-dashboard-card petflix-card-bg-purple">
                <h3 className="petflix-dashboard-card-title">Total Feedbacks</h3>
                <p className="petflix-dashboard-card-value">{feedbacks.length}</p>
              </div>
              <div className="petflix-dashboard-card petflix-card-bg-pink">
                <h3 className="petflix-dashboard-card-title">Reports</h3>
                <p className="petflix-dashboard-card-value">
                  {isLoadingReports ? 'Loading...' : reports.length}
                </p>
              </div>
              <div className="petflix-dashboard-card petflix-card-bg-teal">
                <h3 className="petflix-dashboard-card-title">Animal Reviews</h3>
                <p className="petflix-dashboard-card-value">{animalReviews.length}</p>
              </div>
              <div className="petflix-dashboard-card petflix-card-bg-orange">
                <h3 className="petflix-dashboard-card-title">Product Reviews</h3>
                <p className="petflix-dashboard-card-value">{productReviews.length}</p>
              </div>
              <div className="petflix-dashboard-card petflix-card-bg-blue">
                <h3 className="petflix-dashboard-card-title">Unchecked Feedbacks</h3>
                <p className="petflix-dashboard-card-value">{feedbacks.filter(fb => fb.status !== 'Resolved').length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UsersTab 
            users={users} 
            carts={carts} 
            orders={orders} 
            onDelete={onDelete}
            onDeleteCart={onDeleteCart}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />
        )}

        {activeTab === 'animals' && (
          <AnimalsTab 
            animals={animals} 
            animalReviews={animalReviews} 
            onDelete={onDelete}
            onDeleteReview={onDeleteReview}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab 
            products={products} 
            productReviews={productReviews} 
            onDelete={onDelete}
            onDeleteReview={onDeleteReview}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />
        )}

        {activeTab === 'feedbacks' && (
          <FeedbackTab 
            feedbacks={feedbacks} 
            setFeedbacks={setFeedbacks}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />
        )}

        {activeTab === 'reports' && (
          <ReportTab 
            reports={reports} 
            setReports={setReports}
            onReportsUpdated={fetchReports}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />
        )}
      </div>
    </div>
  );
};

export default Home;