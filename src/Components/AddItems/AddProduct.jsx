import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddItems.css';

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

const AddProduct = () => {
  const [formData, setFormData] = useState({
    product_title: '',
    product_new_price: '',
    product_old_price: '',
    product_description: '',
    product_category: '',
    product_type: '',
    product_size: '',
    product_weight: '',
    expiration: '',
    usage: '',
    designedFor: '',
    product_pic: '',
    userId: '',
  });

  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user?.userId) {
      setFormData(prev => ({ ...prev, userId: user.userId }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files[0]) {
      uploadImage(files[0]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const uploadImage = async (file) => {
    const cloudName = 'dhbhh9aln';
    const uploadPreset = 'Petflix_perset';
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      
      setFormData(prev => ({ ...prev, product_pic: response.data.secure_url }));
      setMessage('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate required fields
    const requiredFields = ['product_title', 'product_description', 'product_category', 'product_type', 'designedFor'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setMessage('Please fill all required fields');
      return;
    }
  
    const submissionData = {
      ...formData,
      product_weight: formData.product_weight ? parseFloat(formData.product_weight) : null,
      product_new_price: formData.product_new_price ? parseFloat(formData.product_new_price) : null,
      product_old_price: formData.product_old_price ? parseFloat(formData.product_old_price) : null,
      expiration: formData.expiration || null, // Send null instead of string when empty
      userId: parseInt(formData.userId, 10),
      ItemType: "Product"
    };
  
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      
      const response = await axios.post('http://localhost:5024/api/Products', submissionData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });
  
      setMessage('Product added successfully!');
      // Reset form
      setFormData({
        product_title: '',
        product_description: '',
        product_category: '',
        product_type: '',
        product_size: '',
        product_weight: '',
        expiration: '',
        usage: '',
        designedFor: '',
        product_pic: '',
        product_new_price: '',
        product_old_price: '',
        userId: user.userId
      });
      
    } catch (error) {
      console.error('Full error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        // Show more detailed error message from server if available
        setMessage(`Error: ${error.response.data.message || error.response.data.title || 'Failed to add product'}`);
      } else {
        setMessage('Network error - please check your connection');
      }
    }
  };
    
  const clearForm = () => {
    setFormData(prev => ({
      ...prev,
      product_title: '',
      product_description: '',
      product_category: '',
      product_type: '',
      product_size: '',
      product_weight: '',
      expiration: '',
      usage: '',
      product_new_price: '',
      product_old_price: '',
      product_pic: ''
    }));
    setMessage('');
    setErrors({});
  };

  return (
    <div className="add-product-container">
      <h2>Add a New Product</h2>
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="product_title"
            placeholder="Product Title"
            value={formData.product_title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <select
              name="product_category"
              value={formData.product_category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {productData.categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <select
              name="product_type"
              value={formData.product_type}
              onChange={handleChange}
              required
              disabled={!formData.product_category}
            >
              <option value="">Select Type</option>
              {formData.product_category && 
                productData.productTypes[formData.product_category]?.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))
              }
            </select>
          </div>

          <div className="form-group">
            <select
              name="designedFor"
              value={formData.designedFor}
              onChange={handleChange}
              required
            >
              <option value="">Designed For</option>
              {productData.designedFor.map(animal => (
                <option key={animal} value={animal}>{animal}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <select
              name="product_size"
              value={formData.product_size}
              onChange={handleChange}
            >
              <option value="">Select Size</option>
              {productData.productSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <input
              type="number"
              name="product_new_price"
              placeholder="New Price"
              value={formData.product_new_price}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              name="product_old_price"
              placeholder="Old Price"
              value={formData.product_old_price}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
        </div>

         <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              name="product_weight"
              placeholder="Weight (kg)"
              value={formData.product_weight}
              onChange={handleChange}
              min="0"
              step="0.1"
            />
         </div>

         <div className="form-group">
          <select
            name="usage"
            value={formData.usage}
            onChange={handleChange}
          >
            <option value="">Select Usage</option>
            {Object.entries(usages).map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </optgroup>
            ))}
          </select>
         </div>

        <div className="form-group">
          <input
            type="date"
            name="expiration"
            value={formData.expiration}
            onChange={handleChange}
          />
        </div>
        </div>

        <div className="form-group">
          <textarea
            name="product_description"
            placeholder="Product Description"
            value={formData.product_description}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>

        <div className="form-group">
        <div className="form-group image-upload-container">
          <label className="file-upload-label">
            Choose Product Image
            <input
              type="file"
              name="product_pic"
              accept="image/*"
              onChange={handleChange}
              className="file-input"
            />
          </label>
          
          {isUploading && (
            <div className="upload-progress">
              <div 
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
          
          {formData.product_pic && (
            <div className="image-preview">
              <img src={formData.product_pic} alt="Product preview" />
              {!isUploading && (
                <div className="upload-success">
                  <span className="success-icon">✓</span>
                  Ready
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        

        <div className="form-actions">
          <button type="button" className="clear-btn" onClick={clearForm}>
            Clear All
          </button>
          <button type="submit" className="submit-btn">
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;