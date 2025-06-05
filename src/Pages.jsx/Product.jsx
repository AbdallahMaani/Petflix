import React, { useState, useEffect } from 'react';
import ProductsContext from '../Context/ProdcutsContext.jsx';
import BestDeal from '../Context/BestDeal_ProductContext.jsx';
import MadeForYouProduct from '../Context/MadeForYouProduct.jsx';
import AddProduct from '../Components/AddItems/AddProduct.jsx';
import ProductAd from '../Components/Ads.jsx/ProductAd.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faCirclePlus } from '@fortawesome/free-solid-svg-icons'; // Import faCirclePlus
import NoAccount from './NoAccount.jsx'; // Import NoAccount component
import Footer from '../Components/Footer/Footer.jsx';

export const Products = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  useEffect(() => {
    // Check if the user is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollBottom = documentHeight - (scrollTop + windowHeight);

      setShowFloatingButton(scrollBottom > 180);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div className="products-container">
        {/* Best Deal Section */}
        <ProductAd />
        <BestDeal />
        <MadeForYouProduct />

        {showAddProduct && (
          <div className="popup-overlay">
            <div className="popup-content">
            <button className="close-btn" onClick={() => setShowAddProduct(false)}>
              <FontAwesomeIcon icon={faCircleXmark} size="xl" style={{ color: "#ffffff" }} />
            </button>
              {isLoggedIn ? <AddProduct /> : <NoAccount />} {/* Conditionally render AddProduct or NoAccount */}
            </div>
          </div>
        )}

        {/* Products Context */}
        <ProductsContext />
        {showFloatingButton && (
          <button
          className={`floating-button ${showFloatingButton ? '' : 'hidden'}`}
          onClick={() => setShowAddProduct(true)}
        >
          <FontAwesomeIcon icon={faCirclePlus} size="2xl" style={{ color: "#ffffff", marginRight: '8px' }} />
          Add Your Product
        </button>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Products;