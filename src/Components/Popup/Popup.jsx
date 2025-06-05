import React, { useState, useRef, useEffect } from "react";
import "./Popup.css";
import "./Popup2.css";
import "./Popup3.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faCircleXmark, faCirclePlus, faCircleMinus, faArrowUpRightFromSquare, faFlag } from "@fortawesome/free-solid-svg-icons";import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Static data (unchanged)
const fallbackImage = '/images/fallback-image.png';

const productData = {
  categories: ["Food", "Toys", "Accessories", "Grooming", "Health", "Housing", "Training", "Other"],
  productTypes: {
    Food: ["Dry Food", "Wet Food", "Treats", "Supplements", "Special Diet", "Hay", "Grain", "Feed", "Seeds", "Nuts", "Insects"],
    Toys: ["Interactive Toys", "Chew Toys", "Plush Toys", "Fetch Toys", "Puzzle Toys", "Riding Toys", "Grazing Balls", "Climbing Structures", "Scratching Posts"],
    Accessories: [
      "Collars", "Leashes", "Harnesses", "Bowls", "Water Bottles",
      "ID Tags", "Clothing", "Carriers", "Travel Accessories", "Saddles", "Halters", "Shears", "Milking Equipment", "Aquarium Decorations", "Terrarium Substrate"
    ],
    Grooming: ["Brushes", "Shampoos", "Conditioners", "Nail Clippers", "Toothbrushes", "Dental Care", "Ear Cleaners", "Eye Cleaners", "Hoof Picks", "Clippers", "Aquarium Cleaning Tools"],
    Health: ["Vitamins", "Medications", "Flea & Tick Control", "Worming Treatments", "First Aid", "Joint Care", "Vaccines", "Dewormers", "Water Conditioners", "Reptile Supplements"],
    Housing: ["Cages", "Aquariums", "Terrariums", "Beds", "Kennels", "Litter Boxes", "Scratching Posts", "Stables", "Barns", "Fences", "Aviaries", "Hutches"],
    Training: ["Clickers", "Training Treats", "Leads", "Training Pads", "Agility Equipment", "Ropes", "Whips", "Training Books", "Behavioral Aids"],
    Other: ["Other"],
  },
  productSizes: ["Extra Small", "Small", "Medium", "Large", "Extra Large"],
  designedFor: ["Cats", "Dogs", "Birds", "Fish", "Small Animals", "Reptiles", "Horses", "Cows", "Sheep", "Goats", "Poultry", "Camels"],
};

const usages = {
  Nutrition: ["Daily Nutrition", "Weight Management", "Growth", "Specific Needs", "Grazing", "Forage", "Seed Eating", "Insect Eating"],
  Play: ["Playtime", "Exercise", "Mental Stimulation", "Bonding", "Entertainment", "Riding", "Climbing", "Scratching"],
  Accessories: ["Safety", "Comfort", "Identification", "Style", "Work", "Handling", "Walking", "Aquatic Environment", "Reptile Habitat"],
  Grooming: ["Hygiene", "Coat Health", "Dental Health", "Parasite Prevention", "Hoof Care", "Aquarium Maintenance"],
  Health: ["Preventative Care", "Treatment", "Recovery", "Well-being", "Livestock Health", "Aquatic Health", "Reptile Health"],
  Housing: ["Shelter", "Security", "Enrichment", "Resting", "Housing", "Decoration", "Livestock Housing", "Aquatic Housing", "Reptile Housing"],
  Training: ["Behavior Modification", "Obedience", "Agility", "Socialization", "Riding Training", "Herding", "Aquatic Training", "Reptile Handling"],
};

const healthStatuses = {
  "Excellent Health": ["Vibrant", "Energetic", "Alert", "Optimal Weight", "Healthy Coat"],
  "Good Health": ["Active", "Normal Appetite", "Regular Bowel Movements", "Clear Eyes", "Good Mobility"],
  "Fair Health": ["Slightly Lethargic", "Reduced Appetite", "Occasional Coughing", "Mild Skin Irritation", "Minor Mobility Issues"],
  "Poor Health": ["Lethargic", "Loss of Appetite", "Persistent Coughing", "Severe Skin Irritation", "Significant Mobility Issues"],
  "Critical Health": ["Unresponsive", "Labored Breathing", "Severe Bleeding", "Seizures", "Paralysis"],
  "Recovering": ["Post-Surgery", "Convalescing", "Gradual Improvement", "Needs Special Care"],
  "Special Needs": ["Chronic Illness", "Disability", "Requires Specialized Care", "Senior Animal"],
};

const animalTypes = {
  "Dog Types": ["Golden Retriever", "Labrador", "Poodle", "Beagle", "Bulldog", "Chihuahua", "Dalmatian", "Shih Tzu", "German Shepherd", "Boxer", "Dachshund", "Yorkshire Terrier", "Australian Shepherd", "French Bulldog", "Saluki", "Canaan Dog", "Jordanian Dog", "Other"],
  "Cat Types": ["Persian", "Siamese", "Sphynx", "Ragdoll", "Arabian Mau", "Jordanian Cat", "Maine Coon", "Bengal", "Russian Blue", "Abyssinian", "British Shorthair", "Scottish Fold", "Devon Rex", "Burmese", "Other"],
  "Bird Types": ["Jordanian Pigeon", "Parrot", "Canary", "Cockatiel", "Macaw", "Finch", "Lovebird", "Budgie", "Conure", "Dove", "Pigeon", "Falcon", "Other"],
  "Horse Types": ["Arabian Horse", "Thoroughbred", "Quarter Horse", "Appaloosa", "Draft Horse", "Pony", "Other"],
  "Cow Types": ["Jordanian Cow", "Holstein", "Jersey", "Angus", "Hereford", "Brahman", "Other"],
  "Sheep Types": ["Jordanian Sheep", "Romanian Sheep", "Australian Sheep", "Awassi Sheep", "Merino", "Suffolk", "Dorset", "Hampshire", "Other"],
  "Camel Types": ["Dromedary", "Bactrian", "Other"],
  "Goat Types": ["Alpine", "Jordanian Goat", "Nubian", "Boer", "Other"],
  "Fish Types": ["Goldfish", "Betta", "Guppy", "Angelfish", "Tetra", "Cichlid", "Koi", "Molly", "Platy", "Swordtail", "Nile Tilapia", "Jordanian Fish", "Other"],
  "Reptile Types": ["Turtle", "Jordanian Lizard", "Lizard", "Snake", "Tortoise", "Gecko", "Iguana", "Desert Tortoise", "Other"],
  "Poultry Types": ["Chicken", "Jordanian Chicken", "Duck", "Goose", "Turkey", "Quail", "Pigeon"],
  "Small Animal Types": ["Rabbit", "Jordanian Rabbit", "Hamster", "Guinea Pig", "Gerbil", "Chinchilla", "Ferret", "Hedgehog", "Other"],
};

