import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../AddItems/AddItems.css';

const animalTypes = {
  "Dog Types": ["Golden Retriever", "Labrador", "Poodle", "Beagle", "Bulldog", "Chihuahua", "Dalmatian", "Shih Tzu", "German Shepherd", "Boxer", "Dachshund", "Yorkshire Terrier", "Australian Shepherd", "French Bulldog", "Saluki", "Canaan Dog", "Jordanian Dog", "Other"],
  "Cat Types": ["Persian", "Siamese", "Sphynx", "Ragdoll", "Arabian Mau", "Jordanian Cat", "Maine Coon", "Bengal", "Russian Blue", "Abyssinian", "British Shorthair", "Scottish Fold", "Devon Rex", "Burmese", "Other"],
  "Bird Types": ["Jordanian Pigeon", "Parrot", "Canary", "Cockatiel", "Macaw", "Finch", "Lovebird", "Budgie", "Conure", "Dove", "Pigeon", "Falcon", "Other"],
  "Horse Types": ["Arabian Horse", "Thoroughbred", "Quarter Horse", "Appaloosa", "Draft Horse", "Pony", "Other"],
  "Cow Types": ["Jordanian Cow", "Holstein", "Jersey", "Angus", "Hereford", "Brahman", "Other"],
  "Sheep Types": ["Jordanian Sheep", "Romanian Sheep", "Australian Sheep", "Awassi Sheep", "Merino", "Suffolk", "Dorset", "Hampshire", "Other"],
  "Camel Types": ["Dromedary", "Bactrian", "Other"],
  "Goats Types": ["Alpine", "Jordanian Goats", "Nubian", "Boer", "Other"],
  "Fish Types": ["Goldfish", "Betta", "Guppy", "Angelfish", "Tetra", "Cichlid", "Koi", "Molly", "Platy", "Swordtail", "Nile Tilapia", "Jordanian Fish", "Other"],
  "Reptile Types": ["Turtle", "Jordanian Lizard", "Lizard", "Snake", "Tortoise", "Gecko", "Iguana", "Desert Tortoise", "Other"],
  "Poultry Types": ["Chicken", "Jordanian Chicken", "Duck", "Goose", "Turkey", "Quail", "Pigeon"],
  "Small Animal Types": ["Rabbit", "Jordanian Rabbit", "Hamster", "Guinea Pig", "Gerbil", "Chinchilla", "Ferret", "Hedgehog", "Other"],
};

const categories = ["Dog", "Cat", "Bird", "Fish", "Horse", "Sheep", "Goats", "Camel", "Cow", "Small Animal", "Reptile", "Poultry", "Other"];

const healthStatuses = {
  "Excellent Health": ["Vibrant", "Energetic", "Alert", "Optimal Weight", "Healthy Coat"],
  "Good Health": ["Active", "Normal Appetite", "Regular Bowel Movements", "Clear Eyes", "Good Mobility"],
  "Fair Health": ["Slightly Lethargic", "Reduced Appetite", "Occasional Coughing", "Mild Skin Irritation", "Minor Mobility Issues"],
  "Poor Health": ["Lethargic", "Loss of Appetite", "Persistent Coughing", "Severe Skin Irritation", "Significant Mobility Issues"],
  "Critical Health": ["Unresponsive", "Labored Breathing", "Severe Bleeding", "Seizures", "Paralysis"],
  "Recovering": ["Post-Surgery", "Convalescing", "Gradual Improvement", "Needs Special Care"],
  "Special Needs": ["Chronic Illness", "Disability", "Requires Specialized Care", "Senior Animal"],
};

