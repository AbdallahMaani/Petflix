import React, { useState } from 'react';

const ReviewsSection = ({ reviews, ownerReviews, userId, productId, addReview, setReviews }) => {
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  const handleEditClick = (reviewId, content) => {
    setEditingReviewId(reviewId);
    setEditedContent(content);
  };

  const handleSaveClick = async (reviewId) => {
    // Send the updated review content to the backend
    try {
      const response = await fetch(`‏https://localhost:7007/api/PR_/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editedContent }),
      });

      if (response.ok) {
        // Update the review in the local state
        setEditingReviewId(null);
        // Fetch the updated reviews
        fetchReviews();
      } else {
        console.error('Error updating review:', response.status);
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleDeleteClick = async (reviewId) => {
    // Delete the review from the backend
    try {
      const response = await fetch(`‏https://localhost:7007/api/PR_/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the review from the local state
        setReviews(reviews.filter(review => review.productReviewId !== reviewId));
      } else {
        console.error('Error deleting review:', response.status);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleAddReview = async () => {
    // Add the review to the backend
    try {
      const response = await fetch(`‏https://localhost:7007/api/PR_`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editedContent, productId: productId, reviewerId: userId }),
      });

      if (response.ok) {
        // Add the review to the local state
        fetchReviews();
        setEditedContent('');
      } else {
        console.error('Error adding review:', response.status);
      }
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`‏https://localhost:7007/api/PR_/product/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        console.error('Error fetching reviews:', response.status);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  return (
    <>
      <div className="popup-reviews">
        <h4>Product's Reviews :</h4>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review">
              <img className="reviewer-pic" src={review.profilePic} alt="Profile Pic" />
              <p className="review-author">{review.reviewerName}</p>
              <div>
                {editingReviewId === review.productReviewId ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                ) : (
                  <p className="review-text">"{review.content}"</p>
                )}
              </div>
              <div className="review-actions"> {/* Added a container for the buttons */}
                <p className="review-author">{review.reviewDate.substring(0, 10)}</p>
                {userId === review.reviewerId && (
                  <>
                    {editingReviewId === review.productReviewId ? (
                      <>
                        <button onClick={() => handleSaveClick(review.productReviewId)}>Save</button>
                        <button onClick={() => setEditingReviewId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => handleEditClick(review.productReviewId, review.content)}>Edit</button>
                    )}
                    <button onClick={() => handleDeleteClick(review.productReviewId)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
        {userId && (
          <>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <button onClick={() => handleAddReview()}>Add Review</button>
          </>
        )}
      </div>

      <div className="popup-reviews">
        <h4>Owner's Reviews :</h4>
        {ownerReviews.length > 0 ? (
          ownerReviews.map((review, index) => (
            <div key={index} className="review">
              <img className="reviewer-pic" src={review.profilePic} alt="Profile Pic" />
              <p className="review-author">{review.reviewer}</p>
              <div>
                <p className="review-text">"{review.content}"</p>
              </div>
              <div>
                <p className="review-author">{review.reviewDate.substring(0, 10)}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </>
  );
};

export default ReviewsSection;