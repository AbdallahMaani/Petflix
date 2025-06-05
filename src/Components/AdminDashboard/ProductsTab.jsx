import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronDown, faChevronUp, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import axios from 'axios';

const ProductsTab = ({ products, productReviews, onDelete, onDeleteReview, setSuccessMessage, setErrorMessage }) => {
  const [expandedProductIds, setExpandedProductIds] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  useEffect(() => {
    const userIds = new Set();
    products.forEach(product => {
      const ownerId = product.ownerId || product.userId;
      if (ownerId) userIds.add(ownerId);
    });
    productReviews.forEach(review => {
      if (review.reviewerId) userIds.add(review.reviewerId);
    });

    const idsToFetch = Array.from(userIds).filter(id => !userNames[id]);
    if (idsToFetch.length === 0) return;

    const fetchNames = async () => {
      try {
        const responses = await Promise.all(
          idsToFetch.map(id =>
            axios.get(`‏https://localhost:7007/api/User/${id}`).then(res => ({
              id,
              name: res.data.name || res.data.username || `User ${id}`,
            })).catch(() => ({
              id,
              name: `User ${id}`,
            }))
          )
        );
        const namesMap = {};
        responses.forEach(({ id, name }) => {
          namesMap[id] = name;
        });
        setUserNames(prev => ({ ...prev, ...namesMap }));
      } catch {
        // Ignore errors for now
      }
    };
    fetchNames();
  }, [products, productReviews]);

  const toggleExpand = (productId) => {
    setExpandedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
  };

  const handleDeleteReviewClick = (id) => {
    setDeletingReviewId(id);
  };

  const confirmDelete = async (type, id) => {
    try {
      await onDelete(type, id);
      setSuccessMessage('Product deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(`Failed to delete product: ${err.message}`);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDeleteReview = async (prefix, id) => {
    try {
      await onDeleteReview(prefix, id);
      setSuccessMessage('Review deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(`Failed to delete review: ${err.message}`);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
    setDeletingReviewId(null);
  };

  return (
    <div className="petflix-dashboard-tab">
      <h2 className="petflix-dashboard-section-title">Manage Products</h2>
      <div className="petflix-dashboard-table-container">
        <table className="petflix-dashboard-table">
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Description</th>
              <th>Seller</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const ownerId = product.ownerId || product.userId;
              return (
                <React.Fragment key={product.product_id}>
                  <tr>
                    <td>
                      <button
                        className="petflix-dashboard-expand-arrow"
                        onClick={() => toggleExpand(product.product_id)}
                        aria-label={expandedProductIds.includes(product.product_id) ? "Collapse reviews" : "Expand reviews"}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <FontAwesomeIcon icon={expandedProductIds.includes(product.product_id) ? faChevronUp : faChevronDown} />
                      </button>
                    </td>
                    <td>{product.product_id}</td>
                    <td>{product.product_title}</td>
                    <td>{product.product_category}</td>
                    <td>{product.product_new_price} JD</td>
                    <td>{product.product_description}</td>
                    <td>{userNames[ownerId] || ownerId || 'N/A'}</td>
                    <td>
                      {deletingId === product.product_id ? (
                        <div className="petflix-dashboard-confirm-delete">
                          <button
                            onClick={() => confirmDelete('Products', product.product_id)}
                            className="petflix-feedback-save-response-btn"
                          >
                            <FontAwesomeIcon icon={faSave} /> Confirm
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="petflix-feedback-cancel-response-btn"
                            style={{ width: '6.35rem', marginTop: '1rem' }}
                          >
                            <FontAwesomeIcon icon={faTimes} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteClick(product.product_id)}
                          className="petflix-dashboard-delete-button"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedProductIds.includes(product.product_id) && (
                    <tr>
                      <td colSpan="8">
                        <div className="petflix-dashboard-reviews-container">
                          <h4 className="petflix-dashboard-reviews-title">Reviews</h4>
                          {productReviews.filter(review => review.productId === product.product_id).length > 0 ? (
                            <ul className="petflix-dashboard-reviews-list">
                              {productReviews
                                .filter(review => review.productId === product.product_id)
                                .map(review => (
                                  <li key={review.productReviewId} className="petflix-dashboard-review-item">
                                    <span>ID: {review.productReviewId}</span>
                                    <span>
                                      Reviewer: {userNames[review.reviewerId] || review.reviewerId || 'N/A'}
                                    </span>
                                    <span>{review.content}</span>
                                    <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                                    {deletingReviewId === review.productReviewId ? (
                                      <div className="petflix-dashboard-confirm-delete">
                                        <button
                                          onClick={() => confirmDeleteReview('PR_', review.productReviewId)}
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
                                        onClick={() => handleDeleteReviewClick(review.productReviewId)}
                                        className="petflix-dashboard-delete-button"
                                      >
                                        <FontAwesomeIcon icon={faTrash} /> Delete
                                      </button>
                                    )}
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <p className="petflix-dashboard-no-reviews">No reviews yet</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTab;