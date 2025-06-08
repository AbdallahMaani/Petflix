import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronDown, faChevronUp, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import axios from 'axios';

const AnimalsTab = ({ animals, animalReviews, onDelete, onDeleteReview, setSuccessMessage, setErrorMessage }) => {
  const [expandedAnimalIds, setExpandedAnimalIds] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  useEffect(() => {
    const userIds = new Set();
    animals.forEach(animal => {
      if (animal.userId) userIds.add(animal.userId);
    });
    animalReviews.forEach(review => {
      if (review.reviewerId) userIds.add(review.reviewerId);
    });

    const idsToFetch = Array.from(userIds).filter(id => !userNames[id]);
    if (idsToFetch.length === 0) return;

    const fetchNames = async () => {
      try {
        const responses = await Promise.all(
          idsToFetch.map(id =>
            axios.get(`https://petflix-backend-620z.onrender.com/api/User/${id}`).then(res => ({
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
  }, [animals, animalReviews]);

  const toggleExpand = (animalId) => {
    setExpandedAnimalIds((prev) =>
      prev.includes(animalId)
        ? prev.filter(id => id !== animalId)
        : [...prev, animalId]
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
      setSuccessMessage('Animal deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(`Failed to delete animal: ${err.message}`);
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
      <h2 className="petflix-dashboard-section-title">Manage Animals</h2>
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
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {animals.map(animal => (
              <React.Fragment key={animal.animal_id}>
                <tr>
                  <td>
                    <button
                      className="petflix-dashboard-expand-arrow"
                      onClick={() => toggleExpand(animal.animal_id)}
                      aria-label={expandedAnimalIds.includes(animal.animal_id) ? "Collapse reviews" : "Expand reviews"}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <FontAwesomeIcon icon={expandedAnimalIds.includes(animal.animal_id) ? faChevronUp : faChevronDown} />
                    </button>
                  </td>
                  <td>{animal.animal_id}</td>
                  <td>{animal.animal_title}</td>
                  <td>{animal.animal_category}</td>
                  <td>{animal.animal_new_price} JD</td>
                  <td>{animal.animal_description}</td>
                  <td>{userNames[animal.userId] || animal.userId || 'N/A'}</td>
                  <td>
                    {deletingId === animal.animal_id ? (
                      <div className="petflix-dashboard-confirm-delete">
                        <button
                          onClick={() => confirmDelete('Animals', animal.animal_id)}
                          className="petflix-feedback-save-response-btn"
                        >
                          <FontAwesomeIcon icon={faSave} /> Confirm
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="petflix-feedback-cancel-response-btn"
                          style={{width:'6.35rem' , marginTop:'1rem'}}

                        >
                          <FontAwesomeIcon icon={faTimes} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteClick(animal.animal_id)}
                        className="petflix-dashboard-delete-button"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
                {expandedAnimalIds.includes(animal.animal_id) && (
                  <tr>
                    <td colSpan="8">
                      <div className="petflix-dashboard-reviews-container">
                        <h4 className="petflix-dashboard-reviews-title">Reviews</h4>
                        {animalReviews.filter(review => review.animalId === animal.animal_id).length > 0 ? (
                          <ul className="petflix-dashboard-reviews-list">
                            {animalReviews
                              .filter(review => review.animalId === animal.animal_id)
                              .map(review => (
                                <li key={review.animalReviewId} className="petflix-dashboard-review-item">
                                  <span>ID: {review.animalReviewId}</span>
                                  <span>
                                    Reviewer: {userNames[review.reviewerId] || review.reviewerId || 'N/A'}
                                  </span>
                                  <span>{review.content}</span>
                                  <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                                  {deletingReviewId === review.animalReviewId ? (
                                    <div className="petflix-dashboard-confirm-delete">
                                      <button
                                        onClick={() => confirmDeleteReview('AR_', review.animalReviewId)}
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
                                      onClick={() => handleDeleteReviewClick(review.animalReviewId)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnimalsTab;