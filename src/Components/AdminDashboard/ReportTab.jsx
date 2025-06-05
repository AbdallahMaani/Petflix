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
  faSearch,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

const ReportTab = ({ reports, setReports, onReportsUpdated, setSuccessMessage, setErrorMessage }) => {
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const navigate = useNavigate();

  const statusMappings = {
    0: { text: 'Pending', icon: faClock, color: '#f0ad4e' },
    1: { text: 'Under Review', icon: faSearch, color: '#17a2b8' },
    2: { text: 'Resolved', icon: faCheckCircle, color: '#28a745' },
    3: { text: 'Rejected', icon: faTimesCircle, color: '#dc3545' }
  };

  const getAuthConfig = () => {
    const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
    if (!token) {
      setErrorMessage('Admin authentication required. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      throw new Error('No token found');
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const getStatusDisplay = (status) => {
    const statusInfo = statusMappings[status] || statusMappings[0];
    return (
      <div className="status-display" style={{ display: 'flex', alignItems: 'center', color: statusInfo.color }}>
        <FontAwesomeIcon icon={statusInfo.icon} style={{ marginRight: '5px' }} />
        <span>{statusInfo.text}</span>
      </div>
    );
  };

  const handleEditClick = (report) => {
    setEditingStatusId(report.reportId);
    setSelectedStatus(report.status);
    setResolutionNotes(report.resolutionNotes || '');
  };

  const handleStatusChange = async (report) => {
    try {
      const config = getAuthConfig();
      const payload = {
        status: selectedStatus,
        resolutionNotes: resolutionNotes,
        content: report.content
      };

      const response = await axios.put(
        `http://localhost:5024/api/Report/${report.reportId}`,
        payload,
        config
      );

      setReports(
        reports.map(r =>
          r.reportId === report.reportId
            ? { ...r, status: response.data.status, resolutionNotes: response.data.resolutionNotes }
            : r
        )
      );

      if (onReportsUpdated) onReportsUpdated();

      setSuccessMessage('Report status updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      setEditingStatusId(null);
    } catch (err) {
      const errorMsg =
        err.response?.status === 401
          ? 'Session expired. Redirecting to login...'
          : `Failed to update status: ${err.response?.data?.message || err.message}`;
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 3000);
      if (err.response?.status === 401) setTimeout(() => navigate('/login'), 2000);
    }
  };

  const handleDeleteClick = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        const config = getAuthConfig();
        await axios.delete(`http://localhost:5024/api/Report/${reportId}`, config);
        setReports(reports.filter(r => r.reportId !== reportId));
        if (onReportsUpdated) onReportsUpdated();
        setSuccessMessage('Report deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        const errorMsg =
          err.response?.status === 401
            ? 'Session expired. Redirecting to login...'
            : `Failed to delete report: ${err.response?.data?.message || err.message}`;
        setErrorMessage(errorMsg);
        setTimeout(() => setErrorMessage(''), 3000);
        if (err.response?.status === 401) setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingStatusId(null);
    setResolutionNotes('');
  };

  const parseReportContent = (content) => {
    if (!content) return { reason: '', details: '' };
    const parts = content.split('\nDetails: ');
    return {
      reason: parts[0].replace('Reason: ', ''),
      details: parts[1] || ''
    };
  };

  return (
    <div className="petflix-report-tab">
      <h2 className="petflix-dashboard-section-title">User Reports</h2>
      {(!reports || reports.length === 0) ? (
        <div className="petflix-empty-state">
          <p>No reports found.</p>
        </div>
      ) : (
        <table className="petflix-feedback-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Reporter</th>
              <th>Reported</th>
              <th>Reason</th>
              <th>Details</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const { reason, details } = parseReportContent(report.content);
              return (
                <tr key={report.reportId}>
                  <td>{report.reportId}</td>
                  <td>{report.reporter?.name || report.reporterId}</td>
                  <td>
                    {report.reportedUser?.name ||
                      report.reportedAnimal?.animal_title ||
                      report.reportedProduct?.product_title ||
                      'N/A'}
                  </td>
                  <td>{reason}</td>
                  <td>{details}</td>
                  <td>
                    {editingStatusId === report.reportId ? (
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(parseInt(e.target.value))}
                        className="petflix-feedback-status-select"
                      >
                        <option value={0}>Pending</option>
                        <option value={1}>Under Review</option>
                        <option value={2}>Resolved</option>
                        <option value={3}>Rejected</option>
                      </select>
                    ) : (
                      getStatusDisplay(report.status)
                    )}
                  </td>
                  <td>
                    {editingStatusId === report.reportId ? (
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="petflix-feedback-response-input"
                        placeholder="Enter resolution notes..."
                        rows={2}
                        style={{ width: '12rem'}}
                      />
                    ) : (
                      report.resolutionNotes || 'None'
                    )}
                  </td>
                  <td>
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}
                  </td>
                  <td>
                    {editingStatusId === report.reportId ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="petflix-feedback-save-response-btn"
                          onClick={() => handleStatusChange(report)}
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
                          onClick={() => handleEditClick(report)}
                        >
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </button>
                        <button
                          className="petflix-feedback-delete-button petflix-feedback-delete-btn"
                          onClick={() => handleDeleteClick(report.reportId)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReportTab;
