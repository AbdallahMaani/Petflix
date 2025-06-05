import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './FeedbackButton.css';
import NoAccount from '../../Pages.jsx/NoAccount';

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('Guest');
  const [feedbackType, setFeedbackType] = useState('General Feedback');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      try {
        const user = JSON.parse(loggedInUser);
        setName(user.name || user.email || 'User');
        setUserId(user.userId);
        setIsLoggedIn(true);
      } catch (e) {
        console.error('Error parsing user data:', e);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('‏https://localhost:7007/api/Feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || 0,
          feedbackType,
          content: feedback,
          status: "Pending"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
      setFeedback('');

      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
      }, 3000);

    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    'General Feedback',
    'Bug Report',
    'Feature Request',
    'UI/UX Suggestion',
    'Other'
  ];

  const handleButtonClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div
        className={`feedback-button ${isHovering ? 'hover' : ''}`}
        onClick={handleButtonClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <FontAwesomeIcon icon={faComment} />
        {isHovering && <span className="feedback-tooltip">Leave Feedback</span>}
      </div>

      {isOpen && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <button
              className="close-modal"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {isLoggedIn ? (
              isSubmitted ? (
                <div className="submission-success">
                  <h3>Thank You!</h3>
                  <p>Your feedback has been submitted.</p>
                  <div className="success-animation"></div>
                </div>
              ) : (
                <>
                  <h3>Send Us Your Feedback</h3>
                  {error && <div className="error-message">{error}</div>}
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Your Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={name !== 'Guest'}
                      />
                    </div>

                    <div className="form-group">
                      <label>Feedback Type</label>
                      <select
                        value={feedbackType}
                        onChange={(e) => setFeedbackType(e.target.value)}
                        required
                      >
                        {feedbackTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Your Feedback</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What's on your mind?"
                        required
                        minLength="10"
                      />
                    </div>

                    <button
                      type="submit"
                      className="submit-btn2"
                      disabled={isSubmitting || !feedback.trim()}
                    >
                      {isSubmitting ? (
                        <span className="spinner"></span>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPaperPlane} /> Send
                        </>
                      )}
                    </button>
                  </form>
                </>
              )
            ) : (
              <NoAccount onGuestMode={() => { setIsOpen(false); window.location.href = '/'; }} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;