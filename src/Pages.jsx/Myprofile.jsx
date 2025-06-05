import React, { useState, useEffect } from 'react';
import '../Pages.css/Myprofile.css';
import profilePic from '../Components/Assets/male.jpeg';
import Item from '../Components/Item/Item.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Footer from '../Components/Footer/Footer.jsx';
import Popup from '../Components/Popup/Popup.jsx';
import axios from 'axios';
import {
  faUser,
  faCakeCandles,
  faLocationDot,
  faCalendarDays,
  faStar,
  faStarHalfAlt,
  faTruck,
  faPhone,
  faEnvelope,
  faVenusMars,
  faShareAlt,
  faFlag,
  faImage,
  faTrash,
  faComment
} from '@fortawesome/free-solid-svg-icons';

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [userAnimals, setUserAnimals] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [reviewers, setReviewers] = useState({});
  const [PIds, setPIds] = useState({});
  const [AIds, setAIds] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [initialUser, setInitialUser] = useState(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showEditButtons, setShowEditButtons] = useState(false);
  const [showOptionsButton, setShowOptionsButton] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [editedBusiness, setEditedBusiness] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [showCancelButton, setShowCancelButton] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [animalReviews, setAnimalReviews] = useState([]);
  const [reviewsWrittenByUser, setReviewsWrittenByUser] = useState({ productReviews: [], animalReviews: [] });
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [showItemPopup, setShowItemPopup] = useState(false);
const [selectedPopupItem, setSelectedPopupItem] = useState(null);
const [popupReviews, setPopupReviews] = useState([]);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productReviewContent, setProductReviewContent] = useState('');
  const [isSubmittingProductReview, setIsSubmittingProductReview] = useState(false);
  const [productReviewError, setProductReviewError] = useState(null);
  const [productReviewFeedback, setProductReviewFeedback] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [isEditingProfilePic, setIsEditingProfilePic] = useState(false);

  const location = useLocation();
  const ownerId = location.state?.ownerId;
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('userId');
    
    // Priority: URL param > ownerId from location.state > logged in user's ID
    const userIdToFetch = userIdFromUrl || ownerId || loggedInUser?.userId;

    if (!userIdToFetch) {
        setError('User not logged in');
        setLoading(false);
        return;
    }

    const fetchUserDataAndReviews = async () => {
        setLoading(true);
        setLoadingReviews(true);
        try {
            const [
                userResponse,
                animalsResponse,
                productsResponse,
                favoritesResponse,
                productReviewsResponse,
                animalReviewsResponse,
            ] = await Promise.all([
                fetch(`http://localhost:5024/api/User/${userIdToFetch}`),
                fetch('http://localhost:5024/api/Animals'),
                fetch('http://localhost:5024/api/Products'),
                fetch(`http://localhost:5024/api/Favorite/${userIdToFetch}`),
                fetch('http://localhost:5024/api/PR_'),
                fetch('http://localhost:5024/api/AR_'),
            ]);

            if (!userResponse.ok) throw new Error(`Failed to fetch user data: ${userResponse.status}`);
            if (!favoritesResponse.ok) throw new Error(`Failed to fetch favorites: ${favoritesResponse.status}`);

            const [
                userData,
                animalsData,
                productsData,
                favoritesData,
                productReviewsData,
                animalReviewsData,
            ] = await Promise.all([
                userResponse.json(),
                animalsResponse.json(),
                productsResponse.json(),
                favoritesResponse.json(),
                productReviewsResponse.json(),
                animalReviewsResponse.json(),
            ]);

            setUser(userData);
            setInitialUser(userData);
            setEditedUser({ ...userData });
            setUserAnimals(animalsData.filter((animal) => animal.userId === userData.userId));
            setUserProducts(productsData.filter((product) => product.userId === userData.userId));
            setProfilePicPreview(userData.profilePic || null);

            const productsMap = productsData.reduce((acc, product) => {
                acc[product.product_id] = product;
                return acc;
            }, {});
            setPIds(productsMap);
            const animalsMap = animalsData.reduce((acc, animal) => {
                acc[animal.animal_id] = animal;
                return acc;
            }, {});
            setAIds(animalsMap);

            const favoriteItems = favoritesData.map((fav) => {
                const animal = animalsData.find((a) => a.animal_id === fav.itemId);
                const product = productsData.find((p) => p.product_id === fav.itemId);
                if (animal) return { ...animal, favoriteId: fav.favoriteId };
                if (product) return { ...product, favoriteId: fav.favoriteId };
                return null;
            }).filter((item) => item !== null);
            setFavoriteItems(favoriteItems);

            const productReviewsWritten = productReviewsData.filter((review) => review.reviewerId === userData.userId);
            const animalReviewsWritten = animalReviewsData.filter((review) => review.reviewerId === userData.userId);
            setReviewsWrittenByUser({
                productReviews: productReviewsWritten,
                animalReviews: animalReviewsWritten,
            });
            const userProductIds = productsData.filter((product) => product.userId === userData.userId).map((product) => product.product_id);
            const userAnimalIds = animalsData.filter((animal) => animal.userId === userData.userId).map((animal) => animal.animal_id);
            const userProductReviews = productReviewsData.filter((review) => userProductIds.includes(review.productId));
            const userAnimalReviews = animalReviewsData.filter((review) => userAnimalIds.includes(review.animalId));
            setProductReviews(userProductReviews);
            setAnimalReviews(userAnimalReviews);
            const productReviewerIds = [...new Set(userProductReviews.map((review) => review.reviewerId))];
            const animalReviewerIds = [...new Set(userAnimalReviews.map((review) => review.reviewerId))];
            const allReviewerIds = [...new Set([...productReviewerIds, ...animalReviewerIds])];
            const reviewersPromises = allReviewerIds.map((reviewerId) =>
                fetch(`http://localhost:5024/api/User/${reviewerId}`).then((res) => res.json())
            );
            const reviewersData = await Promise.all(reviewersPromises);
            const reviewersMap = reviewersData.reduce((acc, reviewer) => {
                acc[reviewer.userId] = reviewer;
                return acc;
            }, {});
            setReviewers(reviewersMap);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setLoadingReviews(false);
        }
    };

    fetchUserDataAndReviews();
}, [ownerId, window.location.search]); // Add window.location.search to dependencies

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

  const uploadImage = async (file) => {
    const cloudName = 'dhbhh9aln';
    const uploadPreset = 'Petflix_perset';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      setFeedbackMessage('Failed to upload image. Please try again.');
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 3000);
      return null;
    }
  };

  const handleProfilePicChange = async (e) => {
    const { files } = e.target;
    if (files && files[0]) {
      const uploadedUrl = await uploadImage(files[0]);
      if (uploadedUrl) {
        setProfilePicPreview(uploadedUrl);
        setEditedUser((prev) => ({ ...prev, profilePic: uploadedUrl }));
      }
    }
  };

  const handleRemoveProfilePic = async () => {
    try {
      // Update the user's profilePic to null in the backend
      const response = await fetch(`http://localhost:5024/api/User/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...user, 
          profilePic: null, 
          password: initialUser.password 
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to remove profile picture');
      }
  
      // Update local state
      const updatedUser = await response.json();
      setUser(updatedUser);
      setInitialUser(updatedUser);
      setProfilePicPreview(null);
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      
      setFeedbackMessage('Profile picture removed successfully!');
      setFeedbackType('success');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setFeedbackMessage(`Error: ${error.message}`);
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const handleEditProfilePicClick = () => {
    setIsEditingProfilePic(true);
    setProfilePicPreview(user.profilePic || null);
  };

  const handleSaveProfilePic = async () => {
    try {
      const response = await fetch(`http://localhost:5024/api/User/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...user, 
          profilePic: profilePicPreview || user.profilePic, 
          password: initialUser.password 
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile picture');
      }
  
      const updatedUser = await response.json();
      setUser(updatedUser);
      setInitialUser(updatedUser);
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      setIsEditingProfilePic(false);
      setFeedbackMessage('Profile updated successfully!');
      setFeedbackType('success');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setFeedbackMessage(`Error: ${error.message}`);
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAnimal || !reviewContent) {
      setReviewError('Please select an animal and write a review.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);
    setReviewFeedback('');

    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const reviewData = {
        animalId: selectedAnimal,
        reviewerId: loggedInUser.userId,
        content: reviewContent,
        reviewDate: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:5024/api/AR_', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      setReviewFeedback('Review submitted successfully!');
      setSelectedAnimal('');
      setReviewContent('');
      const animalReviewsResponse = await fetch('http://localhost:5024/api/AR_');
      const animalReviewsData = await animalReviewsResponse.json();
      const userAnimalIds = userAnimals.map(animal => animal.animal_id);
      setAnimalReviews(animalReviewsData.filter(review => userAnimalIds.includes(review.animalId)));
    } catch (error) {
      setReviewError(`Error submitting review: ${error.message}`);
      setReviewError(`Please Login to submit a review.`);

    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleProductReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !productReviewContent) {
      setProductReviewError('Please select a product and write a review.');
      return;
    }

    setIsSubmittingProductReview(true);
    setProductReviewError(null);
    setProductReviewFeedback('');

    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const reviewData = {
        productId: selectedProduct,
        reviewerId: loggedInUser.userId,
        content: productReviewContent,
        reviewDate: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:5024/api/PR_', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      setProductReviewFeedback('Product review submitted successfully!');
      setSelectedProduct('');
      setProductReviewContent('');
      const productReviewsResponse = await fetch('http://localhost:5024/api/PR_');
      const productReviewsData = await productReviewsResponse.json();
      const userProductIds = userProducts.map(product => product.product_id);
      setProductReviews(productReviewsData.filter(review => userProductIds.includes(review.productId)));
    } catch (error) {
      setProductReviewError(`Please Login to submit a review.`);
    } finally {
      setIsSubmittingProductReview(false);
    }
  };

  const handleAvailableDaysChange = (e) => {
    const { name, checked } = e.target;
    let updatedDays = editedBusiness.availableDays ? editedBusiness.availableDays.split(',').filter(day => day.trim()) : [];

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

    setEditedBusiness({
      ...editedBusiness,
      availableDays: updatedDays.join(','),
    });
  };

  const handleAvailableHoursChange = (e) => {
    setEditedBusiness({
      ...editedBusiness,
      availableHours: e.target.value,
    });
  };

  const formatPhoneNumber = (value) => {
    if (!value) return '';

    let cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned.replace(/\+/g, '');
    }
    const limited = cleaned.slice(0, 13);
    const countryCode = limited.slice(0, 4);
    const rest = limited.slice(4);
    const formattedRest = rest.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
    return countryCode + (rest ? ' ' + formattedRest : '');
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    const formattedPhoneNumber = formatPhoneNumber(value);
    if (isEditingDetails) {
      setEditedDetails((prev) => ({ ...prev, phone: formattedPhoneNumber }));
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleOptionsClick = () => {
    setShowEditButtons(true);
    setShowOptionsButton(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowEditButtons(false);
    setShowOptionsButton(true);
    setEditedUser({ ...initialUser });
    setIsEditingBio(false);
    setEditedBio('');
    setIsEditingProfilePic(false);
    setProfilePicPreview(initialUser.profilePic || null);
  };

  const handleCancelPassword = () => {
    setIsEditingPassword(false);
    setShowEditButtons(false);
    setShowOptionsButton(true);
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrorMessage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isEditingDetails) {
      setEditedDetails((prev) => ({ ...prev, [name]: name === 'gender' ? Number(value) : value }));
    } else if (isEditingBusiness) {
      setEditedBusiness((prev) => ({ ...prev, [name]: value }));
    } else if (isEditing) {
      setEditedUser((prev) => ({ ...prev, [name]: name === 'gender' ? Number(value) : value }));
    }
  };

  const handleSave = async (dataToUpdate, endpoint, setState, setIsEditingState) => {
    setErrorMessage(null);
    try {
      const response = await fetch(`http://localhost:5024/api/User/${user.userId}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to update data';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const updatedData = await response.json();
      setState(updatedData);
      setInitialUser(updatedData);
      if (setIsEditingState) setIsEditingState(false);

      setFeedbackMessage('Changes saved successfully!');
      setFeedbackType('success');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (error) {
      console.error('Error updating data:', error);
      setErrorMessage(`Error in Updating: ${error.message}`);
      setFeedbackMessage(`Error in Updating: ${error.message}`);
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const handleEditNameClick = () => {
    setIsEditingName(true);
    setEditedName(user.name);
  };

  const handleSaveName = async () => {
    await handleSave({ ...user, name: editedName, password: initialUser.password }, '', setUser, setIsEditingName);
  };

  const handleCancelName = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const handleEditDetailsClick = () => {
    setIsEditingDetails(true);
    const formattedPhone = formatPhoneNumber(user.phone || '');
    setEditedDetails({
      username: user.username,
      email: user.email,
      birthDay: user.birthDay?.split('T')[0],
      gender: user.gender,
      phone: formattedPhone,
    });
  };

  const handleSaveDetails = async () => {
    const cleanedPhone = editedDetails.phone.replace(/\s/g, '');
    const updatedDetails = { ...editedDetails, phone: cleanedPhone };
    await handleSave({ ...user, ...updatedDetails, password: initialUser.password }, '', setUser, setIsEditingDetails);
  };

  const handleCancelDetails = () => {
    setIsEditingDetails(false);
    setEditedDetails({});
    setSelectedCountry('');
  };

  const handleEditBusinessClick = () => {
    setIsEditingBusiness(true);
    const [country = '', city = ''] = user.location ? user.location.split(', ') : ['', ''];
    setSelectedCountry(country);
    setEditedBusiness({
      location: user.location || '',
      delivery_method: user.delivery_method || '',
      availableDays: user.availableDays || '',
      availableHours: user.availableHours || '',
      country,
      city,
    });
  };

  const handleSaveBusiness = async () => {
    await handleSave({ ...user, ...editedBusiness, password: initialUser.password }, '', setUser, setIsEditingBusiness);
  };

  const handleCancelBusiness = () => {
    setIsEditingBusiness(false);
    setEditedBusiness({});
    setSelectedCountry('');
  };

  const handleEditPasswordClick = () => {
    setIsEditingPassword(true);
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrorMessage(null);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrorMessage('New passwords do not match.');
      return;
    }
    await handleSave(passwordData, '/password', setUser, setIsEditingPassword);
  };

  const handleDeleteAccount = async () => {
    setShowDeletePopup(true);
  };

const handleConfirmDelete = async () => {
  try {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser?.token || !loggedInUser?.userId) {
      setFeedbackMessage('Please log in to delete your account.');
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 5000);
      setShowDeletePopup(false);
      navigate('/login');
      return;
    }

    if (loggedInUser.userId !== user.userId) {
      setFeedbackMessage('You can only delete your own account.');
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 5000);
      setShowDeletePopup(false);
      return;
    }

    setFeedbackMessage('Deleting account... Please wait.');
    setFeedbackType('info');
    setShowDeletePopup(false);

    const response = await axios.delete(`http://localhost:5024/api/User/${user.userId}`, {
      headers: {
        'Authorization': `Bearer ${loggedInUser.token}`,
        'Content-Type': 'application/json',
      },
    });

    setFeedbackMessage('Account deleted successfully!');
    setFeedbackType('success');

    setTimeout(() => {
      localStorage.removeItem('loggedInUser');
      setUser(null);
      setUserAnimals([]);
      setUserProducts([]);
      setFavoriteItems([]);
      setProductReviews([]);
      setAnimalReviews([]);
      setReviewsWrittenByUser({ productReviews: [], animalReviews: [] });
      navigate('/', { replace: true });
    }, 4000);
  } catch (error) {
    console.error('Error deleting account:', error);
    let errorMessage = 'Failed to delete account.';
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        localStorage.removeItem('loggedInUser');
        setTimeout(() => navigate('/login'), 3000);
      } else if (error.response.status === 404) {
        errorMessage = 'User not found.';
      } else if (error.response.status === 403) {
        errorMessage = 'You are not authorized to delete this account.';
      } else {
        errorMessage = error.response.data?.message || errorMessage;
      }
    }
    setFeedbackMessage(`Error: ${errorMessage}`);
    setFeedbackType('error');
    setTimeout(() => setFeedbackMessage(''), 5000);
    setShowDeletePopup(false);
  }
};

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
  };

  const toggleFavorite = async (id, type, isCurrentlyFavorited) => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userId = loggedInUser?.userId;
    if (!userId) {
      setFeedbackMessage('User not logged in');
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 3000);
      return;
    }

    const itemKey = type === 'animal' ? 'animal_id' : 'product_id';
    const existingFav = favoriteItems.find((item) => item[itemKey] === id);

    try {
      if (isCurrentlyFavorited && existingFav) {
        // Remove from favorites
        const response = await axios.delete(`http://localhost:5024/api/Favorite?userId=${userId}&itemId=${id}`);
        if (response.status !== 200) {
          throw new Error('Failed to remove favorite');
        }

        setFavoriteItems(favoriteItems.filter((item) => item.favoriteId !== existingFav.favoriteId));
        setFeedbackMessage('Item removed from favorites!');
        setFeedbackType('success');
      } else if (!isCurrentlyFavorited && !existingFav) {
        // Add to favorites
        const favoriteData = {
          userId: userId,
          itemId: id,
          ...(type === 'animal' ? { animalId: id } : { productId: id }),
        };
        console.log('Adding favorite with payload:', favoriteData);
        const response = await axios.post('http://localhost:5024/api/Favorite', favoriteData);
        if (response.status !== 200 && response.status !== 201) {
          throw new Error('Failed to add favorite');
        }

        const newFavItem = type === 'animal'
          ? { ...userAnimals.find((a) => a.animal_id === id), favoriteId: response.data.favoriteId }
          : { ...userProducts.find((p) => p.product_id === id), favoriteId: response.data.favoriteId };
        setFavoriteItems([...favoriteItems, newFavItem]);
        setFeedbackMessage('Item added to favorites!');
        setFeedbackType('success');
      } else {
        // No action if state doesn't match intent (e.g., "Add" but already favorited)
        setFeedbackMessage(`Item is already ${isCurrentlyFavorited ? 'in' : 'not in'} your favorites.`);
        setFeedbackType('error');
        setTimeout(() => setFeedbackMessage(''), 3000);
        return;
      }

      // Update local state for the item’s favorite status
      const updatedItems = type === 'animal' ? [...userAnimals] : [...userProducts];
      const updatedItem = updatedItems.find((item) => item[itemKey] === id);
      if (updatedItem) updatedItem.favorite = isCurrentlyFavorited ? 0 : 1;
      type === 'animal' ? setUserAnimals(updatedItems) : setUserProducts(updatedItems);

      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setFeedbackMessage(`Error: ${error.response?.data?.message || error.message}`);
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleEditBioClick = () => {
    setIsEditingBio(true);
    setEditedBio(user?.bio || '');
  };

  const handleSaveBioClick = async () => {
    try {
      const response = await fetch(`http://localhost:5024/api/User/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, bio: editedBio, password: initialUser.password }),
      });

      if (response.ok) {
        setUser({ ...user, bio: editedBio });
        localStorage.setItem('loggedInUser', JSON.stringify({ ...user, bio: editedBio }));
        setIsEditingBio(false);
      } else {
        console.error('Failed to update bio');
      }
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setEditedBusiness((prev) => ({ ...prev, country, city: '', location: '' }));
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setEditedBusiness((prev) => ({ ...prev, city, location: `${prev.country}, ${city}` }));
  };

  const handleItemNameClick = async (itemId, itemType) => {
  try {
    const endpoint = itemType === 'animal' 
      ? `http://localhost:5024/api/Animals/${itemId}`
      : `http://localhost:5024/api/Products/${itemId}`;
    
    const response = await axios.get(endpoint);
    const fullItemData = response.data;

    // Fetch reviews for the item
    let reviewsData = [];
    if (itemType === 'product') {
      const reviewsResponse = await axios.get(`http://localhost:5024/api/PR_/product/${itemId}`);
      reviewsData = reviewsResponse.data;
    } else if (itemType === 'animal') {
      const reviewsResponse = await axios.get(`http://localhost:5024/api/AR_/animal/${itemId}`);
      reviewsData = reviewsResponse.data;
    }

    setSelectedPopupItem({
      ...fullItemData,
      itemType: itemType === 'animal' ? 'Animal' : 'Product',
    });
    setPopupReviews(reviewsData);
    setShowItemPopup(true);
  } catch (error) {
    console.error("Error fetching item details:", error);
    setFeedbackMessage('Failed to load item details');
    setFeedbackType('error');
    setTimeout(() => setFeedbackMessage(''), 3000);
  }
};

// Add this function to close the popup
const closeItemPopup = () => {
  setShowItemPopup(false);
  setSelectedPopupItem(null);
  setPopupReviews([]);
};


  if (loading) {
    return (
      <div className="loading-overlay show">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-overlay show">
        <div className="error-message">
          {error}
          <p>Failed to fetch.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <p>No user data found. Please log in.</p>;
  }

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const isCurrentUserProfile = !ownerId || ownerId === loggedInUser?.userId;
  const userFirstName = user.name.split(' ')[0];

  return (
    <>
      <div className="profile-page-container">
        <div className="profile-header">
          <div className="profile-info">
            <img
              src={profilePicPreview || user.profilePic || profilePic}
              alt="Profile"
              className="profile-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = profilePic;
              }}
            />
            <h2>
              {isEditingName ? (
                <input className="input3" name="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
              ) : (
                user.name
              )}
            </h2>
            {feedbackMessage && (
              <div
                key="feedback"
                className={`message ${feedbackType === 'success' ? 'succsess-message' : 'error-message2'}`}
                style={{ marginBottom: '2rem', marginTop: '-1rem' }}
              >
                {feedbackMessage}
              </div>
            )}
            {showDeletePopup && (
              <div key="delete-popup" className="popup2">
                <h3>Are you sure {userFirstName} that you want to delete your account?</h3>
                <p>This action cannot be undone.</p>
                <div className="popup-buttons">
                  <button key="confirm-delete" onClick={handleConfirmDelete} className="popup2-button">
                    Yes, Delete
                  </button>
                  <button key="cancel-delete" onClick={handleCancelDelete} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {showPassword && (
              <div className="button-container" style={{ position: 'relative', width: '70rem', marginBottom: '2.5rem' }}>
                Your Password: {initialUser?.password}
              </div>
            )}

            <div className="button-container">
            <button
    key="share-profile"
    className="edit-btn"
    onClick={() => {
        // Construct the correct profile URL with user ID
        const profileUrl = `${window.location.origin}/myprofile?userId=${user.userId}`;
        navigator.clipboard.writeText(profileUrl)
            .then(() => {
                setFeedbackMessage('Profile link copied to clipboard!');
                setFeedbackType('success');
                setTimeout(() => setFeedbackMessage(''), 3000);
            })
            .catch(err => {
                console.error('Failed to copy link: ', err);
                setFeedbackMessage('Failed to copy profile link. Please copy manually.');
                setFeedbackType('error');
                setTimeout(() => setFeedbackMessage(''), 3000);
            });
    }}
>
<FontAwesomeIcon icon={faShareAlt} style={{ marginRight: '0.5rem' }} />
    Share Profile
  </button>

  {isCurrentUserProfile && (
  <button
    key="view-orders"
    className="edit-btn"
    onClick={() => navigate('/orderspage')}
  >
    My Orders
  </button>
)}


  {isCurrentUserProfile && (
  <button
    key="view-feedback"
    className="edit-btn"
    onClick={() => navigate('/feedback')}
  >
    My Feedbacks
  </button>
)}

{!isCurrentUserProfile && (
  <button
    key="report-profile"
    className="edit-btn"
    onClick={() => {
      navigate('/report', { 
        state: { 
          targetType: 'User', // This matches your ReportTargetType enum
          targetId: user.userId // The ID of the user being reported
        }
      });
    }}
  >
    <FontAwesomeIcon icon={faFlag} style={{ marginRight: '0.5rem' }} />
    Report {userFirstName}
  </button>
)}

              {isCurrentUserProfile && showOptionsButton && (
                <button
                  className="edit-btn options-btn"
                  onClick={() => {
                    handleOptionsClick();
                    setShowCancelButton(true);
                  }}
                >
                  Options
                </button>
              )}
              {isCurrentUserProfile && showEditButtons && (
                <>
                  {showCancelButton && (
                    <button
                      key="cancel"
                      style={{ right: '23rem' }}
                      className="cancel-btn"
                      onClick={() => {
                        setShowCancelButton(false);
                        handleOptionsClick();
                        handleCancel();
                        handleCancelName();
                        handleCancelDetails();
                        handleCancelBusiness();
                        handleCancelPassword();
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    key="edit-name"
                    className={isEditingName ? 'cancel-btn' : 'edit-btn'}
                    onClick={isEditingName ? handleSaveName : handleEditNameClick}
                  >
                    {isEditingName ? 'Save Changes' : 'Edit Name'}
                  </button>

                  <button
                    key="edit-profile"
                    className={isEditingDetails ? 'cancel-btn' : 'edit-btn'}
                    onClick={isEditingDetails ? handleSaveDetails : handleEditDetailsClick}
                  >
                    {isEditingDetails ? 'Save Changes' : 'Edit Profile'}
                  </button>
                  <button
                    key="edit-business"
                    className={isEditingBusiness ? 'cancel-btn' : 'edit-btn'}
                    onClick={isEditingBusiness ? handleSaveBusiness : handleEditBusinessClick}
                  >
                    {isEditingBusiness ? 'Save Changes' : 'Edit Business Info'}
                  </button>

                  <button
                    key="edit-bio"
                    className={isEditingBio ? 'cancel-btn' : 'edit-btn'}
                    onClick={isEditingBio ? handleSaveBioClick : handleEditBioClick}
                  >
                    {isEditingBio ? 'Save Changes' : 'Edit Bio'}
                  </button>

                  <button
                    key="edit-password"
                    className={isEditingPassword ? 'cancel-btn' : 'edit-btn'}
                    onClick={isEditingPassword ? handleSavePassword : handleEditPasswordClick}
                    style={{ top: '5rem' }}
                  >
                    {isEditingPassword ? 'Save Changes' : 'Edit Password'}
                  </button>

                  <button
                    key="show-password"
                    className={showPassword ? 'cancel-btn' : 'edit-btn'}
                    onClick={handleShowPassword}
                  >
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>

                  <button
                    key="edit-profile-pic"
                    className={isEditingProfilePic ? 'cancel-btn' : 'edit-btn'}
                    onClick={isEditingProfilePic ? handleSaveProfilePic : handleEditProfilePicClick}
                    style={{ top: '5rem' }}
                  >
                    <FontAwesomeIcon icon={faImage} style={{ marginRight: '0.5rem' }} />
                    {isEditingProfilePic ? 'Save Profile Pic' : 'Edit Profile Pic'}
                  </button>

                  {isEditingProfilePic && profilePicPreview && (
                    <button
                      key="remove-profile-pic"
                      className="delete-btn"
                      onClick={handleRemoveProfilePic}
                      style={{ top: '7rem' }}
                    >
                      <FontAwesomeIcon icon={faTrash} style={{ marginRight: '0.5rem' }} />
                      Remove Profile Pic
                    </button>
                  )}

                  <button
                    key="delete-account"
                    className="delete-btn"
                    onClick={handleDeleteAccount}
                    style={{ top: '7rem' }}
                  >
                    Delete Account
                  </button>
                </>
              )}
            </div>

            {isCurrentUserProfile && isEditingPassword && (
              <div className="password-edit-form" style={{ marginBottom: '2.5rem' }}>
                <input
                  className="input2"
                  type="password"
                  name="oldPassword"
                  placeholder="Old Password"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordInputChange}
                />
                <input
                  className="input2"
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                />
                <input
                  className="input2"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                />
                {passwordErrorMessage && <p className="error-message">{passwordErrorMessage}</p>}
              </div>
            )}

            {isCurrentUserProfile && isEditingProfilePic && (
              <div className="profile-pic-edit-form" style={{ marginBottom: '2.5rem' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="input2"
                />
                
              </div>
            )}
          </div>

          <div className="user-container">
            <div className="user-details">
              <h3>Profile :</h3>
              <p>
                <FontAwesomeIcon icon={faUser} /> Username :{' '}
                {isCurrentUserProfile && isEditingDetails ? (
                  <input className="input2" name="username" value={editedDetails.username} onChange={handleInputChange} />
                ) : (
                  user.username
                )}
              </p>
              <p>
                <FontAwesomeIcon icon={faCakeCandles} /> Birthday :{' '}
                {isCurrentUserProfile && isEditingDetails ? (
                  <input
                    className="input2"
                    type="date"
                    name="birthDay"
                    value={editedDetails.birthDay || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  user.birthDay ? new Date(user.birthDay).toLocaleDateString() : 'Not set'
                )}
              </p>

              {isCurrentUserProfile && (
              <p>
                <FontAwesomeIcon icon={faEnvelope} /> Email :{' '}
                {isCurrentUserProfile && isEditingDetails ? (
                  <input className="input2" name="email" value={editedDetails.email} onChange={handleInputChange} />
                ) : (
                  <a href={`mailto:${user.email}`} className='phone-link' style={{ color: "black" , textDecoration:'none'}}>{user.email}</a>
                )}
              </p>
                )}

              <p>
                <FontAwesomeIcon icon={faVenusMars} /> Gender :{' '}
                {isCurrentUserProfile && isEditingDetails ? (
                  <select className="input2" name="gender" value={editedDetails.gender ?? ''} onChange={handleInputChange}>
                    <option value="0">Male</option>
                    <option value="1">Female</option>
                  </select>
                ) : (
                  user.gender === 0 ? ' Male' : user.gender === 1 ? ' Female' : ' Not specified'
                )}
              </p>
              <p>
                <FontAwesomeIcon icon={faPhone} /> Phone Number :{' '}
                {isCurrentUserProfile && isEditingDetails ? (
                  <input
                    className="input2"
                    type="tel"
                    name="phone"
                    placeholder="e.g., +123 456 789 01"
                    value={editedDetails.phone || ''}
                    onChange={handlePhoneChange}
                    maxLength={16}
                  />
                ) : (
                  <a href={`tel:${user.phone}`} className='phone-link' style={{ color: "black" , textDecoration:'none'}}>{formatPhoneNumber(user.phone) || 'Not set'}</a>
                )}
              </p>
            </div>

            <div className="user-details">
              <h3>Business Info :</h3>
              <p>
                <FontAwesomeIcon icon={faLocationDot} /> Location :{' '}
                {isCurrentUserProfile && isEditingBusiness ? (
                  <>
                    <select
                      name="country"
                      value={editedBusiness.country || ''}
                      onChange={handleCountryChange}
                      required
                      className="input2"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.country} value={country.country}>
                          {country.country}
                        </option>
                      ))}
                    </select>
                    <select
                      name="city"
                      value={editedBusiness.city || ''}
                      onChange={handleCityChange}
                      required
                      disabled={!selectedCountry}
                      className="input2"
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  user.location || 'Not set'
                )}
              </p>
              <p>
                <FontAwesomeIcon icon={faTruck} /> Delivery :{' '}
                {isCurrentUserProfile && isEditingBusiness ? (
                  <select
                    name="delivery_method"
                    className="input2"
                    value={editedBusiness.delivery_method}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Availability</option>
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                ) : (
                  user.delivery_method || 'Not set'
                )}
              </p>
              <p>
                <FontAwesomeIcon icon={faCalendarDays} /> Available Days :{' '}
                {isCurrentUserProfile && isEditingBusiness ? (
                  <div className="available-days-container2">
                    {[' Sunday ', ' Monday ', ' Tuesday ', ' Wednesday ', ' Thursday ', ' Friday ', ' Saturday '].map((day) => (
                      <div key={day}>
                        <input
                          type="checkbox"
                          name={day}
                          checked={
                            editedBusiness.availableDays === 'EveryDay' ||
                            (editedBusiness.availableDays?.includes('Weekends') && (day === ' Friday ' || day === ' Saturday ')) ||
                            editedBusiness.availableDays?.includes(day)
                          }
                          onChange={handleAvailableDaysChange}
                        />
                        <label>{day}</label>
                      </div>
                    ))}
                  </div>
                ) : (
                  user.availableDays || 'Not set'
                )}
              </p>
              <p>
                <FontAwesomeIcon icon={faCalendarDays} /> Available Time :{' '}
                {isCurrentUserProfile && isEditingBusiness ? (
                  <select
                    name="availableHours"
                    className="input2"
                    value={editedBusiness.availableHours || ''}
                    onChange={handleAvailableHoursChange}
                  >
                    <option value="">Select Available Hours</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                    <option value="All The Day">All The Day</option>
                  </select>
                ) : (
                  user.availableHours || 'Not set'
                )}
              </p>
                {/* 
                  <p>
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStarHalfAlt} />
                    {user.rating}/5 Trust Rating
                  </p>
                */}
            </div>

            <div className="user-details">
              <h3>Bio :</h3>
              {isEditingBio ? (
                <input
                  className="input9"
                  name="bio"
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                />
              ) : (
                user?.bio ? <p>{user.bio}</p> : <p>No Bio yet.</p>
              )}
            </div>

            {isCurrentUserProfile && (
              <div className="review-details">
                <h3>Your Reviews :</h3>
                {loadingReviews ? (
                  <p>Loading reviews...</p>
                ) : (reviewsWrittenByUser.productReviews.length > 0 || reviewsWrittenByUser.animalReviews.length > 0) ? (
                  <div>
                    {[...reviewsWrittenByUser.productReviews, ...reviewsWrittenByUser.animalReviews].reverse().map((review) => {
                      const isProductReview = 'productId' in review;
                      const item = isProductReview ? PIds[review.productId] : AIds[review.animalId];
                      return (
                        <div key={isProductReview ? review.productReviewId : review.animalReviewId} className="review-item">
                          <p>
                            <div>
                              <img
                                src={user.profilePic || profilePic}
                                alt="Reviewer Profile"
                                className="reviewer-pic2"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = profilePic;
                                }}
                              />
                              <p style={{ display: 'inline-block' }}>
                                <strong>You</strong> <span style={{ marginLeft: '0rem' }}>Reviewed</span>
                                <strong
                                  style={{ marginLeft: '.3rem', cursor: 'pointer', textDecoration: 'underline' }}
                                  onClick={() => handleItemNameClick(
                                    isProductReview ? item.product_id : item.animal_id,
                                    isProductReview ? 'product' : 'animal'
                                  )}
                                >
                                  {item ? (isProductReview ? item.product_title : item.animal_title) : "Unknown Item"}
                                </strong>
                              </p>
                            </div>
                            <div className="review-content">"{review.content}"</div>
                            <em>{new Date(review.reviewDate).toLocaleDateString()}</em>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p>You did not write any reviews yet.</p>
                )}
              </div>
            )}

            <div className="review-details">
              <h3>{isCurrentUserProfile ? 'Reviews On Your Products' : `${userFirstName}'s Product Reviews`} :</h3>
              {loadingReviews ? (
                <p>Loading reviews...</p>
              ) : productReviews.length > 0 ? (
                <div>
                  {[...productReviews].reverse().map((review) => {
                    const reviewer = reviewers[review.reviewerId];
                    const product = PIds[review.productId];
                    return (
                      <div key={review.productReviewId} className="review-item">
                        <p>
                          <div>
                            <img
                              src={reviewer?.profilePic || profilePic}
                              alt="Reviewer Profile"
                              className="reviewer-pic2"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = profilePic;
                              }}
                            />
                            <p style={{ display: 'inline-block' }}>
                              <strong
                                style={{ cursor: 'pointer'}}
                                className='phone-link'
                                onClick={() => navigate('/myprofile', { state: { ownerId: review.reviewerId } })}
                              >
                                {reviewer ? reviewer.name : "Unknown User"}
                              </strong>
                              <span style={{ marginLeft: '.3rem' }}>Reviewed</span>
                              <strong 
                              style={{ marginLeft: '.3rem', cursor: 'pointer', textDecoration: 'underline' }}
                              onClick={() => handleItemNameClick(product.product_id, 'product')}
                            >
                              {product ? product.product_title : "Unknown Product"}
                            </strong>

                            </p>
                          </div>
                          <div className="review-content">"{review.content}"</div>
                          <em>{new Date(review.reviewDate).toLocaleDateString()}</em>
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No reviews for your products yet.</p>
              )}
            </div>

            <div className="review-details">
              <h3>{isCurrentUserProfile ? 'Reviews On Your Animals' : `${userFirstName}'s Animal Reviews`} :</h3>
              {loadingReviews ? (
                <p>Loading reviews...</p>
              ) : animalReviews.length > 0 ? (
                <div>
                  {[...animalReviews].reverse().map((review) => {
                    const reviewer = reviewers[review.reviewerId];
                    const animal = AIds[review.animalId];
                    return (
                      <div key={review.animalReviewId} className="review-item">
                        <p>
                          <div>
                            <img
                              src={reviewer?.profilePic || profilePic}
                              alt="Reviewer Profile"
                              className="reviewer-pic2"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = profilePic;
                              }}
                            />
                            <p style={{ display: 'inline-block' }}>
                              <strong
                                style={{ cursor: 'pointer' }}
                                className='phone-link'
                                onClick={() => navigate('/myprofile', { state: { ownerId: review.reviewerId } })}
                              >
                                {reviewer ? reviewer.name : "Unknown User"}
                              </strong>
                              <span style={{ marginLeft: '.3rem' }}>Reviewed</span>
                              <strong 
                              style={{ marginLeft: '.3rem', cursor: 'pointer', textDecoration: 'underline' }}
                              onClick={() => handleItemNameClick(animal.animal_id, 'animal')}
                            >
                              {animal ? animal.animal_title : "Unknown Animal"}
                            </strong>

                            </p>
                          </div>
                          <div className="review-content">"{review.content}"</div>
                          <em>{new Date(review.reviewDate).toLocaleDateString()}</em>
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No reviews for your animals yet.</p>
              )}
            </div>
          </div>

          <div className='user-container'>
            {!isCurrentUserProfile && (
              <div className="review-form">
                <h3>Write a Review for {userFirstName}'s Animals</h3>
                <form onSubmit={handleReviewSubmit}>
                  <select
                    value={selectedAnimal}
                    onChange={(e) => setSelectedAnimal(e.target.value)}
                    required
                  >
                    <option value="">Select an Animal</option>
                    {userAnimals.map((animal) => (
                      <option key={animal.animal_id} value={animal.animal_id}>
                        {animal.animal_title}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Write your animal review here..."
                    required
                  />
                  <button type="submit" disabled={isSubmittingReview}>
                    {isSubmittingReview ? 'Submitting...' : 'Submit Animal Review'}
                  </button>
                </form>
                {reviewError && <p className="error-message2">{reviewError}</p>}
                {reviewFeedback && <p className="succsess-message">{reviewFeedback}</p>}
              </div>
            )}

            {!isCurrentUserProfile && (
              <div className="review-form">
                <h3>Write a Review for {userFirstName}'s Products</h3>
                <form onSubmit={handleProductReviewSubmit}>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    required
                  >
                    <option value="">Select a Product</option>
                    {userProducts.map((product) => (
                      <option key={product.product_id} value={product.product_id}>
                        {product.product_title}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={productReviewContent}
                    onChange={(e) => setProductReviewContent(e.target.value)}
                    placeholder="Write your product review here..."
                    required
                  />
                  <button type="submit" disabled={isSubmittingProductReview}>
                    {isSubmittingProductReview ? 'Submitting...' : 'Submit Product Review'}
                  </button>
                </form>
                {productReviewError && <p className="error-message2">{productReviewError}</p>}
                {productReviewFeedback && <p className="succsess-message">{productReviewFeedback}</p>}
              </div>
            )}
          </div>
        </div>

        <div className='Cards-items'>
  <div className="card-section">
    <h2 className="user-items-section-h2">
      {isCurrentUserProfile ? `Your Animals (${userAnimals.length})` : `${userFirstName}'s Animals (${userAnimals.length})`}
    </h2>
    {userAnimals.length > 0 ? (
      <div className="user-items-section">
        <div className="items-gallery">
          {userAnimals.map((animal) => (
            <Item
              className="item-card"
              key={animal.animal_id}
              {...animal}
              onFavoriteChange={(id, isFavorited) => toggleFavorite(id, 'animal', isFavorited)}
            />
          ))}
        </div>
      </div>
    ) : (
      <p className="no-items-message">
        {isCurrentUserProfile ? 'You do not have any animals.' : `${userFirstName} does not have any animals.`}
      </p>
    )}
  </div>

  <div className="card-section">
    <h2 className="user-items-section-h2">
      {isCurrentUserProfile ? `Your Products (${userProducts.length})` : `${userFirstName}'s Products (${userProducts.length})`}
    </h2>
    {userProducts.length > 0 ? (
      <div className="user-items-section">
        <div className="items-gallery">
          {userProducts.map((product) => (
            <Item
              className="item-card"
              key={product.product_id}
              {...product}
              onFavoriteChange={(id, isFavorited) => toggleFavorite(id, 'product', isFavorited)}
            />
          ))}
        </div>
      </div>
    ) : (
      <p className="no-items-message">
        {isCurrentUserProfile ? 'You do not have any products.' : `${userFirstName} does not have any products.`}
      </p>
    )}
  </div>

  {isCurrentUserProfile && (
    <div className="card-section">
      <h2 className="user-items-section-h2">
        Your Favorites ({favoriteItems.length})
      </h2>
      {favoriteItems.length > 0 ? (
        <div className="user-items-section">
          <div className="items-gallery">
            {favoriteItems.map((item) => (
              <Item
                className="item-card"
                key={`fav-${item.animal_id || item.product_id}`}
                {...item}
                onFavoriteChange={(id, isFavorited) => toggleFavorite(id, item.animal_id ? 'animal' : 'product', isFavorited)}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="no-items-message">No favorite items yet.</p>
      )}
    </div>
  )}
  {showItemPopup && selectedPopupItem && (
  <div className="popup-overlay">
    <div className="popup-content">
      <button className="popup-close" onClick={closeItemPopup}>×</button>
      <Popup
        name={selectedPopupItem.animal_title || selectedPopupItem.product_title}
        closePopup={closeItemPopup}
        handleRating={() => {}}
        toggleFavorite={() => {}}
        isFavorite={false}
        itemId={selectedPopupItem.animal_id || selectedPopupItem.product_id}
        addToCart={() => {}}
        itemType={selectedPopupItem.itemType}
        animal_pic={selectedPopupItem.animal_pic || selectedPopupItem.imageUrl}
        product_pic={selectedPopupItem.product_pic || selectedPopupItem.imageUrl}
        animal_new_price={selectedPopupItem.animal_new_price || selectedPopupItem.price}
        product_new_price={selectedPopupItem.product_new_price || selectedPopupItem.price}
        animal_description={selectedPopupItem.animal_description || selectedPopupItem.description}
        product_description={selectedPopupItem.product_description || selectedPopupItem.description}
        reviews={popupReviews}
      />
    </div>
  </div>
)}
</div>

      </div>
      <Footer />
    </>
  );
};

export default MyProfile;
