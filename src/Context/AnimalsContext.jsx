import React, { useState, useEffect } from 'react';
import '../Context/Context.css';
import Item from '../Components/Item/Item.jsx';
import axios from 'axios';

const AnimalsContext = () => {
  const [animals, setAnimals] = useState([]);
  const [visibleItems, setVisibleItems] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filters, setFilters] = useState({
    category: 'all',
    age: 'all',
    vaccinated: 'all',
    gender: 'all',
    priceRange: [0, 10000],
    showOnlyUserItems: false,
  });
  const [filteredData, setFilteredData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const categories = ["Dog", "Cat", "Bird", "Fish", "Horse", "Sheep", "Goats", "Camel", "Cow", "Small Animal", "Reptile", "Poultry", "Other"];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser) {
          const response = await axios.get(`‏https://localhost:7007/api/User/${loggedInUser.userId}`);
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        const response = await axios.get('‏https://localhost:7007/api/Animals', {
          headers: { 'Cache-Control': 'no-cache' },
        });
        const fetchedAnimals = response.data;
        setAnimals(fetchedAnimals);
      } catch (err) {
        console.error("Error fetching animals:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [animals, searchQuery, sortBy, filters]);

  const extractAgeNumber = (ageString) => {
    if (!ageString) return 0;
    const ageMatch = ageString.match(/\d+(\.\d+)?/);
    return ageMatch ? parseFloat(ageMatch[0]) : 0;
  };

  const applyFiltersAndSort = () => {
    let filtered = animals.filter(item => {
      const itemAge = extractAgeNumber(item.age);
      const matchesSearch = 
        (item.animal_title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.animal_description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === 'all' || item.animal_category === filters.category;
      const matchesAge = filters.age === 'all' || itemAge <= parseInt(filters.age);
      const matchesVaccinated = filters.vaccinated === 'all' || item.vaccineStatus === filters.vaccinated;
      const matchesGender = filters.gender === 'all' || item.gender === parseInt(filters.gender);
      const matchesPriceRange = 
        (item.animal_new_price ?? 0) >= filters.priceRange[0] && 
        (item.animal_new_price ?? 0) <= filters.priceRange[1];
      const matchesUserItems = !filters.showOnlyUserItems || (currentUser && item.userId === currentUser.userId);

      return matchesSearch && matchesCategory && matchesAge && matchesVaccinated && matchesGender && matchesPriceRange && matchesUserItems;
    });

    const sorted = [...filtered].sort((a, b) => {
      const ageA = extractAgeNumber(a.age);
      const ageB = extractAgeNumber(b.age);
      if (sortBy === 'price-asc') return (a.animal_new_price ?? 0) - (b.animal_new_price ?? 0);
      if (sortBy === 'price-desc') return (b.animal_new_price ?? 0) - (a.animal_new_price ?? 0);
      if (sortBy === 'age') return ageA - ageB;
      if (sortBy === 'name') return a.animal_title.localeCompare(b.animal_title);
      if (sortBy === 'latest') return b.animal_id - a.animal_id;
      return 0;
    });

    setFilteredData(sorted);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSuggestionClick = (suggestion) => setSearchQuery(suggestion);
  const handleShowMore = () => setVisibleItems((prev) => prev + 6);

  const handlePriceRangeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const minPrice = 0;
    const maxPrice = 10000;
    const range = maxPrice - minPrice;
    const newMinPrice = minPrice + (value / 100) * range;
    const roundedMinPrice = Math.round(newMinPrice / 10) * 10;

    setFilters((prevFilters) => ({
      ...prevFilters,
      priceRange: [roundedMinPrice, maxPrice]
    }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSortBy('latest');
    setFilters({
      category: 'all',
      age: 'all',
      vaccinated: 'all',
      gender: 'all',
      priceRange: [0, 10000],
      showOnlyUserItems: false
    });
  };

  const toggleUserItems = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      showOnlyUserItems: !prevFilters.showOnlyUserItems
    }));
  };

  const searchSuggestions = animals
    .filter(item => item.animal_title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  if (loading) {
    return (
      <div className='popular'>
        <h1 className='popular-h1'>LATEST ANIMALS ADDED</h1>
        <hr />
        <div className="clinics-loading" style={{marginBottom:'5rem'}}>Loading Animals ...</div>
      </div>
    );
  }

  if (error) {
    let message = error.message;
    if (error.response) {
      message = `Error: ${error.response.status} - ${error.response.data.message || error.message}`;
    } else if (error.request) {
      message = "No connection to the server. Please check your internet.";
    } else {
      message = `Error: ${error.message}`;
    }
    return (
      <div className="error-overlay show">
        <div className="error-message">{message}</div>
      </div>
    );
  }

  return (
    <div className='popular'>
      <h1 className='popular-h-context'>LATEST ANIMALS ADDED</h1>
      <hr />
      
      <div className="animal-controls">
        <div className="filter-row">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="latest">Sort By Latest</option>
            <option value="name">Sort By Name</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="age">Age: Youngest First</option>
          </select>

          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select value={filters.age} onChange={(e) => setFilters({ ...filters, age: e.target.value })}>
            <option value="all">All Ages</option>
            <option value="1">Up to 1 year</option>
            <option value="2">Up to 2 years</option>
            <option value="3">Up to 3 years</option>
            <option value="4">Up to 4 years</option>
            <option value="5">Up to 5 years</option>
          </select>

          <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}>
            <option value="all">All Genders</option>
            <option value="0">Male</option>
            <option value="1">Female</option>
          </select>

          <select value={filters.vaccinated} onChange={(e) => setFilters({ ...filters, vaccinated: e.target.value })}>
            <option value="all">Any Vaccination</option>
            <option value="Fully Vaccinated">Fully Vaccinated</option>
            <option value="Partly Vaccinated">Partly Vaccinated</option>
            <option value="Not Vaccinated">Not Vaccinated</option>
          </select>

        </div>

          <div className="filter-row">
          <label className="filter-label">
            <input
              type="checkbox"
              checked={filters.showOnlyUserItems}
              onChange={toggleUserItems}
            />
            Show Only My Animals
          </label>


          <input
            type="text"
            placeholder="Search Animals..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="animal-search"
          />
          {searchQuery && (
            <ul className="search-suggestions">
              {searchSuggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion.animal_title)}>
                  {suggestion.animal_title}
                </li>
              ))}
            </ul>
          )}

          <button className="reset-btn" onClick={resetFilters}>Reset All</button>
          
        </div>
        

        <div className="price-range-container">
          <div className="price-range">
            <span className="price-label">Min: {filters.priceRange[0]} JD</span>
            <input
              type="range"
              min="0"
              max="100"
              value={(filters.priceRange[0] - 0) / (10000 - 0) * 100}
              onChange={handlePriceRangeChange}
              className="price-slider"
            />
            <span className="price-label">Max: {filters.priceRange[1]} JD</span>
          </div>
        </div>
      </div>

      <div className="product-count-container">
        <p>{filteredData.length} Filtered of {animals.length} Animals</p>
      </div>

      <div className="popular-item">
        {filteredData.slice(0, visibleItems).map((animal) => (
          <Item key={animal.animal_id} {...animal} />
        ))}
      </div>
      {visibleItems < filteredData.length && (
        <button onClick={handleShowMore} className="more-btn">
          Show More
        </button>
      )}
    </div>
  );
};

export default AnimalsContext;