const categories = ["Dog", "Cat", "Bird", "Horse", "Sheep", "Goat", "Camel", "Cow", "Fish", "Small Animal", "Reptile", "Poultry", "Other"];
const getTypes = (category) => {
  const typeKey = `${category} Types`;
  return animalTypes[typeKey] || [];
};

const Popup = ({
  name,
  closePopup,
  handleRating,
  itemId: propItemId,
  addToCart,
  removeFromCart,
  isInCart: initialIsInCart,
  itemType: propItemType,
  animal_pic: propAnimalPic,
  product_pic: propProductPic,
  animal_new_price: propAnimalNewPrice,
  product_new_price: propProductNewPrice,
  animal_old_price: propAnimalOldPrice,
  product_old_price: propProductOldPrice,
  animal_description: propAnimalDescription,
  product_description: propProductDescription,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedRating, setSelectedRating] = useState(null);
  const [currentItem, setCurrentItem] = useState(name);
  const [animalData, setAnimalData] = useState([]);
  const [productDataState, setProductDataState] = useState([]);
  const [userData, setUserData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [editedItem, setEditedItem] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const popupContentRef = useRef(null);
  const [currentItemDetails, setCurrentItemDetails] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [newReviewContent, setNewReviewContent] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewMessageType, setReviewMessageType] = useState('');
  const [showReviewConfirmation, setShowReviewConfirmation] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isCurrentFavorite, setIsCurrentFavorite] = useState(false);
  const [ageValue, setAgeValue] = useState('');
  const [ageUnit, setAgeUnit] = useState('Years');
  const [relatedAnimals, setRelatedAnimals] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isInCart, setIsInCart] = useState(initialIsInCart || false);


  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const userId = loggedInUser?.userId;
  const token = loggedInUser?.token;
  const urlParams = new URLSearchParams(window.location.search);
  const urlItemId = urlParams.get('itemId');
  const urlItemType = urlParams.get('itemType');

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Fetch animal and product data
  useEffect(() => {
    fetch('http://localhost:5024/api/Animals')
      .then(response => response.json())
      .then(data => {
        setAnimalData(data);
        const currentAnimal = data.find(animal => animal.animal_title === currentItem);
        if (currentAnimal) {
          fetch(`http://localhost:5024/api/User/${currentAnimal.userId}`)
            .then(response => response.json())
            .then(userData => setUserData(userData))
            .catch(error => console.error('Error fetching user data:', error));
        }
      })
      .catch(error => console.error('Error fetching animal data:', error));

    fetch('http://localhost:5024/api/Products')
      .then(response => response.json())
      .then(data => {
        setProductDataState(data);
        const currentProduct = data.find(product => product.product_title === currentItem);
        if (currentProduct) {
          fetch(`http://localhost:5024/api/User/${currentProduct.userId}`)
            .then(response => response.json())
            .then(userData => setUserData(userData))
            .catch(error => console.error('Error fetching user data:', error));
        }
      })
      .catch(error => console.error('Error fetching product data:', error));
  }, [currentItem]);

  const getItemData = (itemName) => {
    return animalData.find((item) => item.animal_title === itemName) || 
           productDataState.find((item) => item.product_title === itemName);
  };

  useEffect(() => {
    if (animalData.length > 0 || productDataState.length > 0) {
      const item = getItemData(currentItem);
      setCurrentItemDetails(item);
      console.log('Current Item Details:', item);
      if (isEditing && item) {
        const [value, unit] = (item.age || '').split(' ');
        setAgeValue(value || '');
        setAgeUnit(unit || 'Years');
      }
    }
  }, [animalData, productDataState, currentItem, isEditing]);

  // Initialize related items when currentItemDetails changes
  useEffect(() => {
    if (currentItemDetails) {
      setRelatedAnimals(getRandomRelatedItems(animalData, currentItemDetails, 2));
      setRelatedProducts(getRandomRelatedItems(productDataState, currentItemDetails, 2));
    }
  }, [currentItemDetails, animalData, productDataState]);

  useEffect(() => {
    if (isEditing && ageValue) {
      setEditedItem(prev => ({
        ...prev,
        age: `${ageValue} ${ageUnit}`,
      }));
    }
  }, [ageValue, ageUnit, isEditing]);

  const isAnimal = currentItemDetails ? !!currentItemDetails.animal_title : (propItemType === 'Animal');
  const itemId = propItemId || (isAnimal ? currentItemDetails?.animal_id : currentItemDetails?.product_id);
  const itemType = propItemType || (isAnimal ? 'Animal' : 'Product');



  // Use prop values if provided, else fallback to fetched data
  const animalPic = currentItemDetails?.animal_pic;
  const productPic = currentItemDetails?.product_pic;
  const animalNewPrice = currentItemDetails?.animal_new_price;
  const productNewPrice = currentItemDetails?.product_new_price;
  const animalOldPrice =  currentItemDetails?.animal_old_price;
  const productOldPrice =  currentItemDetails?.product_old_price;
  const animalDescription = currentItemDetails?.animal_description;
  const productDescription = currentItemDetails?.product_description;

  // Check favorite status
  useEffect(() => {
    if (itemId && itemType) {
      fetchItemStatus(itemId, itemType);
    }
  }, [itemId, itemType, userId, token]);
  
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!userId || !itemId || !itemType) return;

      try {
        const response = await axios.get(`http://localhost:5024/api/Favorite/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const favorites = response.data;
        const isFavorited = favorites.some(fav => 
          fav.itemId === itemId && 
          (itemType === 'Animal' ? !!fav.animalId : !!fav.productId)
        );
        setIsCurrentFavorite(isFavorited);
      } catch (error) {
        console.error('Error fetching favorite status:', error);
        setIsCurrentFavorite(false);
      }
    };

    fetchFavoriteStatus();
  }, [itemId, itemType, userId, token]);

  const fetchItemStatus = async (itemId, itemType) => {
    if (!userId || !itemId || !itemType) return;
  
    try {
      // Fetch favorite status
      const favoriteResponse = await axios.get(`http://localhost:5024/api/Favorite/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const favorites = favoriteResponse.data;
      const isFavorited = favorites.some(fav => 
        fav.itemId === itemId && 
        (itemType === 'Animal' ? !!fav.animalId : !!fav.productId)
      );
      setIsCurrentFavorite(isFavorited);
  
      // Fetch cart status
      const cartResponse = await axios.get(`http://localhost:5024/api/Carts/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const cartItems = cartResponse.data.cartItems || [];
      const isItemInCart = cartItems.some(item => 
        item.itemId === itemId && item.itemType === itemType
      );
      setIsInCart(isItemInCart);
    } catch (error) {
      console.error('Error fetching item status:', error);
      setIsCurrentFavorite(false);
      setIsInCart(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!userId) {
      setErrorMessage('Please log in to favorite items.');
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }
  
    if (!itemId || !itemType) {
      setErrorMessage('Invalid item ID or type.');
      console.error('Invalid itemId or itemType:', { itemId, itemType });
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:5024/api/Favorite/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const favorites = response.data;
      const existingFav = favorites.find(fav => 
        fav.itemId === itemId && 
        (itemType === 'Animal' ? !!fav.animalId : !!fav.productId)
      );
  
      if (isCurrentFavorite && existingFav) {
        await axios.delete(`http://localhost:5024/api/Favorite?userId=${userId}&itemId=${itemId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setIsCurrentFavorite(false);
        setErrorMessage('Removed from favorites!');
      } else if (!isCurrentFavorite && !existingFav) {
        const favoriteData = {
          userId: userId,
          itemId: itemId,
          ...(itemType === 'Animal' ? { animalId: itemId } : { productId: itemId }),
        };
        console.log('Adding favorite with payload:', favoriteData);
        await axios.post(
          'http://localhost:5024/api/Favorite',
          favoriteData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setIsCurrentFavorite(true);
        setSuccessMessage('Added to favorites!');
      } else {
        setErrorMessage(`Item is already ${isCurrentFavorite ? 'in' : 'not in'} your favorites.`);
      }
  
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 3500);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      console.log('Error Response:', error.response?.data);
      setErrorMessage(`Failed to update favorite: ${error.response?.data || error.message}`);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

  // Fetch reviews
  useEffect(() => {
    if (currentItemDetails) {
      const currentItemId = isAnimal ? currentItemDetails.animal_id : currentItemDetails.product_id;
      const endpoint = isAnimal
        ? `http://localhost:5024/api/AR_/animal/${currentItemId}`
        : `http://localhost:5024/api/PR_/product/${currentItemId}`;

      fetch(endpoint)
        .then(response => response.json())
        .then(reviewData => {
          const reviewsWithReviewer = reviewData.map(async (review) => {
            try {
              const userResponse = await fetch(`http://localhost:5024/api/User/${review.reviewerId}`);
              const userData = await userResponse.json();
              return {
                ...review,
                id: isAnimal ? review.animalReviewId : review.productReviewId,
                reviewerName: userData.name,
                profilePic: userData.profilePic,
                reviewDateFormatted: new Date(review.reviewDate).toLocaleDateString(),
              };
            } catch (error) {
              console.error('Error fetching reviewer details:', error);
              return {
                ...review,
                id: isAnimal ? review.animalReviewId : review.productReviewId,
                reviewerName: 'Unknown User',
                profilePic: null,
                reviewDateFormatted: new Date(review.reviewDate).toLocaleDateString(),
              };
            }
          });
          Promise.all(reviewsWithReviewer).then(updatedReviews => {
            setReviews(updatedReviews);
          });
        })
        .catch(error => console.error('Error fetching reviews:', error));
    }
  }, [currentItemDetails, isAnimal]);

  if (!currentItemDetails && !name) {
    return (
      <div className="popup-overlay">
        <div className="popup">
          <h2 className="popup-title">Loading...</h2>
          <button className="close-btn" onClick={closePopup}>
            <FontAwesomeIcon icon={faCircleXmark} size="xl" style={{ color: "#ffffff" }} />
          </button>
        </div>
      </div>
    );
  }

  const {
    animal_category,
    product_category,
    animal_type,
    product_type,
    gender,
    age,
    vaccineStatus,
    animal_weight,
    product_weight,
    health_status,
    animal_size,
    product_size,
    expiration,
    usage,
    designedFor,
  } = currentItemDetails || {};

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const totalPrice = quantity * (animalNewPrice || productNewPrice || 0);

  const handleStarClick = (star) => {
    setSelectedRating(star);
    handleRating(star);
  };

  const handleRelatedItemClick = async (relatedItemName) => {
    setCurrentItem(relatedItemName); // Update the current item name
    setQuantity(1);
    setSelectedRating(null);
  
    // Immediately fetch and set the new item details
    const newItem = getItemData(relatedItemName);
    if (newItem) {
      setCurrentItemDetails(newItem); // Set the new item details right away
      const isNewItemAnimal = !!newItem.animal_title;
      const newItemId = isNewItemAnimal ? newItem.animal_id : newItem.product_id;
      const newItemType = isNewItemAnimal ? 'Animal' : 'Product';
  
      // Reset editing state
      if (isEditing) {
        setIsEditing(false);
        setEditedItem({});
      }
  
      // Fetch favorite and cart status
      await fetchItemStatus(newItemId, newItemType);
  
      // Update related items
      setRelatedAnimals(getRandomRelatedItems(animalData, newItem, 2));
      setRelatedProducts(getRandomRelatedItems(productDataState, newItem, 2));
    }
  
    // Scroll to top
    if (popupContentRef.current) {
      popupContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const getRandomRelatedItems = (items, currentItem, count = 2) => {
    if (!items || items.length <= 1) return [];

    const filteredItems = items.filter(item =>
      (item.animal_title ? item.animal_title !== currentItem?.animal_title : item.product_title !== currentItem?.product_title)
    );

    if (filteredItems.length === 0) return [];

    const shuffled = [...filteredItems].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, filteredItems.length));
  };

  const formattedExpiration = expiration && expiration !== "9999-12-31T23:59:59.9999999"
    ? new Date(expiration).toLocaleDateString()
    : "No Expiration Date";

    const handleAddToCart = async () => {
      if (!loggedInUser) {
        setErrorMessage("Please log in to add items to your cart.");
        setTimeout(() => setErrorMessage(''), 3500);
        return;
      }
    
      if (!itemId || itemId === 0) {
        setErrorMessage("Invalid item ID. Cannot add to cart.");
        console.error('Invalid itemId:', itemId);
        setTimeout(() => setErrorMessage(''), 3500);
        return;
      }
    
      if (!quantity || quantity <= 0) {
        setErrorMessage("Quantity must be greater than 0.");
        setTimeout(() => setErrorMessage(''), 3500);
        return;
      }
    
      try {
        await addToCart(itemId, quantity, itemType);
        setIsInCart(true); // Add this line
        setSuccessMessage("Item added to cart successfully!");
        setErrorMessage("");
        setTimeout(() => setSuccessMessage(""), 3500);
      } catch (error) {
        console.error("Error adding to cart in Popup:", error);
        setErrorMessage(`Failed to add item to cart: ${error.message}`);
        setTimeout(() => setErrorMessage(""), 3500);
      }
    };

  const handleRemoveFromCart = async () => {
  if (!loggedInUser) {
    setErrorMessage("Please log in to remove items from your cart.");
    setTimeout(() => setErrorMessage(''), 3500);
    return;
  }

  if (!itemId || itemId === 0) {
    setErrorMessage("Invalid item ID. Cannot remove from cart.");
    console.error('Invalid itemId:', itemId);
    setTimeout(() => setErrorMessage(''), 3500);
    return;
  }

  try {
    await removeFromCart(itemId, itemType);
    setIsInCart(false);
    setSuccessMessage("Item removed from cart successfully!");
    setTimeout(() => setSuccessMessage(""), 3500);
  } catch (error) {
    console.error("Error removing from cart in Popup:", error);
    setErrorMessage(`Failed to remove item from cart: ${error.message}`);
    setTimeout(() => setErrorMessage(""), 3500);
  }
};

  

  const handleCartAction = () => {
    if (isInCart) {
      handleRemoveFromCart();
    } else {
      handleAddToCart();
    }
  };

  const handleDelete = () => setShowConfirmation(true);

  const confirmDelete = async () => {
    setShowConfirmation(false);
    try {
      const derivedItemType = isAnimal ? 'Animals' : 'Products';
      const currentItemId = itemId;
      const apiUrl = `http://localhost:5024/api/${derivedItemType}/${currentItemId}`;
      await axios.delete(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDeleteSuccess(true);
      setTimeout(() => closePopup(), 900);
    } catch (error) {
      console.error('Error deleting item:', error);
      setErrorMessage('Failed to delete item. Please try again.');
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

  const cancelDelete = () => setShowConfirmation(false);

  const handleEdit = () => {
    setIsEditing(true);
    const item = {
      ...currentItemDetails,
      animal_pic: isAnimal ? (animalPic ? [animalPic] : []) : null,
      product_pic: !isAnimal ? (productPic ? [productPic] : []) : null,
    };
    setEditedItem(item);
    if (isAnimal) {
      const [value, unit] = (item.age || '').split(' ');
      setAgeValue(value || '');
      setAgeUnit(unit || 'Years');
    }
  };

  const uploadImages = async (files) => {
    const cloudName = 'dhbhh9aln';
    const uploadPreset = 'Petflix_perset';
    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );
        uploadedUrls.push(response.data.secure_url);
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        setErrorMessage('Failed to upload image. Please try again.');
        return [];
      }
    }
    return uploadedUrls;
  };

  const handleSaveEdit = async () => {
    const requiredFields = isAnimal
      ? ['animal_title', 'animal_category', 'animal_type', 'gender', 'age', 'vaccineStatus', 'animal_weight', 'health_status', 'animal_new_price', 'animal_old_price', 'animal_description']
      : ['product_title', 'product_category', 'product_type', 'product_size', 'product_weight', 'usage', 'designedFor', 'product_new_price', 'product_old_price', 'product_description'];

    const missingFields = requiredFields.filter(field => !editedItem[field] && editedItem[field] !== 0);
    if (missingFields.length > 0 || (isAnimal && !ageValue)) {
      setErrorMessage(`Please fill in all required fields: ${missingFields.join(', ')}${isAnimal && !ageValue ? ', age' : ''}`);
      return;
    }

    try {
      const derivedItemType = isAnimal ? 'Animals' : 'Products';
      const currentItemId = itemId;
      const apiUrl = `http://localhost:5024/api/${derivedItemType}/${currentItemId}`;
      
      // Handle picture removal - if the pic array exists but is empty, it means user removed the picture
      const picField = isAnimal ? 'animal_pic' : 'product_pic';
      const shouldRemovePic = editedItem[picField] && editedItem[picField].length === 0;
      
      const dataToUpdate = {
        ...currentItemDetails,
        ...editedItem,
        [picField]: shouldRemovePic 
          ? null 
          : (editedItem[picField]?.[0] || currentItemDetails[picField]),
      };
      
      if (!dataToUpdate.expiration) dataToUpdate.expiration = null;

      const response = await axios.put(apiUrl, dataToUpdate, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200 || response.status === 204) {
        setSuccessMessage('Item updated successfully!');
        setErrorMessage('');
        if (isAnimal) {
          setAnimalData(prev => prev.map(item => item.animal_id === currentItemId ? { ...item, ...dataToUpdate } : item));
        } else {
          setProductDataState(prev => prev.map(item => item.product_id === currentItemId ? { ...item, ...dataToUpdate } : item));
        }
        setCurrentItemDetails(dataToUpdate);
        setEditedItem({});
        setIsEditing(false);
      } else {
        setErrorMessage('Failed to update item. Please try again.');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setErrorMessage('Failed to update item. Please try again.');
      setSuccessMessage('');
    }
  };

  const handleInputChange = async (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files && files.length > 0) {
      const uploadedUrls = await uploadImages(files);
      if (uploadedUrls.length > 0) {
        setEditedItem(prev => ({
          ...prev,
          [isAnimal ? 'animal_pic' : 'product_pic']: uploadedUrls,
        }));
      }
      return;
    }

    let parsedValue = value;
    if (type === 'number') {
      parsedValue = parseFloat(value) || '';
    } else if (name === 'gender') {
      parsedValue = parseInt(value, 10);
    } else if (name === 'ageValue') {
      const cleanedValue = value.replace(/[^0-9.]/g, '');
      setAgeValue(cleanedValue);
      setEditedItem(prev => ({
        ...prev,
        age: `${cleanedValue} ${ageUnit}`,
      }));
      return;
    } else if (name === 'ageUnit') {
      setAgeUnit(value);
      setEditedItem(prev => ({
        ...prev,
        age: `${ageValue} ${value}`,
      }));
      return;
    }

    if (name === 'animal_category' || name === 'animal_type') {
      setEditedItem(prev => ({
        animal_id: prev.animal_id,
        userId: prev.userId,
        animal_category: name === 'animal_category' ? parsedValue : prev.animal_category || '',
        animal_type: name === 'animal_type' ? parsedValue : (name === 'animal_category' ? '' : prev.animal_type || ''),
        animal_title: '',
        animal_description: '',
        gender: '',
        age: '',
        vaccineStatus: '',
        animal_weight: '',
        health_status: '',
        animal_new_price: '',
        animal_old_price: '',
        animal_pic: prev.animal_pic || [],
      }));
      setAgeValue('');
      setAgeUnit('Years');
    } else if (name === 'product_category' || name === 'product_type') {
      setEditedItem(prev => ({
        product_id: prev.product_id,
        userId: prev.userId,
        product_category: name === 'product_category' ? parsedValue : prev.product_category || '',
        product_type: name === 'product_type' ? parsedValue : (name === 'product_category' ? '' : prev.product_type || ''),
        product_title: '',
        product_description: '',
        product_size: '',
        product_weight: '',
        usage: '',
        designedFor: '',
        product_new_price: '',
        product_old_price: '',
        expiration: '',
        product_pic: prev.product_pic || [],
      }));
    } else {
      setEditedItem(prev => ({
        ...prev,
        [name]: parsedValue,
      }));
    }
  };

  const removeImage = (index) => {
    setEditedItem(prev => {
      const updatedPics = isAnimal ? [...(prev.animal_pic || [])] : [...(prev.product_pic || [])];
      updatedPics.splice(index, 1);
      return {
        ...prev,
        [isAnimal ? 'animal_pic' : 'product_pic']: updatedPics.length > 0 ? updatedPics : [],
      };
    });
  };

  const handleEditClick = (reviewId, content) => {
    setEditingReviewId(reviewId);
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedItem({});
    setAgeValue('');
    setAgeUnit('Years');
  };

  const handleSaveClick = async (reviewId) => {
    try {
      if (!loggedInUser) {
        setReviewMessage('Please log in to edit reviews.');
        setReviewMessageType('error');
        return;
      }

      const endpoint = isAnimal ? 'AR_' : 'PR_';
      const reviewIdField = isAnimal ? 'animalReviewId' : 'productReviewId';
      const itemIdField = isAnimal ? 'animalId' : 'productId';
      const itemIdValue = itemId;

      const updatedReview = {
        [reviewIdField]: reviewId,
        content: editedContent,
        [itemIdField]: itemIdValue,
        reviewerId: loggedInUser.userId,
        reviewDate: new Date().toISOString(),
      };

      const response = await fetch(`http://localhost:5024/api/${endpoint}/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedReview),
      });

      if (response.ok) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? { ...review, content: editedContent, reviewDateFormatted: new Date().toLocaleDateString() }
              : review
          )
        );
        setEditingReviewId(null);
        setEditedContent('');
        setReviewMessage('Review updated successfully!');
        setReviewMessageType('success');
      } else {
        const errorText = await response.text();
        setReviewMessage(`Error updating review: ${errorText}`);
        setReviewMessageType('error');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setReviewMessage(`Error updating review: ${error.message}`);
      setReviewMessageType('error');
    } finally {
      setTimeout(() => {
        setReviewMessage('');
        setReviewMessageType('');
      }, 5000);
    }
  };

  const handleDeleteClick = (reviewId) => {
    setShowReviewConfirmation(true);
    setReviewToDelete(reviewId);
  };

  const confirmDeleteReview = async () => {
    setShowReviewConfirmation(false);
    try {
      const endpoint = isAnimal ? 'AR_' : 'PR_';
      const response = await fetch(`http://localhost:5024/api/${endpoint}/${reviewToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewToDelete));
        setReviewMessage('Review deleted successfully!');
        setReviewMessageType('error');
      } else {
        const errorText = await response.text();
        setReviewMessage(`Error deleting review: ${errorText}`);
        setReviewMessageType('error');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      setReviewMessage(`Error deleting review: ${error.message}`);
      setReviewMessageType('error');
    } finally {
      setReviewToDelete(null);
      setTimeout(() => {
        setReviewMessage('');
        setReviewMessageType('');
      }, 5000);
    }
  };

  const cancelDeleteReview = () => {
    setShowReviewConfirmation(false);
    setReviewToDelete(null);
  };

  const handleAddReview = async () => {
    if (!newReviewContent.trim()) {
      setReviewMessage('Review cannot be empty.');
      setReviewMessageType('error');
      setTimeout(() => {
        setReviewMessage('');
        setReviewMessageType('');
      }, 5000);
      return;
    }

    try {
      if (!loggedInUser || !currentItemDetails) {
        setReviewMessage('User or item details are missing. Please try again.');
        setReviewMessageType('error');
        return;
      }

      const endpoint = isAnimal ? 'AR_' : 'PR_';
      const itemIdField = isAnimal ? 'animalId' : 'productId';
      const itemIdValue = itemId;

      const reviewData = {
        content: newReviewContent.trim(),
        reviewDate: new Date().toISOString(),
        reviewerId: loggedInUser.userId,
        [itemIdField]: itemIdValue,
      };

      const response = await fetch(`http://localhost:5024/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews((prevReviews) => [
          ...prevReviews,
          {
            ...newReview,
            id: isAnimal ? newReview.animalReviewId : newReview.productReviewId,
            reviewerName: loggedInUser.name,
            profilePic: loggedInUser.profilePic,
            reviewDateFormatted: new Date(newReview.reviewDate).toLocaleDateString(),
          },
        ]);
        setNewReviewContent('');
        setReviewMessage('Review added successfully!');
        setReviewMessageType('success');
      } else {
        const errorText = await response.text();
        setReviewMessage(`Error adding review: ${errorText}`);
        setReviewMessageType('error');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      setReviewMessage(`Error adding review: ${error.message}`);
      setReviewMessageType('error');
    } finally {
      setTimeout(() => {
        setReviewMessage('');
        setReviewMessageType('');
      }, 5000);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup" ref={popupContentRef}>
        {errorMessage && <div className="error-message3">{errorMessage}</div>}
        {deleteSuccess && <div className="success2-message">Item deleted successfully!</div>}
        {successMessage && <div className="success2-message">{successMessage}</div>}
        {showConfirmation && (
          <div className="confirmation-popup">
            <p>Are you sure you want to delete this item?</p>
            <button onClick={confirmDelete} className="delete-btn">Yes, Delete</button>
            <button onClick={cancelDelete} className="cancel-btn">Cancel</button>
          </div>
        )}
        <div className="popup-top">
          {isEditing ? (
            <input
              type="text"
              name={isAnimal ? "animal_title" : "product_title"}
              className="input7"
              value={editedItem.animal_title || editedItem.product_title || ''}
              onChange={handleInputChange}
              placeholder="Title"
              required
            />
          ) : (
            <h2 className="popup-title">{currentItemDetails?.animal_title || currentItemDetails?.product_title || name}</h2>
          )}
          <div className="popup-actions">
            {(currentItemDetails?.userId === userId) && (
              <>
                <button className="favorite-btn-popup" style={{ minWidth: '8rem', marginLeft: "1rem" }} onClick={handleDelete}>
                  Delete Item
                </button>
                <button style={{ minWidth: "9rem" }} className="favorite-btn-popup" onClick={isEditing ? handleSaveEdit : handleEdit}>
                  {isEditing ? 'Save Changes' : 'Edit'}
                </button>
                {isEditing && (
                  <button className="favorite-btn-popup" style={{ color: '#003b6b9e', backgroundColor: 'white' }} onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </>
            )}

            {!isAnimal && (
            <div className="popup-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= selectedRating ? "filled" : ""}`}
                  onClick={() => handleStarClick(star)}
                >
                  ★
                </span>
              ))}
            </div>
            )}

            {currentItemDetails?.userId !== userId && (
            <button className={`favorite-btn-popup`}>
              <FontAwesomeIcon icon={faFlag} style={{ color: "#ffffff", marginRight:'.1rem' }} /> Report
            </button>
            )}

            <button
            className={`favorite-btn-popup`}
            style={{ minWidth: "6.2rem" }}
            onClick={() => {
              // Construct the shareable URL
              const itemUrl = `${window.location.origin}${window.location.pathname}?itemId=${itemId}&itemType=${itemType.toLowerCase()}`;

              // Copy to clipboard
              navigator.clipboard
                .writeText(itemUrl)
                .then(() => {
                  setSuccessMessage('Item link copied to clipboard!');
                  setTimeout(() => setSuccessMessage(''), 3500);
                })
                .catch((err) => {
                  console.error('Failed to copy link: ', err);
                  setErrorMessage('Failed to copy item link. Please copy manually.');
                  setTimeout(() => setErrorMessage(''), 3500);
                });
            }}
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ color: '#ffffff' , marginRight:'0.4rem' }} />
            Share
          </button>

            <button
              className={`favorite-btn-popup${isCurrentFavorite ? " active" : ""}`}
              onClick={toggleFavorite}
              style={{ minWidth: "10.8rem" }}
            >
              <FontAwesomeIcon icon={faHeart} size="lg" style={{ color: "white" , marginRight:'0.1rem' }} />
              {isCurrentFavorite ? " Remove Favorite" : " Add to Favorite"}
            </button>

            <button className="close-btn" onClick={closePopup}>
              <FontAwesomeIcon icon={faCircleXmark} size="xl" style={{ color: "#ffffff" }} />
            </button>

          </div>
        </div>
        <div className="popup-main-content">
          <div className="popup-left">
            {isEditing ? (
              <div>
                <input
                  type="file"
                  onChange={handleInputChange}
                  className="favorite-btn-popup"
                  style={{ color: 'white', fontSize: '1rem', width: 'auto' }}
                  name={isAnimal ? "animal_pic" : "product_pic"}
                  accept="image/*"
                  multiple
                />
                <div style={{ marginTop: '10px' }}>
                  {(isAnimal ? editedItem.animal_pic : editedItem.product_pic)?.map((pic, index) => (
                    <div key={index}>
                      <img src={pic} alt={`Preview ${index}`} className="popup-image" style={{ marginBottom: '.7rem' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="favorite-btn-popup"
                        style={{ backgroundColor: 'darkred', color: 'white', fontSize: '1rem' }}
                      >
                        Remove Image
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <img
                src={animalPic || productPic || fallbackImage}
                alt={currentItemDetails?.animal_title || currentItemDetails?.product_title || name}
                className="popup-image"
                onError={(e) => {
                  e.target.onerror = null; // prevents infinite loop if fallback also fails
                  e.target.src = fallbackImage;
                }}
              />
            )}
            <div className="popup-description">
              {isEditing ? (
                <textarea
                  name={isAnimal ? "animal_description" : "product_description"}
                  className="input6"
                  value={editedItem.animal_description || editedItem.product_description || ''}
                  onChange={handleInputChange}
                  placeholder="Description"
                  required
                />
              ) : (
                <p><span style={{ fontWeight: "bolder", fontSize: "1.3rem" }}>Description : </span> {animalDescription || productDescription}</p>
              )}
            </div>
          </div>
          <div className="popup-right">
            <div className="popup-details-container">
            <div className="popup-animal">
  <h4>Details :</h4>
  {isEditing ? (
    <>
      {isAnimal ? (
        // Animal editing fields
        <>
          <select
            name="animal_category"
            style={{ padding: '19.5px' }}
            className="input4"
            value={editedItem.animal_category || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            name="animal_type"
            className="input4"
            value={editedItem.animal_type || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Type</option>
            {getTypes(editedItem.animal_category || animal_category).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            name="gender"
            className="input4"
            value={editedItem.gender !== undefined ? editedItem.gender : ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Gender</option>
            <option value={0}>Male</option>
            <option value={1}>Female</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"  
              name="ageValue"
              className="input4"
              value={ageValue}
              onChange={handleInputChange}  
              placeholder="Age (e.g., 4.5)"
              required
              style={{ width: '100px' }}
            />
            <select
              name="ageUnit"
              className="input4"
              style={{ width: '10.95rem' }}
              value={ageUnit}
              onChange={handleInputChange} 
              required
            >
              <option value="Years">Years</option>
              <option value="Months">Months</option>
            </select>
          </div>
          
          <select
            name="vaccineStatus"
            className="input4"
            value={editedItem.vaccineStatus || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Vaccine Status</option>
            <option value="Fully Vaccinated">Fully Vaccinated</option>
            <option value="Partly Vaccinated">Partly Vaccinated</option>
            <option value="Not Vaccinated">Not Vaccinated</option>
          </select>
          <input
            type="number"
            name="animal_weight"
            className="input4"
            value={editedItem.animal_weight || ''}
            onChange={handleInputChange}
            placeholder="Weight (kg)"
            required
          />
          <select
            name="health_status"
            className="input4"
            value={editedItem.health_status || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Health Status</option>
            {Object.entries(healthStatuses).map(([group, statuses]) => (
              <optgroup key={group} label={group}>
                {statuses.map(status => <option key={status} value={status}>{status}</option>)}
              </optgroup>
            ))}
          </select>
        </>
      ) : (
        // Product editing fields
        <>
          <select
            name="product_category"
            className="input4"
            value={editedItem.product_category || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            {productData.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            name="product_type"
            className="input4"
            value={editedItem.product_type || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Type</option>
            {productData.productTypes[editedItem.product_category || product_category]?.map(type => (
              <option key={type} value={type}>{type}</option>
            )) || <option>No types available</option>}
          </select>
          <select
            name="product_size"
            className="input4"
            value={editedItem.product_size || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Size</option>
            {productData.productSizes.map(size => <option key={size} value={size}>{size}</option>)}
          </select>
          <input
            type="number"
            name="product_weight"
            className="input4"
            value={editedItem.product_weight || ''}
            onChange={handleInputChange}
            placeholder="Weight (kg)"
            required
          />
          <input
            type="date"
            name="expiration"
            className="input4"
            value={editedItem.expiration ? editedItem.expiration.slice(0, 10) : ''}
            onChange={handleInputChange}
          />
          <select
            name="usage"
            className="input4"
            value={editedItem.usage || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Usage</option>
            {Object.entries(usages).map(([group, usageItems]) => (
              <optgroup key={group} label={group}>
                {usageItems.map(usage => <option key={usage} value={usage}>{usage}</option>)}
              </optgroup>
            ))}
          </select>
          <select
            name="designedFor"
            className="input4"
            value={editedItem.designedFor || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Designed For</option>
            {productData.designedFor.map(target => <option key={target} value={target}>{target}</option>)}
          </select>
        </>
      )}
    </>
  ) : (
    // Non-editing view
    <>
      <p style={{ padding: '19.5px' }}>Category : {animal_category || product_category}</p>
      <p>Type : {animal_type || product_type}</p>
      {isAnimal ? (
        // Animal display fields
        <>
          <p>Gender : {gender === 0 ? "Male" : "Female"}</p>
          <p>Age : {age}</p>
          <p>Vaccine Status : {vaccineStatus === "Fully Vaccinated" ? "Fully Vaccinated" : vaccineStatus === "Partly Vaccinated" ? "Partly Vaccinated" : "Not Vaccinated"}</p>
          <p>Weight : {animal_weight} kg</p>
          <p>Health : {health_status}</p>
        </>
      ) : (
        // Product display fields
        <>
          <p>Size : {product_size || "N/A"}</p>
          <p>Weight : {product_weight || "N/A"} kg</p>
          <p>Expiration : {formattedExpiration}</p>
          <p>Usage : {usage}</p>
          <p>Designed For : {designedFor}</p>
        </>
      )}
    </>
  )}
</div>
              <div className="popup-owner">
                <h4>Owner's Details :</h4>
                {userData ? (
                  <>
                    <p>
                      <img
                        className="reviewer-pic"
                        style={{ verticalAlign: 'middle', width: '40px', height: '40px' }}
                        src={userData.profilePic}
                        alt="Profile Pic"
                      />
                      <span
                        style={{ cursor: "pointer" }}
                        className='phone-link'
                        onClick={() => {
                          closePopup();
                          navigate(`/myprofile`, { state: { ownerId: userData.userId } });
                        }}
                      >
                        {userData.name}
                      </span>
                    </p>
                    
                    <p>Email : <a href={`mailto:${userData.email}`} className='phone-link' style={{ color: "#dedede", textDecoration: 'none' }}>{userData.email}</a></p>
                    <p>Phone : <a href={`tel:${userData.phone}`} className='phone-link' style={{ color: "#dedede", textDecoration: 'none' }}> +{userData.phone.replace(/\D/g, '').replace(/(\d{3})(?=\d)/g, '$1 ')} </a></p> 
                    <p>Delivery : {userData.delivery_method}</p>
                    <p>Location : {userData.location}</p>
                    <p>Available Days : {userData.availableDays}</p>
                    <p>Available Time : {userData.availableHours}</p>
                  </>
                ) : (
                  <p>Loading owner details...</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="popup-prices">
          <div className="price-section">
            <div className="price-info">
              {isEditing ? (
                <>
                  <input
                    type="number"
                    name={isAnimal ? "animal_new_price" : "product_new_price"}
                    className="input5"
                    value={editedItem.animal_new_price || editedItem.product_new_price || ''}
                    onChange={handleInputChange}
                    placeholder="New Price"
                    required
                  />
                  <input
                    type="number"
                    name={isAnimal ? "animal_old_price" : "product_old_price"}
                    className="input5"
                    value={editedItem.animal_old_price || editedItem.product_old_price || ''}
                    onChange={handleInputChange}
                    placeholder="Old Price"
                    required
                  />
                </>
              ) : (
                <>
                  <p>New Price :</p>
                  <span className="popup-price-new">{animalNewPrice || productNewPrice} JD</span>
                  <p>Old Price :</p>
                  <span className="popup-price-old">{animalOldPrice || productOldPrice} JD</span>
                </>
              )}
            </div>
            {!isAnimal && currentItemDetails?.userId !== userId && (
              <div className="counter">
                <button className="counter-btn decrement" onClick={decrement}>
                  <FontAwesomeIcon icon={faCircleMinus} size="sm" style={{ color: "#ffffff" }} />
                </button>
                <span className="counter-value">{quantity}</span>
                <button className="counter-btn increment" onClick={increment}>
                  <FontAwesomeIcon icon={faCirclePlus} size="sm" style={{ color: "#ffffff" }} />
                </button>
              </div>
            )}
            {currentItemDetails?.userId !== userId && (
              <button
              className={`add-to-cart-btn ${isInCart ? 'remove-from-cart-btn' : ''}`}
              onClick={handleCartAction}
            >
              {isInCart ? "Remove from Cart" : "Add to Cart"}
            </button>
            )}
            <div>
              {!isEditing && <p className="total-price">Total Price : {totalPrice.toFixed(2)} JD</p>}
            </div>
          </div>
        </div>
        <div className="popup-reviews">
          <h4>Reviews :</h4>
          {reviewMessage && (
            <div className={`message ${reviewMessageType === 'success' ? 'success2-message' : 'error-message3'}`}>
              {reviewMessage}
            </div>
          )}
          {showReviewConfirmation && (
            <div className="confirmation-popup">
              <p>Are you sure you want to delete this review?</p>
              <button onClick={confirmDeleteReview} className="delete-btn">Yes, Delete</button>
              <button onClick={cancelDeleteReview} className="cancel-btn">Cancel</button>
            </div>
          )}
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review">
                <img className="reviewer-pic" src={review.profilePic} alt="Profile Pic" />
                <p
                  className="review-author"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    closePopup();
                    navigate(`/myprofile`, { state: { ownerId: review.reviewerId } });
                  }}
                >
                  {review.reviewerName}
                </p>
                <div>
                  {editingReviewId === review.id ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="input8"
                    />
                  ) : (
                    <p className="review-text">" {review.content} "</p>
                  )}
                </div>
                <div className="review-actions">
                  <p className="review-date">{review.reviewDateFormatted}</p>
                  {userId === review.reviewerId && (
                    <>
                      {editingReviewId === review.id ? (
                        <>
                          <button onClick={() => handleSaveClick(review.id)}>Save</button>
                          <button onClick={() => setEditingReviewId(null)}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => handleEditClick(review.id, review.content)}>Edit</button>
                      )}
                      <button onClick={() => handleDeleteClick(review.id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No Reviews Yet.</p>
          )}
          {userId && (
            <div className="add-review">
              <h4>Add a Review:</h4>
              <textarea
                value={newReviewContent}
                onChange={(e) => setNewReviewContent(e.target.value)}
                placeholder="Write your review here..."
              />
              <button onClick={handleAddReview}>Add Review</button>
            </div>
          )}
        </div>
        <div className="popup-reviews">
          <h1>You Also May Like :</h1>
          <div className="related-products">
            <div className="related-section">
              <h2>Related Animals :</h2>
              {relatedAnimals.length > 0 ? (
                relatedAnimals.map(animal => (
                  <div key={animal.animal_id} className="related-product-item">
                    <img
                      src={animal.animal_pic || fallbackImage}
                      alt={animal.animal_title}
                      className="related-product-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                      }}
                    />
                    <div className="related-product-info">
                      <h6>{animal.animal_title}</h6>
                      <p>{animal.animal_new_price} JD</p>
                      <button className="view-related-btn" onClick={() => handleRelatedItemClick(animal.animal_title)}>
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No related animals available.</p>
              )}
            </div>
            <div className="related-section">
              <h2>Related Products :</h2>
              {relatedProducts.length > 0 ? (
                relatedProducts.map(product => (
                  <div key={product.product_id} className="related-product-item">
                    <img
                      src={product.product_pic || fallbackImage}
                      alt={product.product_title}
                      className="related-product-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                      }}
                    />
                    <div className="related-product-info">
                      <h6>{product.product_title}</h6>
                      <p>{product.product_new_price} JD</p>
                      <button className="view-related-btn" onClick={() => handleRelatedItemClick(product.product_title)}>
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No related products available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;