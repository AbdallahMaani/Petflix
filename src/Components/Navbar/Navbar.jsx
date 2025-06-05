import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCircleInfo, faHouse, faPaw, faUser, faLayerGroup, faHandHoldingHeart, faSignOutAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import logo from '../Assets/PetFlix_logo.png';
import axios from 'axios';
import Popup from '../Popup/Popup.jsx'; // Import Popup component
import Portal from '../Navbar/Protal.jsx'; 

export const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility
  const [selectedItem, setSelectedItem] = useState(null); // State for selected item
  const [reviews, setReviews] = useState([]); // State for reviews
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  let lastScrollY = 0;

  const fetchCartCount = useCallback(async (userId) => {
    if (userId) {
      try {
        const response = await axios.get(`http://localhost:5024/api/Carts/${userId}`);
        setCartItemCount(response.data.cartItems.length);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    } else {
      setCartItemCount(0);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setUserData(user);
      fetchCartCount(user.userId); // Fetch cart count on login
    } else {
      setIsLoggedIn(false);
      setUserData(null);
      setCartItemCount(0);
    }
  }, [fetchCartCount]);

  useEffect(() => {
    if (userData?.userId) {
      fetchCartCount(userData.userId);
    }
  }, [userData, fetchCartCount]);

  // Fetch latest user data from the database if logged in
  useEffect(() => {
    const fetchLatestUserData = async () => {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        try {
          const response = await axios.get(`http://localhost:5024/api/User/${user.userId}`);
          const updatedUser = { ...user, ...response.data };
          setUserData(updatedUser);
          localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Error fetching latest user data:', error);
        }
      }
    };
    fetchLatestUserData();
  }, [isLoggedIn]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.className = darkMode ? '' : 'dark-mode';
  };

  const handleMenuClick = (page) => {
    setMenu(page);

    if (page === "myprofile" && !isLoggedIn) {
      navigate('/noaccount', { state: { from: location } });
    } else {
      navigate(`/${page === "home" ? "" : page}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY);
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setIsLoggedIn(false);
    setUserData(null);
    setCartItemCount(0);
    navigate('/login');
  };

  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate('/cart');
    } else {
      navigate('/noaccount', { state: { from: location } });
    }
  };

 const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      setIsSearching(true);
      fetchSearchResults(query);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const fetchSearchResults = async (query) => {
    try {
      const [usersResponse, animalsResponse, productsResponse] = await Promise.all([
        axios.get(`http://localhost:5024/api/User?search=${query}`),
        axios.get(`http://localhost:5024/api/Animals?search=${query}`),
        axios.get(`http://localhost:5024/api/Products?search=${query}`),
      ]);

      setSearchResults([
        ...usersResponse.data
          .filter(user => user.name.toLowerCase().includes(query.toLowerCase()))
          .map(user => ({ ...user, type: 'user' })),
        ...animalsResponse.data
          .filter(animal => animal.animal_title.toLowerCase().includes(query.toLowerCase()))
          .map(animal => ({ ...animal, type: 'animal' })),
        ...productsResponse.data
          .filter(product => product.product_title.toLowerCase().includes(query.toLowerCase()))
          .map(product => ({ ...product, type: 'product' })),
      ]);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = async (result) => {
    setSearchQuery('');
    setSearchResults([]);

    try {
      if (result.type === 'user') {
        navigate('/myprofile', { state: { ownerId: result.userId } });
      } else {
        // Fetch full item details for animals or products
        const endpoint = result.type === 'animal'
          ? `http://localhost:5024/api/Animals/${result.animal_id}`
          : `http://localhost:5024/api/Products/${result.product_id}`;
        const response = await axios.get(endpoint);
        const fullItemData = response.data;

        // Fetch reviews for the item (assuming products have reviews)
        let reviewsData = [];
        if (result.type === 'product') {
          try {
            const reviewsResponse = await axios.get(`http://localhost:5024/api/PR_/product/${result.product_id}`);
            reviewsData = reviewsResponse.data;
          } catch (reviewErr) {
            console.error('Error fetching reviews:', reviewErr);
          }
        }

        setSelectedItem({
          ...fullItemData,
          itemType: result.type === 'animal' ? 'Animal' : 'Product', // Match Popup.jsx expected itemType
        });
        setReviews(reviewsData);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Error fetching item details:", err);
      setSelectedItem(result); // Fallback to basic result data
      setReviews([]);
      setShowPopup(true);
    }
  };


  const closePopup = () => {
    setShowPopup(false);
    setSelectedItem(null);
    setReviews([]);
  };

  return (
    <div className={`navbar ${darkMode ? 'dark-navbar' : ''} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="nav-logo">
        <img
          src={logo}
          alt="logo"
          onClick={() => {
            navigate("/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      <div className="nav-search">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {isSearching && <div className="search-loading">Searching...</div>}
        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((result, index) => (
              <li key={index} onClick={() => handleSearchResultClick(result)}>
                {result.type === "user" && (
                  <div>
                    <strong>User :</strong> {result.name}
                  </div>
                )}
                {result.type === "animal" && (
                  <div>
                    <strong>Animal :</strong> {result.animal_title}
                  </div>
                )}
                {result.type === "product" && (
                  <div>
                    <strong>Product :</strong> {result.product_title}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="nav-menu">
        <li onClick={() => handleMenuClick("home")}>
          <FontAwesomeIcon icon={faHouse} /> Home {menu === "home" && <hr />}
        </li>
        <li onClick={() => handleMenuClick("animals")}>
          <FontAwesomeIcon icon={faPaw} /> Animals {menu === "animals" && <hr />}
        </li>
        <li onClick={() => handleMenuClick("myprofile")}>
          {userData?.profilePic && isLoggedIn ? (
            <img src={userData.profilePic} alt="My profile" className="profile-pic-nav" />
          ) : (
            <FontAwesomeIcon icon={faUser} style={{ marginRight: "5px" }} />
          )}
          <span style={{ fontWeight: "800", fontSize: "1.08rem", marginTop: ".1rem", verticalAlign: "middle" }}>
            {isLoggedIn ? userData?.name?.split(" ")[0] : "My Profile"}
          </span>
          {menu === "myprofile" && <hr />}
        </li>
        <li onClick={() => handleMenuClick("products")}>
          <FontAwesomeIcon icon={faLayerGroup} /> Products {menu === "products" && <hr />}
        </li>
        <li onClick={() => handleMenuClick("petguide")}>
          <FontAwesomeIcon icon={faHandHoldingHeart} /> Pet Guide {menu === "petguide" && <hr />}
        </li>
      </ul>

      <div className="dark-mode-switch">
        <label htmlFor="dark-mode-toggle">Dark Mode</label>
        <div className="switch">
          <input
            type="checkbox"
            id="dark-mode-toggle"
            checked={darkMode}
            onChange={toggleDarkMode}
          />
          <span className="slider"></span>
        </div>
      </div>

      <div className="nav-login-cart">
        <FontAwesomeIcon
          icon={faCircleInfo}
          onClick={() => navigate("/about")}
          className={`icon ${darkMode ? "dark-mode" : "light-mode"}`}
        />
        <FontAwesomeIcon
          icon={faCartShopping}
          onClick={handleCartClick}
          className={`icon ${darkMode ? "dark-mode" : "light-mode"}`}
        />
        <div className="nav-cart-count">{cartItemCount}</div>
        {isLoggedIn ? (
          <div className="logged-in-user">
            <button onClick={handleLogout}>
               Logout
            </button>
          </div>
        ) : (
          <button onClick={() => navigate("/login")}>Login</button>
        )}
      </div>

      {/* Popup Modal */}
      {showPopup && selectedItem && (
        <Portal>
          <Popup
            name={selectedItem.animal_title || selectedItem.product_title || selectedItem.name}
            closePopup={closePopup}
            handleRating={() => {}}
            toggleFavorite={() => {}}
            isFavorite={false}
            itemId={selectedItem.animal_id || selectedItem.product_id || selectedItem.itemId}
            addToCart={() => {}}
            itemType={selectedItem.itemType}
            animal_pic={selectedItem.animal_pic || selectedItem.imageUrl}
            product_pic={selectedItem.product_pic || selectedItem.imageUrl}
            animal_new_price={selectedItem.animal_new_price || selectedItem.price}
            product_new_price={selectedItem.product_new_price || selectedItem.price}
            animal_description={selectedItem.animal_description || selectedItem.description}
            product_description={selectedItem.product_description || selectedItem.description}
            reviews={reviews}
          />
        </Portal>
      )}
    </div>
  );
};

export default Navbar;