const AddAnimal = () => {
  const [formData, setFormData] = useState({
    ItemType: 'Animal',
    animal_title: '',
    animal_new_price: '',
    animal_old_price: '',
    animal_description: '',
    animal_category: '',
    animal_type: '',
    gender: null,
    age: '',
    vaccineStatus: '',
    animal_weight: '',
    health_status: '',
    animal_pic: '',
    userId: '',
  });

  const [ageValue, setAgeValue] = useState('');
  const [ageUnit, setAgeUnit] = useState('Years');
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

  useEffect(() => {
    if (ageValue) {
      setFormData(prev => ({ ...prev, age: `${ageValue} ${ageUnit}` }));
    }
  }, [ageValue, ageUnit]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files[0]) {
      uploadImage(files[0]);
    } else if (name === 'ageValue') {
      setAgeValue(value);
    } else if (name === 'ageUnit') {
      setAgeUnit(value);
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'gender' ? (value === '' ? null : parseInt(value)) : value 
      }));
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
      
      setFormData(prev => ({ ...prev, animal_pic: response.data.secure_url }));
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
  
    // Validate required fields (removed animal_pic from required fields)
    const requiredFields = [
      'animal_title', 
      'animal_description', 
      'animal_category', 
      'animal_type', 
      'gender', 
      'health_status', 
      'vaccineStatus', 
      'animal_weight', 
      'animal_new_price'
    ];
    
    const missingFields = requiredFields.filter(field => {
      if (field === 'gender') return formData[field] === null;
      return !formData[field];
    });
    
    if (!ageValue) {
      missingFields.push('age');
    }
    
    if (missingFields.length > 0) {
      setMessage('Please fill all required fields');
      return;
    }
  
    const submissionData = {
      ...formData,
      animal_weight: formData.animal_weight ? parseFloat(formData.animal_weight) : null,
      animal_new_price: formData.animal_new_price ? parseFloat(formData.animal_new_price) : null,
      animal_old_price: formData.animal_old_price ? parseFloat(formData.animal_old_price) : null,
      age: `${ageValue} ${ageUnit}`,
      userId: parseInt(formData.userId, 10),
      ItemType: "Animal",
      animal_pic: formData.animal_pic || null // Send null if no image is provided
    };
  
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      
      const response = await axios.post('http://localhost:5024/api/Animals', submissionData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });
  
      setMessage('Animal added successfully!');
      // Reset form
      setFormData({
        ItemType: 'Animal',
        animal_title: '',
        animal_description: '',
        animal_category: '',
        animal_type: '',
        gender: null,
        vaccineStatus: '',
        animal_weight: '',
        health_status: '',
        animal_new_price: '',
        animal_old_price: '',
        animal_pic: '',
        userId: user.userId
      });
      setAgeValue('');
      setAgeUnit('Years');
      
    } catch (error) {
      console.error('Full error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        setMessage(`Error: ${error.response.data.message || error.response.data.title || 'Failed to add animal'}`);
      } else {
        setMessage('Network error - please check your connection');
      }
    }
  };
    
  const clearForm = () => {
    setFormData(prev => ({
      ...prev,
      animal_title: '',
      animal_description: '',
      animal_category: '',
      animal_type: '',
      gender: null,
      vaccineStatus: '',
      animal_weight: '',
      health_status: '',
      animal_new_price: '',
      animal_old_price: '',
      animal_pic: ''
    }));
    setAgeValue('');
    setAgeUnit('Years');
    setMessage('');
    setErrors({});
  };

  return (
    <div className="add-product-container">
      <h2>Add a New Animal</h2>
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="animal_title"
            placeholder="Animal Title"
            value={formData.animal_title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <select
              name="animal_category"
              value={formData.animal_category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <select
              name="animal_type"
              value={formData.animal_type}
              onChange={handleChange}
              required
              disabled={!formData.animal_category}
            >
              <option value="">Select Type</option>
              {formData.animal_category && 
                animalTypes[`${formData.animal_category} Types`]?.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))
              }
            </select>
          </div>

          <div className="form-group">
            <select
              name="gender"
              value={formData.gender ?? ''}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="0">Male</option>
              <option value="1">Female</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <select
              name="health_status"
              value={formData.health_status}
              onChange={handleChange}
              required
            >
              <option value="">Select Health Status</option>
              {Object.entries(healthStatuses).map(([group, statuses]) => (
                <optgroup key={group} label={group}>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="form-group">
            <select
              name="vaccineStatus"
              value={formData.vaccineStatus}
              onChange={handleChange}
              required
            >
              <option value="">Select Vaccine Status</option>
              <option value="Fully Vaccinated">Fully Vaccinated</option>
              <option value="Partly Vaccinated">Partly Vaccinated</option>
              <option value="Not Vaccinated">Not Vaccinated</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="number"
              name="animal_weight"
              placeholder="Weight (kg)"
              value={formData.animal_weight ?? ''}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              name="ageValue"
              placeholder="Age"
              value={ageValue}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <select
              name="ageUnit"
              value={ageUnit}
              onChange={handleChange}
            >
              <option value="Years">Years</option>
              <option value="Months">Months</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="number"
              name="animal_new_price"
              placeholder="New Price"
              value={formData.animal_new_price ?? ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              name="animal_old_price"
              placeholder="Old Price"
              value={formData.animal_old_price ?? ''}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-group">
          <textarea
            name="animal_description"
            placeholder="Animal Description"
            value={formData.animal_description}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>

        <div className="form-group">
          <div className="form-group image-upload-container">
            <label className="file-upload-label">
              Choose Animal Image
              <input
                type="file"
                name="animal_pic"
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
            
            {formData.animal_pic && (
              <div className="image-preview">
                <img src={formData.animal_pic} alt="Animal preview" />
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
            Add Animal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAnimal;