import React, { useState, useEffect, forwardRef } from 'react';
import '../Components/Popular/Popular.css';
import Item from '../Components/Item/Item.jsx';
import axios from 'axios';

const MadeForYouProduct = forwardRef((props, ref) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://petflix-backend-620z.onrender.com/api/Products');
        const allProducts = response.data;
        const totalProducts = allProducts.length;
        const startIndex = Math.max(0, totalProducts - 8); // Get the last 8 products
        const slicedProducts = allProducts.slice(startIndex);
        setProducts(slicedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser) {
          const userResponse = await axios.get(`https://petflix-backend-620z.onrender.com/api/User/${loggedInUser.userId}`);
          setUser(userResponse.data);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err);
      }
    };

    fetchProducts();
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className='popular'>
        <h1 className='popular-h1'>Made For Your Pet</h1>
        <hr />
        <div className="clinics-loading">Loading Products ...</div>
      </div>
    );
  }

  if (error) {
    let message = error.message;

    if (error.response) {
      message = `Error: ${error.response.status} - ${error.response.data.message || error.message}`;
    } else if (error.request) {
      message = "No Connection to the server try connecting to the internet";
    } else {
      message = `Error: ${error.message}`;
    }

    return (
      <div className="error-overlay show">
        <div className="error-message">
          {message}
          <p>"Failed to fetch"</p>
        </div>
      </div>
    );
  }

  const firstName = user ? user.name.split(' ')[0] : '';

  return (
    <div className='popular' ref={ref}>
      <h1 className='popular-h1'>Made For Your Pet {firstName}</h1>
      <hr/>
      <div className="popular-item">
        {products.map((product) => (
          <Item
            key={product.product_id}
            {...product}
          />
        ))}
      </div>
    </div>
  );
});

export default MadeForYouProduct;