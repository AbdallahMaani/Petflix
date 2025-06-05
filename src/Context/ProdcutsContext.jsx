import React, { useState, useEffect } from 'react';
import '../Context/Context.css';
import Item from '../Components/Item/Item.jsx';
import axios from 'axios';

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

const ProductsContext = () => {
  const [products, setProducts] = useState([]);
  const [visibleItems, setVisibleItems] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [5, 500],
    showOnlyUserItems: false,
    usage: 'all',
    designedFor: 'all',
    size: 'all'
  });
  const [filteredData, setFilteredData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser) {
          const response = await axios.get(`http://localhost:5024/api/User/${loggedInUser.userId}`);
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5024/api/Products', {
          headers: { 'Cache-Control': 'no-cache' },
        });
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, searchQuery, sortBy, filters]);

  const applyFiltersAndSort = () => {
    const filtered = products.filter(item => {
      const matchesSearch = item.product_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product_description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === 'all' || item.product_category === filters.category;
      const matchesPriceRange = item.product_new_price >= filters.priceRange[0] &&
        item.product_new_price <= filters.priceRange[1];
      const matchesUsage = filters.usage === 'all' || item.usage === filters.usage;
      const matchesDesignedFor = filters.designedFor === 'all' || item.designedFor === filters.designedFor;
      const matchesSize = filters.size === 'all' || item.product_size === filters.size;
      const matchesUserItems = !filters.showOnlyUserItems || (currentUser && item.userId === currentUser.userId);
      return matchesSearch && matchesCategory && matchesPriceRange && matchesUsage && matchesDesignedFor && matchesSize && matchesUserItems;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.product_new_price - b.product_new_price;
      if (sortBy === 'price-desc') return b.product_new_price - a.product_new_price;
      if (sortBy === 'name') return a.product_title.localeCompare(b.product_title);
      if (sortBy === 'size') return a.product_size.localeCompare(b.product_size);
      if (sortBy === 'latest') return b.product_id - a.product_id; // Sort by product_id in descending order
      return 0;
    });
    setFilteredData(sorted);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
  };

  const searchSuggestions = products
    .filter(item => item.product_title.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSortBy('latest');
    setFilters({
      category: 'all',
      priceRange: [5, 500],
      showOnlyUserItems: false,
      usage: 'all',
      designedFor: 'all',
      size: 'all'
    });
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleShowMore = () => setVisibleItems(prev => prev + 6);
  const handlePriceRangeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const minPrice = 5;
    const maxPrice = 500;
    const range = maxPrice - minPrice;
    const newMinPrice = minPrice + (value / 100) * range;
    setFilters(prev => ({
      ...prev,
      priceRange: [newMinPrice, maxPrice]
    }));
  };

  const toggleUserItems = () => {
    setFilters(prev => ({
      ...prev,
      showOnlyUserItems: !prev.showOnlyUserItems
    }));
  };

  if (error) {
    let message = error.message;
    if (error.response) {
      message = `Error: ${error.response.status} - ${error.response.data.message || error.message}`;
    } else if (error.request) {
      message = 'No Connection to the server. Please check your internet connection.';
    }
    return (
      <div className="error-overlay show">
        <div className="error-message">{message}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='popular'>
        <h1 className='popular-h1'>LATEST PRODUCTS ADDED</h1>
        <hr />
        <div className="clinics-loading" style={{marginBottom:'5rem'}}>Loading Products ...</div>
      </div>
    );
  }

  return (
    <div className='popular'>
      <h1 className='popular-h-context'>LATEST PRODUCTS ADDED</h1>
      <hr />
      
      <div className="animal-controls">
        {/* First row of filters */}
        <div className="filter-row">

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="latest">Sort By Latest</option>
            <option value="name">Sort By Name</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="size">Sort By Size</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="all">All Categories</option>
            {productData.categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filters.usage}
            onChange={(e) => setFilters({ ...filters, usage: e.target.value })}
          >
            <option value="all">All Usage</option>
            {Object.entries(usages).map(([usageCategory, usageItems]) => (
              <optgroup key={usageCategory} label={usageCategory}>
                {usageItems.map((usage) => (
                  <option key={usage} value={usage}>{usage}</option>
                ))}
              </optgroup>
            ))}
          </select>

          <select
            value={filters.designedFor}
            onChange={(e) => setFilters({ ...filters, designedFor: e.target.value })}
          >
            <option value="all">All Designed For</option>
            {productData.designedFor.map((designed) => (
              <option key={designed} value={designed}>{designed}</option>
            ))}
          </select>

          <select
            value={filters.size}
            onChange={(e) => setFilters({ ...filters, size: e.target.value })}
          >
            <option value="all">All Sizes</option>
            {productData.productSizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          <label className="filter-label">
            <input
              type="checkbox"
              checked={filters.showOnlyUserItems}
              onChange={toggleUserItems}
            />
            Show Only My Products
          </label>


          <input
            type="text"
            placeholder="Search Products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="animal-search"
          />
          {searchQuery && (
            <ul className="search-suggestions">
              {searchSuggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion.product_title)}>
                  {suggestion.product_title}
                </li>
              ))}
            </ul>
          )}

          <button onClick={handleResetFilters} className="reset-btn">Reset All</button>

        </div>

        {/* Full-width price slider */}

        <div className="price-range-container">
          <div className="price-range">
            <span className="price-label">Min: {Math.round(filters.priceRange[0])} JD</span>
            <input
              type="range"
              min="0"
              max="100"
              className="price-slider"
              value={(filters.priceRange[0] - 5) / (500 - 5) * 100}
              onChange={handlePriceRangeChange}
              step="1"
            />
            <span className="price-label">Max: {Math.round(filters.priceRange[1])} JD</span>
          </div>
        </div>
      </div>

      <div className="product-count-container">
        <p>{filteredData.length} Filtered of {products.length} Products</p>
      </div>

      <div className="popular-item">
        {filteredData.slice(0, visibleItems).map((product) => (
          <Item key={product.product_id} {...product} />
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


export default ProductsContext;