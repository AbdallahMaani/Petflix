import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComment,
  faFlag,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faArrowLeft,
  faTrash,
  faEdit,
  faTimes,
  faSave,
  faEye,
  faWrench,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import '../FeedBack/FeedBackPage.css';
import Footer from '../Footer/Footer.jsx';

const FeedbackPage = () => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedbackList, setFeedbackList] = useState([]);
  const [reports, setReports] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null); // Renamed to errorMessage
  const [successMessage, setSuccessMessage] = useState(null); // Added successMessage
  const [modal, setModal] = useState({ 
    isOpen: false, 
    type: '', 
    item: null,
    fullContent: false
  });
  const [editFeedback, setEditFeedback] = useState({ FeedbackType: '', Content: '' });
  const [editReport, setEditReport] = useState({ reportReason: '', details: '' });
  const navigate = useNavigate();

  // Status mapping for both feedback and reports
  const statusMappings = {
    feedback: {
      0: { text: 'Pending', icon: faClock, color: '#f0ad4e' },
      1: { text: 'Under Review', icon: faWrench, color: '#ffc107' },
      2: { text: 'Resolved', icon: faCheckCircle, color: '#28a745' },
      3: { text: 'Rejected', icon: faTimesCircle, color: '#dc3545' }
    },
    reports: {
      0: { text: 'Pending', icon: faClock, color: '#f0ad4e' },
      1: { text: 'Under Review', icon: faSearch, color: '#17a2b8' },
      2: { text: 'Resolved', icon: faCheckCircle, color: '#28a745' },
      3: { text: 'Rejected', icon: faTimesCircle, color: '#dc3545' }
    }
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser?.userId || !loggedInUser?.token) {
          throw new Error('User not logged in');
        }
        const response = await axios.get(
          `http://localhost:5024/api/Feedback/user/${loggedInUser.userId}`,
          {
            headers: {
              Authorization: `Bearer ${loggedInUser.token}`
            }
          }
        );
        setFeedbackList(response.data);
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Failed to fetch feedback');
      }
    };

    fetchFeedback();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'reports') {
      const fetchReports = async () => {
        try {
          const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
          if (!loggedInUser?.userId || !loggedInUser?.token) {
            throw new Error('User not logged in');
          }
          const response = await axios.get(
            `http://localhost:5024/api/Report/user/${loggedInUser.userId}`,
            {
              headers: {
                Authorization: `Bearer ${loggedInUser.token}`
              }
            }
          );
          setReports(response.data);
        } catch (err) {
          setErrorMessage(err.response?.data?.message || 'Failed to fetch reports');
        }
      };
      fetchReports();
    }
  }, [activeTab]);

  const getStatusDisplay = (status, type = 'feedback') => {
    const mappings = statusMappings[type];
    const statusValue = typeof status === 'string' ? 
      Object.keys(mappings).find(key => mappings[key].text === status) || 0 : 
      status;
    
    const statusInfo = mappings[statusValue] || mappings[0];
    
    return (
      <div className="status-display" style={{ display: 'flex', alignItems: 'center', color: statusInfo.color }}>
        <FontAwesomeIcon 
          icon={statusInfo.icon} 
          style={{ marginRight: '5px' }}
        />
        <span>{statusInfo.text}</span>
      </div>
    );
  };

  const handleDelete = async (feedbackId) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      await axios.delete(`http://localhost:5024/api/Feedback/${feedbackId}`, {
        headers: {
          Authorization: `Bearer ${loggedInUser.token}`
        }
      });
      setFeedbackList(feedbackList.filter((fb) => fb.feedbackId !== feedbackId));
      setModal({ isOpen: false, type: '', item: null });
      setErrorMessage('Feedback deleted successfully!');
      setTimeout(() => setErrorMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete feedback');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleEdit = async (feedbackId) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const originalFeedback = feedbackList.find((fb) => fb.feedbackId === feedbackId);
      
      const feedbackData = {
        FeedbackId: feedbackId,
        UserId: originalFeedback.userId,
        FeedbackType: editFeedback.FeedbackType,
        Content: editFeedback.Content,
        Status: originalFeedback.status,
        SubmissionDate: originalFeedback.submissionDate,
        Response: originalFeedback.response
      };

      const response = await axios.put(
        `http://localhost:5024/api/Feedback/${feedbackId}`,
        feedbackData,
        {
          headers: {
            Authorization: `Bearer ${loggedInUser.token}`
          }
        }
      );

      setFeedbackList(
        feedbackList.map((fb) =>
          fb.feedbackId === feedbackId ? { ...fb, ...response.data } : fb
        )
      );
      setModal({ isOpen: false, type: '', item: null });
      setSuccessMessage('Feedback updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update feedback');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleEditReport = async (reportId) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser?.token) throw new Error('User not authenticated');
      if (!editReport.reportReason) throw new Error('Please select a reason');
      if (!editReport.details.trim() || editReport.details.length < 10) {
        throw new Error('Report details must be at least 10 characters');
      }

      const originalReport = reports.find(r => r.reportId === reportId);
      
      const response = await axios.put(
        `http://localhost:5024/api/Report/${reportId}`,
        {
          reportId: reportId,
          status: originalReport.status,
          resolutionNotes: originalReport.resolutionNotes || '',
          content: `Reason: ${editReport.reportReason}\nDetails: ${editReport.details}`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${loggedInUser.token}`
          }
        }
      );

      setReports(reports.map(r => 
        r.reportId === reportId ? { 
          ...r, 
          reportReason: editReport.reportReason,
          details: editReport.details,
          content: response.data.content
        } : r
      ));
      setModal({ isOpen: false, type: '', item: null });
      setSuccessMessage('Report updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to update report');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      await axios.delete(`http://localhost:5024/api/Report/${reportId}`, {
        headers: {
          Authorization: `Bearer ${loggedInUser.token}`
        }
      });
      setReports(reports.filter(r => r.reportId !== reportId));
      setModal({ isOpen: false, type: '', item: null });
      setSuccessMessage('Report deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete report');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const openModal = (type, item) => {
    setModal({ isOpen: true, type, item });
    setErrorMessage(null); // Clear any existing error message
    setSuccessMessage(null); // Clear any existing success message
    if (type === 'edit') {
      setEditFeedback({
        FeedbackType: item.feedbackType,
        Content: item.content
      });
    } else if (type === 'editReport') {
      const reportReason = item.reportReason || 
                         (item.content.includes('Reason: ') ? 
                          item.content.split('Reason: ')[1].split('\nDetails: ')[0] : 
                          'Other');
      const details = item.details || 
                     (item.content.includes('Details: ') ? 
                      item.content.split('Details: ')[1] : 
                      item.content);
      
      setEditReport({
        reportReason,
        details
      });
    }
  };

  const handleViewFeedback = (feedback) => {
    setModal({
      isOpen: true,
      type: 'view',
      item: feedback,
      fullContent: true
    });
  };

  const handleViewReport = (report) => {
    setModal({
      isOpen: true,
      type: 'viewReport',
      item: report,
      fullContent: true
    });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', item: null });
    setEditFeedback({ FeedbackType: '', Content: '' });
    setEditReport({ reportReason: '', details: '' });
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <>
      <div className="feedback-page">
        <button
          onClick={() => navigate(-1)}
          style={{ position: 'initial', marginBottom: '2rem', fontSize: '1rem' }}
          className="view-btn"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        <h1 className="page-title">
          <FontAwesomeIcon icon={faComment} className="title-icon" />
          My Feedbacks & Reports
        </h1>

{(errorMessage || successMessage) && (
  <div
    className={successMessage ? 'succsess-message' : 'error-message2'}
    style={{ marginBottom: '1rem', width: '20%', margin: '0 auto', textAlign: 'center' }}
  >
    {successMessage || errorMessage}
  </div>
)}

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <FontAwesomeIcon icon={faComment} className="tab-icon" />
            My Feedbacks
          </button>
          <button
            className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FontAwesomeIcon icon={faFlag} className="tab-icon" />
            My Reports
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'feedback' ? (
            <div className="feedback-content">
              {feedbackList.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't submitted any feedback yet.</p>
                  <button className="primary-button" onClick={() => navigate('/')}>
                    Submit Your First Feedback
                  </button>
                </div>
              ) : (
                <table className="feedback-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Content</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Response</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackList.map((feedback) => {
                      const isPending = typeof feedback.status === 'string' ? 
                        feedback.status === 'Pending' : 
                        feedback.status === 0;
                      
                      return (
                        <tr key={feedback.feedbackId}>
                          <td>{feedback.feedbackType}</td>
                          <td className="content-cell">
                            {feedback.content.length > 100
                              ? `${feedback.content.substring(0, 100)}...`
                              : feedback.content}
                          </td>
                          <td className="status-cell">
                            {getStatusDisplay(feedback.status, 'feedback')}
                          </td>
                          <td>{new Date(feedback.submissionDate).toLocaleDateString()}</td>
                          <td className="response-cell">
                            {feedback.response || 'No response yet'}
                          </td>
                          <td className="actions-cell">
                            <button
                              className="edit-btn action-btn"
                              onClick={() => handleViewFeedback(feedback)}
                              title="View Feedback"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="edit-btn action-btn"
                              onClick={() => openModal('edit', feedback)}
                              title="Edit Feedback"
                              disabled={!isPending}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="delete-btn action-btn"
                              onClick={() => openModal('delete', feedback)}
                              title="Delete Feedback"
                              disabled={!isPending}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="reports-content">
              {reports.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't submitted any reports yet.</p>
                </div>
              ) : (
                <table className="feedback-table">
                  <thead>
                    <tr>
                      <th>Reporter</th>
                      <th>Reported</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      const isPending = typeof report.status === 'string' ? 
                        report.status === 'Pending' : 
                        report.status === 0;
                      
                      return (
                        <tr key={report.reportId}>
                          <td>{report.reporter?.name || report.reporterId}</td>
                          <td>
                            {report.reportedUser?.name || 
                             report.reportedAnimal?.animal_title || 
                             report.reportedProduct?.product_title || 
                             'N/A'}
                          </td>
                          <td className="content-cell">
                            {report.reportReason || 
                             (report.content.includes('Reason: ') 
                              ? report.content.split('Reason: ')[1].split('\nDetails: ')[0] 
                              : 'Other')}
                          </td>
                          <td className="status-cell">
                            {getStatusDisplay(report.status, 'reports')}
                          </td>
                          <td>
                            {report.createdAt
                              ? new Date(report.createdAt).toLocaleDateString()
                              : ''}
                          </td>
                          <td className="actions-cell">
                            <button
                              className="edit-btn action-btn"
                              onClick={() => handleViewReport(report)}
                              title="View Report"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="edit-btn action-btn"
                              onClick={() => openModal('editReport', report)}
                              title="Edit Report"
                              disabled={!isPending}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="delete-btn action-btn"
                              onClick={() => openModal('deleteReport', report)}
                              title="Delete Report"
                              disabled={!isPending}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content2">
            <button className="close-modal" onClick={closeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {modal.type === 'delete' && (
              <>
                <h3>Delete Feedback</h3>
                <div className="delete-confirmation">
                  <p>Are you sure you want to delete this feedback?</p>
                  <div className="feedback-preview">
                    <p style={{ padding: '.8rem', borderBottom: '1px solid #ddd' }}>
                      <strong>Type: </strong> {modal.item.feedbackType}
                    </p>
                    <p style={{ padding: '.8rem', borderBottom: '1px solid #ddd' }}>
                      <strong>Content: </strong> {modal.item.content}
                    </p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    className="confirm-delete-btn"
                    onClick={() => handleDelete(modal.item.feedbackId)}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                  <button className="cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {modal.type === 'deleteReport' && (
              <>
                <h3>Delete Report</h3>
                <div className="delete-confirmation">
                  <p>Are you sure you want to delete this report?</p>
                  <div className="report-preview">
                    <p style={{ padding: '.8rem', borderBottom: '1px solid #ddd' }}>
                      <strong>Reason: </strong> {modal.item.reportReason || 
                                              (modal.item.content.includes('Reason: ') ? 
                                               modal.item.content.split('Reason: ')[1].split('\nDetails: ')[0] : 
                                               'Other')}
                    </p>
                    <p style={{ padding: '.8rem' }}>
                      <strong>Details: </strong> {modal.item.details || 
                                               (modal.item.content.includes('Details: ') ? 
                                                modal.item.content.split('Details: ')[1] : 
                                                modal.item.content)}
                    </p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    className="confirm-delete-btn"
                    onClick={() => handleDeleteReport(modal.item.reportId)}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                  <button className="cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {modal.type === 'edit' && (
              <>
                <h3>Edit Feedback</h3>
                <div className="edit-form">
                  <div className="form-group">
                    <label>Feedback Type</label>
                    <select
                      value={editFeedback.FeedbackType}
                      onChange={(e) =>
                        setEditFeedback({ ...editFeedback, FeedbackType: e.target.value })
                      }
                    >
                      {['General Feedback', 'Bug Report', 'Feature Request', 'UI/UX Suggestion', 'Other'].map(
                        (type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Content</label>
                    <textarea
                      value={editFeedback.Content}
                      onChange={(e) =>
                        setEditFeedback({ ...editFeedback, Content: e.target.value })
                      }
                      minLength={10}
                      maxLength={1000}
                      required
                      rows={6}
                    />
                    <div className="char-counter">
                      {editFeedback.Content.length}/1000 characters
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    className="save-btn"
                    onClick={() => handleEdit(modal.item.feedbackId)}
                    disabled={editFeedback.Content.length < 10}
                  >
                    <FontAwesomeIcon icon={faSave} /> Save Changes
                  </button>
                  <button className="cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {modal.type === 'editReport' && (
              <>
                <h3>Edit Report</h3>
                <div className="edit-form">
                  <div className="form-group">
                    <label>Reason for Report</label>
                    <select
                      value={editReport.reportReason}
                      onChange={(e) =>
                        setEditReport({ ...editReport, reportReason: e.target.value })
                      }
                      required
                    >
                      <option value="">Select a Reason</option>
                      <option value="Spam">Spam</option>
                      <option value="Harassment">Harassment</option>
                      <option value="Inappropriate Content">Inappropriate Content</option>
                      <option value="Fake Account">Fake Account</option>
                      <option value="Scam/Fraud">Scam/Fraud</option>
                      <option value="Copyright Violation">Copyright Violation</option>
                      <option value="Privacy Violation">Privacy Violation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Details</label>
                    <textarea
                      value={editReport.details}
                      onChange={(e) =>
                        setEditReport({ ...editReport, details: e.target.value })
                      }
                      minLength={10}
                      maxLength={1000}
                      required
                      rows={6}
                      placeholder="Please provide detailed information about your report..."
                    />
                    <div className="char-counter">
                      {editReport.details.length}/1000 characters
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    className="save-btn"
                    onClick={() => handleEditReport(modal.item.reportId)}
                    disabled={!editReport.reportReason || editReport.details.length < 10}
                  >
                    <FontAwesomeIcon icon={faSave} /> Save Changes
                  </button>
                  <button className="cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {modal.type === 'view' && (
              <>
                <h3>Feedback Details</h3>
                <div className="feedback-details">
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{modal.item.feedbackType}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      {getStatusDisplay(modal.item.status, 'feedback')}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {new Date(modal.item.submissionDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-row full-content">
                    <span className="detail-label">Content:</span>
                    <p className="detail-value">{modal.item.content}</p>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Response:</span>
                    <p className="detail-value response-value">
                      {modal.item.response || 'No response yet'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {modal.type === 'viewReport' && (
              <>
                <h3>Report Details</h3>
                <div className="feedback-details">
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      {getStatusDisplay(modal.item.status, 'reports')}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {new Date(modal.item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Reason:</span>
                    <p className="detail-value">
                      {modal.item.reportReason || 
                       (modal.item.content.includes('Reason: ') 
                        ? modal.item.content.split('Reason: ')[1].split('\nDetails: ')[0] 
                        : 'Other')}
                    </p>
                  </div>
                  <div className="detail-row full-content">
                    <span className="detail-label">Details:</span>
                    <p className="detail-value">
                      {modal.item.details || 
                       (modal.item.content.includes('Details: ') 
                        ? modal.item.content.split('Details: ')[1] 
                        : modal.item.content)}
                    </p>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Admin Response:</span>
                    <p className="detail-value response-value">
                      {modal.item.resolutionNotes || 'No response yet'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default FeedbackPage;