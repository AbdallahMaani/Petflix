import React, { useState, useEffect, forwardRef } from 'react';
import '../Popular/Popular.css';
import Item from '../Item/Item';
import axios from 'axios';

const Popular2 = forwardRef((props, ref) => {
  const [products, setProducts] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5024/api/Products');
        const allProducts = response.data;
        const totalProducts = allProducts.length;
        const startIndex = Math.max(0, totalProducts - 8);
        const slicedProducts = allProducts.slice(startIndex);
        setProducts(slicedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className='popular' ref={ref}>
        <h1 className='popular-h1'>BEST DEAL NOW ON PRODUCTS</h1>
        <hr />
     <div className="clinics-loading" style={{marginBottom:'5rem'}}>Loading Products ...</div>
     </div>
    )
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

  return (
    <div className='popular' ref={ref}>
      <h1 className='popular-h1'>MOST POPULAR IN PRODUCTS</h1>
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

export default Popular2;