import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
    });
  };

  const handleLinkClick = (event, path) => {
    const isLoggedIn = localStorage.getItem('loggedInUser');
    if ((path === '/cart' || path === '/myprofile') && !isLoggedIn) {
      event.preventDefault();
      navigate('/noaccount', { state: { from: location } });
    } else {
      scrollToTop();
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Branding & Description (Widest Section) */}
        <div className="footer-section footer-brand">
          <h2 className="footer-logo">PETFLIX</h2>
          <p className="footer-description">
            At PETFLIX, we’re passionate about pets. Discover top-quality products, expert guides, and a community dedicated to your furry friends.
          </p>
          <p className="footer-copyright">
            © 2025 PETFLIX. All Rights Reserved.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="footer-section footer-links">
          <h3 className="footer-heading">Explore</h3>
          <ul className="footer-nav-list">
            <li><Link to="/" className="footer-link" onClick={scrollToTop}>Home</Link></li>
            <li><Link to="/animals" className="footer-link" onClick={scrollToTop}>Animals</Link></li>
            <li><Link to="/products" className="footer-link" onClick={scrollToTop}>Products</Link></li>
            <li>
              <Link
                to="/cart"
                className="footer-link"
                onClick={(event) => handleLinkClick(event, '/cart')}
              >
                Cart
              </Link>
            </li>
            <li>
              <Link
                to="/myprofile"
                className="footer-link"
                onClick={(event) => handleLinkClick(event, '/myprofile')}
              >
                My Profile
              </Link>
            </li>
            <li><Link to="/orderspage" className="footer-link" onClick={scrollToTop}>Orders</Link></li>
            <li><Link to="/petGuide" className="footer-link" onClick={scrollToTop}>Pet Guide</Link></li>
            <li><Link to="/about" className="footer-link" onClick={scrollToTop}>About</Link></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-section footer-contact">
          <h3 className="footer-heading">Contact Us</h3>
          <ul className="footer-contact-list">
            <li>
              <FontAwesomeIcon icon={faPhone} className="footer-icon" />
              <a href="tel:+962123456789" className="footer-link">
                +962 123 456 789
              </a>
            </li>
            <li>
              <FontAwesomeIcon icon={faWhatsapp} className="footer-icon" />
              <a
                href="https://wa.me/962123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                +962 123 456 789
              </a>
            </li>
            <li>
              <FontAwesomeIcon icon={faEnvelope} className="footer-icon" />
              <a href="mailto:Petflix_shop@icloud.com" className="footer-link">
                Petflix_shop@icloud.com
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="footer-section footer-social">
          <h3 className="footer-heading">Follow Us</h3>
          <div className="social-icons-footer">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <FontAwesomeIcon icon={faFacebook} size="lg" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <FontAwesomeIcon icon={faInstagram} size="lg" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <FontAwesomeIcon icon={faTwitter} size="lg" />
            </a>
            <a
              href="https://wa.me/962123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <FontAwesomeIcon icon={faWhatsapp} size="lg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;