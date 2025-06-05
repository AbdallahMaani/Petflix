import React from 'react';

const RelatedItemsSection = ({ relatedAnimals, relatedProducts, handleRelatedItemClick, popupContentRef }) => {
  return (
    <div className="popup-reviews">
      <h1>You Also May Like :</h1>
      <div className="related-products">
        <div className="related-section">
          <h2>Related Animals :</h2>
          {relatedAnimals.map((animal) => (
            <div key={animal.animal_title} className="related-product-item">
              <img src={animal.animal_pic} alt={animal.animal_title} className="related-product-image" />
              <div className="related-product-info">
                <h6>{animal.animal_title}</h6>
                <p>{animal.animal_new_price} JD</p>
                <button
                  className="view-related-btn"
                  onClick={() => {
                    handleRelatedItemClick(animal.animal_title);
                    popupContentRef.current.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="related-section">
          <h2>Related Products :</h2>
          {relatedProducts.map((product) => (
            <div key={product.product_title} className="related-product-item">
              <img src={product.product_pic} alt={product.product_title} className="related-product-image" />
              <div className="related-product-info">
                <h6>{product.product_title}</h6>
                <p>{product.product_new_price} JD</p>
                <button
                  className="view-related-btn"
                  onClick={() => {
                    handleRelatedItemClick(product.product_title);
                    popupContentRef.current.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedItemsSection;