import React, { useState, useEffect } from 'react';
import './BestClinics.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCat, faBox, faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const BestUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const [usersResponse, animalsResponse, productsResponse] = await Promise.all([
          axios.get('‏https://localhost:7007/api/User', {
            headers: {
              'Authorization': `Bearer ${JSON.parse(localStorage.getItem('loggedInUser'))?.token || ''}`,
            },
          }),
          axios.get('‏https://localhost:7007/api/Animals', {
            headers: {
              'Authorization': `Bearer ${JSON.parse(localStorage.getItem('loggedInUser'))?.token || ''}`,
            },
          }),
          axios.get('‏https://localhost:7007/api/Products', {
            headers: {
              'Authorization': `Bearer ${JSON.parse(localStorage.getItem('loggedInUser'))?.token || ''}`,
            },
          }),
        ]);

        const usersData = usersResponse.data;
        const animals = animalsResponse.data;
        const products = productsResponse.data;

        const userContributions = {};

        // Initialize user data
        usersData.forEach((user) => {
          userContributions[user.userId] = {
            userId: user.userId,
            username: user.username || 'Unknown',
            name: user.name || 'Unknown',
            email: user.email || 'Unknown',
            profilePic: user.profilePic || null,
            bio: user.bio || 'No bio available',
            animalCount: 0,
            productCount: 0,
            totalContributions: 0,
            phone: user.phone || 'Not available',
            location: user.location || 'Not available',
          };
        });

        // Count animals per user
        animals.forEach((animal) => {
          const userId = animal.userId;
          if (userContributions[userId]) {
            userContributions[userId].animalCount += 1;
            userContributions[userId].totalContributions += 1;
          }
        });

        // Count products per user
        products.forEach((product) => {
          const userId = product.userId;
          if (userContributions[userId]) {
            userContributions[userId].productCount += 1;
            userContributions[userId].totalContributions += 1;
          }
        });

        // Sort users by total contributions
        const sortedUsers = Object.values(userContributions)
          .sort((a, b) => b.totalContributions - a.totalContributions)
          .slice(0, 4)
          .map((user, index) => ({ ...user, rank: index + 1 })); // Add rank

        setUsers(sortedUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching top users:', err);
        setError(err.message || 'Failed to load top users.');
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  if (loading) {
    return (
      <div className="best-clinics-container">
        <h2 className="section-title">Top Sellers on Petflix</h2>
        <div className="clinics-row">
          <div className="clinics-loading" style={{ color: 'darkgray' }}>
            Loading top sellers ...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="clinics-error">Error: {error}</div>;
  }

  const goToUserProfile = (userId) => {
    navigate('/myprofile', { state: { ownerId: userId } });
  };

  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Apply different formatting based on length
    if (cleaned.length === 10) {
      // Format as 0XX XXX XXXX
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    } else if (cleaned.length === 11) {
      // Format as 0XXX XXX XXXX
      return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    } else if (cleaned.length === 12) {
      // Format as +XXX XX XXX XXXX
      return cleaned.replace(/(\d{3})(\d{2})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
    }

    // Return original if doesn't match common patterns
    return phone;
  };

  const getRankingString = (rank) => {
    switch (rank) {
      case 1: return '1st';
      case 2: return '2nd';
      case 3: return '3rd';
      default: return `${rank}th`;
    }
  };

  const getRankingColor = (rank) => {
    switch (rank) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return '#cd7f32'; // Bronze
      default: return 'black';
    }
  };

  return (
    <div className="best-clinics-container">
      <h2 className="section-title">Top Sellers on Petflix</h2>
      <div className="clinics-row">
        {users.map((user) => (
          <div key={user.userId} className="clinic-card">
            <div className="clinic-image-container">
              <span
                className="rank-badge"
              >
                {getRankingString(user.rank)}
              </span>
              <img
                src={user.profilePic || 'https://via.placeholder.com/350'}
                alt={user.name}
                className="clinic-image"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToUserProfile(user.userId);
                }}
                className="view-user"
              >
                View Profile
              </button>
            </div>
            <h3 className="clinic-name">
              {user.name}
            </h3>

            <div className="user-details-grid">
              <div className="user-detail-row">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="user-detail-icon" />
                <span className="user-detail-value">{user.location}</span>
              </div>

              <div className="user-detail-row">
                <FontAwesomeIcon icon={faPhone} className="user-detail-icon" />
                <span className="user-detail-value">
                  {user.phone !== 'Not available' ? (
                    <a href={`tel:${user.phone}`} className="user-contact-link">
                      {formatPhoneNumber(user.phone)}
                    </a>
                  ) : (
                    'Not available'
                  )}
                </span>
              </div>

              <div className="user-detail-row">
                <FontAwesomeIcon icon={faEnvelope} className="user-detail-icon" />
                <a href={`mailto:${user.email}`} className="user-contact-link">
                  {user.email}
                </a>
              </div>

              <div className="user-stats-container">
                <div className="user-stat-item">
                  <FontAwesomeIcon icon={faCat} className="user-stat-icon" />
                  <div className="stat-value">{user.animalCount}</div>
                  <div className="stat-label">Animals</div>
                </div>

                <div className="user-stat-item">
                  <FontAwesomeIcon icon={faBox} className="user-stat-icon" />
                  <div className="stat-value">{user.productCount}</div>
                  <div className="stat-label">Products</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestUsers;