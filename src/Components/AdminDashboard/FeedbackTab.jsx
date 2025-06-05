import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faEdit,
  faSave,
  faTimes,
  faClock,
  faWrench,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

const FeedbackTab = ({ feedbacks, setFeedbacks, setSuccessMessage, setErrorMessage }) => {
  const [editingId, setEditingId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [responseInput, setResponseInput] = useState('');
  const navigate = useNavigate();

  const statusMappings = {
    Pending: { text: 'Pending', icon: faClock, color: '#f0ad4e' },
    'Under Review': { text: 'Under Review', icon: faWrench, color: '#ffc107' },
    Resolved: { text: 'Resolved', icon: faCheckCircle, color: '#28a745' },
    Rejected: { text: 'Rejected', icon: faTimesCircle, color: '#dc3545' }
  };

  const getAuthConfig = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser?.token) {
      setErrorMessage('Authentication required. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      throw new Error('No token found');
    }
    if (!loggedInUser?.isAdmin) {
      setErrorMessage('Admin access required. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      throw new Error('User is not an admin');
    }
    return { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
  };

  const getStatusDisplay = (status) => {
    const statusInfo = statusMappings[status] || statusMappings.Pending;
    return (
      <div className="status-display" style={{ display: 'flex', alignItems: 'center', color: statusInfo.color }}>
        <FontAwesomeIcon icon={statusInfo.icon} style={{ marginRight: '5px' }} />
        <span>{statusInfo.text}</span>
      </div>
    );
  };

  const handleEditClick = (feedback) => {
    setEditingId(feedback.feedbackId);
    setSelectedStatus(feedback.status);
    setResponseInput(feedback.response || '');
  };

  const handleSaveChanges = async (feedback) => {
    try {
      const config = getAuthConfig();
      const payload = {
        status: selectedStatus,
        response: responseInput
      };

      await axios.patch(
        `http://localhost:5024/api/Feedback/${feedback.feedbackId}/status`,
        payload,
        config
      );

      setFeedbacks(
        feedbacks.map(f =>
          f.feedbackId === feedback.feedbackId
            ? { ...f, status: selectedStatus, response: responseInput }
            : f
        )
      );

      setSuccessMessage('Feedback updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditingId(null);
    } catch (err) {
      const errorMsg =
        err.response?.status === 401
          ? 'Session expired. Redirecting to login...'
          : `Failed to update feedback: ${err.response?.data?.message || err.message}`;
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 3000);
      if (err.response?.status === 401) setTimeout(() => navigate('/login'), 2000);
    }
  };

  const handleDeleteClick = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        const config = getAuthConfig();
        await axios.delete(`http://localhost:5024/api/Feedback/${feedbackId}`, config);
        setFeedbacks(feedbacks.filter(f => f.feedbackId !== feedbackId));
        setSuccessMessage('Feedback deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        const errorMsg =
          err.response?.status === 401
            ? 'Session expired. Redirecting to login...'
            : `Failed to delete feedback: ${err.response?.data?.message || err.message}`;
        setErrorMessage(errorMsg);
        setTimeout(() => setErrorMessage(''), 3000);
        if (err.response?.status === 401) setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setResponseInput('');
  };

  return (
    <div className="petflix-feedback-tab">
      <h2 className="petflix-dashboard-section-title">User Feedbacks</h2>
      {(!feedbacks || feedbacks.length === 0) ? (
        <div className="petflix-empty-state">
          <p>No feedbacks found.</p>
        </div>
      ) : (
        <table className="petflix-feedback-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Type</th>
              <th>Content</th>
              <th>Status</th>
              <th>Admin Response</th>
              <th>Submission Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback) => (
              <tr key={feedback.feedbackId}>
                <td>{feedback.feedbackId}</td>
                <td>{feedback.user?.username || 'Unknown'}</td>
                <td>{feedback.feedbackType}</td>
                <td>{feedback.content}</td>
                <td>
                  {editingId === feedback.feedbackId ? (
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="petflix-feedback-status-select"
                    >
                      {Object.keys(statusMappings).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    getStatusDisplay(feedback.status)
                  )}
                </td>
                <td>
                  {editingId === feedback.feedbackId ? (
                    <textarea
                      value={responseInput}
                      onChange={(e) => setResponseInput(e.target.value)}
                      className="petflix-feedback-response-input"
                      placeholder="Enter admin response..."
                      rows={2}
                    />
                  ) : (
                    feedback.response || 'None'
                  )}
                </td>
                <td>{new Date(feedback.submissionDate).toLocaleDateString()}</td>
                <td>
                  {editingId === feedback.feedbackId ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="petflix-feedback-save-response-btn"
                        onClick={() => handleSaveChanges(feedback)}
                      >
                        <FontAwesomeIcon icon={faSave} /> Save
                      </button>
                      <button
                        className="petflix-feedback-cancel-response-btn"
                        onClick={handleCancelEdit}
                      >
                        <FontAwesomeIcon icon={faTimes} /> Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="petflix-feedback-edit-button petflix-feedback-edit-btn"
                        onClick={() => handleEditClick(feedback)}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </button>
                      <button
                        className="petflix-feedback-delete-button petflix-feedback-delete-btn"
                        onClick={() => handleDeleteClick(feedback.feedbackId)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FeedbackTab;