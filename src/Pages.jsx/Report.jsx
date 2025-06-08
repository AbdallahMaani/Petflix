import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../Pages.css/Report.css';

const Report = () => {
  const [report, setReport] = useState({
    reporterId: 0,
    targetType: 0,
    reportedUserId: null,
    reportedAnimalId: null,
    reportedProductId: null,
    reportReason: '',
    content: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [targetData, setTargetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { targetType: targetTypeStr, targetId } = location.state || {};

  useEffect(() => {
    if (!targetTypeStr || !targetId) {
      setError('Missing target information');
      setLoading(false);
      return;
    }

    const targetTypeMap = {
      User: 0,
      Animal: 1,
      Product: 2
    };
    const targetType = targetTypeMap[targetTypeStr];
    if (targetType === undefined) {
      setError('Invalid target type');
      setLoading(false);
      return;
    }

    const fetchTargetData = async () => {
      try {
        let endpoint = '';
        switch (targetTypeStr) {
          case 'User':
            endpoint = `https://petflix-backend-620z.onrender.com/api/User/${targetId}`;
            break;
          case 'Animal':
            endpoint = `https://petflix-backend-620z.onrender.com/api/Animal/${targetId}`;
            break;
          case 'Product':
            endpoint = `https://petflix-backend-620z.onrender.com/api/Product/${targetId}`;
            break;
          default:
            throw new Error('Invalid target type');
        }

        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser?.userId || !loggedInUser?.token) {
          throw new Error('User not authenticated');
        }

        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${loggedInUser.token}`
          }
        });
        setTargetData(response.data);
        setReport(prev => ({
          ...prev,
          reporterId: loggedInUser.userId,
          targetType,
          reportedUserId: targetType === 0 ? targetId : null,
          reportedAnimalId: targetType === 1 ? targetId : null,
          reportedProductId: targetType === 2 ? targetId : null
        }));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load target information');
      } finally {
        setLoading(false);
      }
    };

    fetchTargetData();
  }, [targetTypeStr, targetId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus(null);
    setError(null);

    if (!report.reportReason) {
      setError('Please select a reason for the report.');
      setSubmissionStatus('error');
      return;
    }
    if (!report.content.trim() || report.content.length < 10) {
      setError('Please provide report details (at least 10 characters).');
      setSubmissionStatus('error');
      return;
    }

    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser?.token) {
        throw new Error('User not authenticated');
      }

      const payload = {
        ReporterId: report.reporterId,
        TargetType: report.targetType,
        ReportedUserId: report.reportedUserId,
        ReportedAnimalId: report.reportedAnimalId,
        ReportedProductId: report.reportedProductId,
        Content: `Reason: ${report.reportReason}\nDetails: ${report.content}`
      };

      const response = await axios.post('https://petflix-backend-620z.onrender.com/api/Report', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${loggedInUser.token}`
        }
      });

      setSubmissionStatus('success');
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
      setSubmissionStatus('error');
    }
  };

  const getTargetDisplay = () => {
    if (!targetData) return 'Unknown Target';
    
    switch (report.targetType) {
      case 0:
        return `${targetData.username || targetData.name || 'User'} (User)`;
      case 1:
        return `${targetData.animal_title || targetData.name || 'Animal'} (Animal)`;
      case 2:
        return `${targetData.product_title || targetData.name || 'Product'} (Product)`;
      default:
        return 'Unknown Type';
    }
  };

  if (loading) return <div className="report-page-container">Loading...</div>;
  if (error) return <div className="report-page-container error">{error}</div>;

  return (
    <div className="report-page-container">
      <h2>Report {targetTypeStr}</h2>
      <p>Reporting: {getTargetDisplay()}</p>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-group">
          <label htmlFor="reportReason">Reason for Report:</label>
          <select
            id="reportReason"
            name="reportReason"
            value={report.reportReason}
            onChange={handleChange}
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
          <label htmlFor="content">Report Details:</label>
          <textarea
            id="content"
            name="content"
            value={report.content}
            onChange={handleChange}
            required
            rows="5"
            placeholder="Please provide detailed information about your report..."
            maxLength={1000}
          />
          <div className="char-counter">
            {report.content.length}/1000 characters
          </div>
        </div>

        <button type="submit" className="submit-button">
          Submit Report
        </button>

        {submissionStatus === 'success' && (
          <p className="success-message">Report submitted successfully!</p>
        )}
        {submissionStatus === 'error' && (
          <p className="error-message">{error}</p>
        )}
      </form>
    </div>
  );
};

export default Report;