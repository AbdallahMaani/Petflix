import React, { useState, useEffect } from 'react';
import './BestClinics.css';
import axios from 'axios';
import PetCare from '../Assets/PetCare.jpg';
import PetCare2 from '../Assets/PetCare2.webp';
import PetCare3 from '../Assets/PetCare3.webp';
import PetCare4 from '../Assets/PetCare4.jpg';

const BestClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomClinics = async () => {
      try {
        // Static clinic data
        const randomClinics = [
          {
            clinicId: 1,
            name: 'Al-Hayat Veterinary Clinic',
            location: 'Amman, Jordan',
            phone: '+962 779 555 134',
            email: 'info@alhayatvet.com',
            clinic_pic: PetCare,
          },
          {
            clinicId: 2,
            name: 'Jordan Pet Care Center',
            location: 'Irbid, Jordan',
            phone: '+962 778 777 578',
            email: 'care@jordanpetcare.com',
            clinic_pic: PetCare2,
          },
          {
            clinicId: 3,
            name: 'The Animal Doctors',
            location: 'Aqaba, Jordan',
            phone: '+962 776 201 900',
            email: 'doctors@animaldoctors.jo',
            clinic_pic: PetCare3,
          },
          {
            clinicId: 4,
            name: 'Petra Veterinary Clinic',
            location: 'Amman, Jordan',
            phone: '+962 3 215 4321',
            email: 'petra.vet@example.com',
            clinic_pic: PetCare4,
          },
        ];

        setClinics(randomClinics);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching random clinics:', err);
        setError(err.message || 'Failed to load clinics.');
        setLoading(false);
      }
    };

    fetchRandomClinics();
  }, []);

  if (loading) {
    return <div className="clinics-loading">Loading best clinics...</div>;
  }

  if (error) {
    return <div className="clinics-error">Error: {error}</div>;
  }

  return (
    <div className="best-clinics-container">
      <h2 className="section-title">Top Rated Pet Clinics in Jordan</h2>
      <div className="clinics-row">
        {clinics.map((clinic) => (
          <div key={clinic.clinicId} className="clinic-card">
            <div className="clinic-image-container">
              <img
                src={clinic.clinic_pic || 'https://via.placeholder.com/350'}
                alt={clinic.name}
                className="clinic-image"
              />
            </div>
            <h3 className="clinic-name">{clinic.name}</h3>

            <div className="user-details-grid">
              <div className="user-detail-row">
                <i className="fas fa-map-marker-alt user-detail-icon"></i>
                <span className="user-detail-value">{clinic.location}</span>
              </div>

              <div className="user-detail-row">
                <i className="fas fa-phone user-detail-icon"></i>
                <span className="user-detail-value">
                  {clinic.phone !== 'Not available' ? (
                    <a href={`tel:${clinic.phone}`} className="user-contact-link">
                      {clinic.phone}
                    </a>
                  ) : (
                    'Not available'
                  )}
                </span>
              </div>

              <div className="user-detail-row">
                <i className="fas fa-envelope user-detail-icon"></i>
                <a href={`mailto:${clinic.email}`} className="user-contact-link">
                  {clinic.email}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestClinics;