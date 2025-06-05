import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Pages.css/LoginSignup.css';
import Logo from '../Components/Assets/LogoForSign.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import Footer from '../Components/Footer/Footer';
import { Link } from 'react-router-dom';

const LoginSignup = () => {
  const [isActive, setIsActive] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [signUpData, setSignUpData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    location: '',
    availableDays: '',
    availableHours: '',
    delivery_method: '',
    birthDay: '',
    password: '',
    gender: null,
    profilePic: null,
  });
  const [signUpFeedback, setSignUpFeedback] = useState('');
  const [signUpFeedbackType, setSignUpFeedbackType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  const countryCodes = {
    'Jordan': '+962',
    'United States': '+1',
    'Canada': '+1',
    'United Kingdom': '+44',
    'Germany': '+49',
    'France': '+33',
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        if (!response.ok) throw new Error('Failed to fetch countries');
        const data = await response.json();
        setCountries(data.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (selectedCountry) {
        try {
          const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: selectedCountry }),
          });
          if (!response.ok) throw new Error('Failed to fetch cities');
          const data = await response.json();
          setCities(data.data);
        } catch (error) {
          console.error('Error fetching cities:', error);
        }
      } else {
        setCities([]);
      }
    };
    fetchCities();
  }, [selectedCountry]);

  useEffect(() => {
    if (signUpFeedback) {
      const timer = setTimeout(() => {
        setSignUpFeedback('');
        setSignUpFeedbackType('');
      }, 5000); // Clear feedback after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [signUpFeedback]);

  const handleSignIn = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('‏https://localhost:7007/api/User');
    if (!response.ok) throw new Error('Failed to fetch users');
    const users = await response.json();

    const user = users.find(
      (u) => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
    );

    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify({ ...user, token: 'mock-token' }));
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(<span className="error-message2">Invalid Username/Email or Password</span>);
    }
  } catch (error) {
    setError(<span className="error-message2">No Internet Connection. Please try again.</span>);
    console.error(error);
  }
};

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpFeedback('');
    setSignUpFeedbackType('');

    try {
      // Validation
      if (!validateName(signUpData.name)) throw new Error('Invalid name. Only letters and spaces allowed.');
      if (!validateUsername(signUpData.username)) throw new Error('Invalid username. Use letters, numbers, underscores, or hyphens.');
      if (!validateEmail(signUpData.email)) throw new Error('Invalid email format.');
      if (!signUpData.country) throw new Error('Please select a country.');
      if (!signUpData.city) throw new Error('Please select a city.');
      if (!validatePhone(signUpData.phone)) throw new Error('Invalid phone number. Must match country code and be 7-15 digits.');
      if (!validatePassword(signUpData.password)) throw new Error('Password must be at least 8 characters, with a letter and a number.');

      const formattedBirthDay = signUpData.birthDay ? new Date(signUpData.birthDay).toISOString().slice(0, 10) : null;
      const cleanedPhone = signUpData.phone.replace(/\s/g, ''); // Remove spaces for backend compatibility

      const dataToSend = {
        username: signUpData.username,
        name: signUpData.name,
        email: signUpData.email,
        password: signUpData.password,
        location: `${signUpData.country}, ${signUpData.city}`,
        delivery_method: signUpData.delivery_method || null,
        gender: Number(signUpData.gender),
        phone: cleanedPhone,
        birthDay: formattedBirthDay || null,
        profilePic: signUpData.profilePic || null,
        availableDays: signUpData.availableDays || null,
        availableHours: signUpData.availableHours || null,
        rating: 0,
        bio: null,
        animals: [],
        products: [],
      };

      const response = await fetch('‏https://localhost:7007/api/User', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        if (response.status === 409) {
          const errorText = await response.text();
          throw new Error(errorText.includes('username') ? 'Username already in use.' : 'Email already in use.');
        }
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to create user.');
      }

      const newUser = await response.json();
      setSignUpFeedback(<span>Please sign in with your new account.</span>);
      setSignUpFeedbackType('success');
      setSignUpData({
        name: '',
        username: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        location: '',
        availableDays: '',
        availableHours: '',
        delivery_method: '',
        birthDay: '',
        password: '',
        gender: null,
        profilePic: null,
      });
      setIsActive(false);
    } catch (error) {
      setSignUpFeedback(<span>{error.message}</span>);
      setSignUpFeedbackType('error');
      console.error('Signup Error:', error);
    }
  };

  // Validation Functions
  const validateName = (name) => /^[A-Za-z\s]{2,50}$/.test(name);
  const validateUsername = (username) => /^[A-Za-z0-9_-]{3,50}$/.test(username);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s/g, '');
    const countryCode = countryCodes[signUpData.country] || '+';
    return cleaned.startsWith(countryCode) && /^\+\d{7,15}$/.test(cleaned);
  };
  const validatePassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,60}$/.test(password);

  const handleAvailableDaysChange = (e) => {
    const { name, checked } = e.target;
    let updatedDays = signUpData.availableDays ? signUpData.availableDays.split(',').filter(day => day.trim()) : [];

    if (checked) {
      updatedDays.push(name);
    } else {
      updatedDays = updatedDays.filter(day => day !== name);
      if (updatedDays.includes('Weekends')) {
        updatedDays = updatedDays.filter(day => day !== 'Weekends');
        if (name === ' Friday ' && updatedDays.includes(' Saturday ')) updatedDays.push(' Saturday ');
        if (name === ' Saturday ' && updatedDays.includes(' Friday ')) updatedDays.push(' Friday ');
      }
    }

    const allDays = [' Sunday ', ' Monday ', ' Tuesday ', ' Wednesday ', ' Thursday ', ' Friday ', ' Saturday '];
    const allSelected = allDays.every(day => updatedDays.includes(day));
    if (allSelected) {
      updatedDays = ['EveryDay'];
    } else {
      updatedDays = updatedDays.filter(day => day !== 'EveryDay');
      if (updatedDays.includes(' Friday ') && updatedDays.includes(' Saturday ')) {
        updatedDays = updatedDays.filter(day => day !== ' Friday ' && day !== ' Saturday ');
        updatedDays.push('Weekends');
      } else {
        updatedDays = updatedDays.filter(day => day !== 'Weekends');
      }
    }

    setSignUpData({ ...signUpData, availableDays: updatedDays.join(',') });
  };

  const handleAvailableHoursChange = (e) => {
    setSignUpData({ ...signUpData, availableHours: e.target.value });
  };

  const formatPhoneNumber = (value, country) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    const countryCode = countryCodes[country] || '+';
    let formattedValue = cleaned.startsWith(countryCode.replace('+', '')) ? `+${cleaned}` : `${countryCode}${cleaned}`;
    formattedValue = formattedValue.slice(0, 15); // Match backend max length
    formattedValue = formattedValue.replace(/(\d{3})(?=\d)/g, '$1 '); // Add spaces
    return formattedValue;
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    const formattedPhoneNumber = formatPhoneNumber(value, signUpData.country);
    setSignUpData({ ...signUpData, phone: formattedPhoneNumber });
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    const formattedPhoneNumber = formatPhoneNumber(signUpData.phone.replace(/\D/g, ''), country);
    setSignUpData({ ...signUpData, country, city: '', location: '', phone: formattedPhoneNumber });
  };

  const handleCityChange = (e) => {
    setSignUpData({ ...signUpData, city: e.target.value, location: `${signUpData.country}, ${e.target.value}` });
  };

  return (
    <>
      <div className="login-signup-page">
        <div className={`login-signup-container ${isActive ? 'active' : ''}`} id="container">
          <div className="login-signup-form-container sign-up">
            <form onSubmit={handleSignUp}>
              <h1>Create Account</h1>
              <span>or use your email for registration</span>
              <input
                type="text"
                name="name"
                placeholder="Name (2-50 characters)"
                value={signUpData.name}
                onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Username (3-50 characters)"
                value={signUpData.username}
                onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                required
              />
              <select name="country" value={signUpData.country} onChange={handleCountryChange} required>
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.country} value={country.country}>
                    {country.country}
                  </option>
                ))}
              </select>
              <select
                name="city"
                value={signUpData.city}
                onChange={handleCityChange}
                required
                disabled={!selectedCountry}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="phone"
                placeholder={`Phone (e.g., ${countryCodes[signUpData.country] || '+XXX'} XXX XXX XXX)`}
                value={signUpData.phone}
                onChange={handlePhoneChange}
                maxLength={16}
                required
              />
              <select
                name="gender"
                value={signUpData.gender === null ? '' : signUpData.gender}
                onChange={(e) => setSignUpData({ ...signUpData, gender: Number(e.target.value) })}
                required
              >
                <option value="">Select Gender</option>
                <option value="0">Male</option>
                <option value="1">Female</option>
              </select>
              <select
                name="delivery_method"
                value={signUpData.delivery_method}
                onChange={(e) => setSignUpData({ ...signUpData, delivery_method: e.target.value })}
                required
              >
                <option value="">Select Delivery Status</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
              <input
                type="date"
                name="birthDay"
                value={signUpData.birthDay}
                onChange={(e) => setSignUpData({ ...signUpData, birthDay: e.target.value })}
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
              />
              <div className="available-days-container">
                <label style={{ width: '100%', marginBottom: '.6rem' }}>Select Available Days:</label>
                {[' Sunday ', ' Monday ', ' Tuesday ', ' Wednesday ', ' Thursday ', ' Friday ', ' Saturday '].map((day) => (
                  <div key={day}>
                    <input
                      type="checkbox"
                      name={day}
                      checked={
                        signUpData.availableDays === 'EveryDay' ||
                        (signUpData.availableDays?.includes('Weekends') && (day === ' Friday ' || day === ' Saturday ')) ||
                        signUpData.availableDays?.includes(day)
                      }
                      onChange={handleAvailableDaysChange}
                    />
                    <label>{day}</label>
                  </div>
                ))}
              </div>
              <select name="availableHours" value={signUpData.availableHours} onChange={handleAvailableHoursChange}>
                <option value="">Select Available Time</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
                <option value="All The Day">All The Day</option>
              </select>
              <input
                type="password"
                name="password"
                placeholder="Password (min 8 chars, letter + number)"
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                required
              />
              <div className="agreement">
                <input style={{ width: '15%' }} type="checkbox" required />
                <p>I agree to all the terms and privacy policy and will respect all rules.</p>
              </div>
              <button className="login-signup-btn" type="submit">Sign Up</button>
              {signUpFeedback && (
                <p className={signUpFeedbackType === 'success' ? 'success-message' : 'error-message2'}>
                  {signUpFeedback}
                </p>
              )}
            </form>
          </div>

          <div className="login-signup-form-container sign-in">
            <form onSubmit={handleSignIn}>
              <h1>Sign In</h1>
              <span>Enter your username or email to login</span>
              <input
                type="text"
                placeholder="Username or Email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="error-message2">{error}</p>}
              <Link to="/forgot-password">Forgot Your Password?</Link>
              <button className="login-signup-btn" type="submit">Sign In</button>
              <button type="button" className="guest-button" onClick={() => navigate('/')}>
                Continue as Guest
              </button>
            </form>
          </div>

          <div className="login-signup-toggle-container">
            <div className="login-signup-toggle">
              <div className="login-signup-toggle-panel login-signup-toggle-left">
                <h1>Welcome To Petflix</h1>
                <img className="log-logo" src={Logo} alt="Logo" />
                <p>Sign in to dive into the PetFlix world</p>
                <button className="login-signup-btn" id="login" onClick={() => setIsActive(false)}>
                  Sign In
                </button>
                <p style={{ marginBottom: '-.5rem', marginTop: '4.5rem' }}>Follow Us On Social Media</p>
                <div className="social-icons">
                  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" style={{color:'lightgray' , fontSize:'1rem' , marginTop:'1.5em'}}>
                    <FontAwesomeIcon icon={faFacebook} size="xl" />
                  </a>
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{color:'lightgray' , fontSize:'1rem' , marginTop:'1.5rem'}}>
                    <FontAwesomeIcon icon={faInstagram} size="xl" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{color:'lightgray' , fontSize:'1rem' , marginTop:'1.5rem'}}>
                    <FontAwesomeIcon icon={faTwitter} size="xl" />
                  </a>
                  <a href="https://wa.me/962123456789" target="_blank" rel="noopener noreferrer" style={{color:'lightgray' , fontSize:'1rem' , marginTop:'1.5rem'}}>
                    <FontAwesomeIcon icon={faWhatsapp} size="xl" />
                  </a>
                </div>
              </div>
              <div className="login-signup-toggle-panel login-signup-toggle-right">
                <h1>Hello, Welcome Back To Petflix</h1>
                <img className="log-logo" src={Logo} alt="Logo" />
                <p>Join us and dive into the PetFlix world</p>
                <button className="login-signup-btn" id="register" onClick={() => setIsActive(true)}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginSignup;