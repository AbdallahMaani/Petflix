import p1_img from '../Assets/selling-print-on-demand-pet-products.jpg';
import p2_img from '../Assets/3.webp';
import p3_img from '../Assets/Dog_products2.jpg';
import p4_img from '../Assets/home4_png-3.webp';
import p5_img from '../Assets/Untitled_design_92.webp';
import p6_img from '../Assets/Kit-Cat-Home-Banner_Kit-Cat-Snow-Peas-1.jpg';
import p7_img from '../Assets/DogToppers.avif';
import p8_img from '../Assets/Credelio CAT pack shot.jpg';

let data_product = [];

const products = [
  {
    name: "Comfortable Pet Seat",
    image: p1_img,
    new_price: 49.99,
    old_price: 59.99,
    description: "Give your pet a cozy space with this soft, durable seat. Perfect for cats and dogs, it provides maximum comfort for naps, lounging, or relaxation time."
  },
  {
    name: "Dogs Vaccine",
    image: p2_img,
    new_price: 14.99,
    old_price: 19.99,
    description: "Ensure your dog's health with this essential vaccine. Designed to protect against common diseases and keep your pet safe and healthy year-round."
  },
  {
    name: "Dogs Food (1.5kg)",
    image: p3_img,
    new_price: 39.99,
    old_price: 49.99,
    description: "Nutritious dog food with a balanced formula for energy and growth. Perfect for maintaining your dog's health, shiny coat, and strong muscles daily."
  },
  {
    name: "Pet Wood House",
    image: p4_img,
    new_price: 24.99,
    old_price: 34.99,
    description: "Stylish and sturdy wooden house for your pets. Offers a warm and safe shelter indoors or outdoors, with an easy assembly process included."
  },
  {
    name: "Cream and Vaccine for Dogs",
    image: p5_img,
    new_price: 49.99,
    old_price: 59.99,
    description: "Comprehensive care pack including medicine, soothing cream, and essential vaccines for dogs. Ensures your pet stays healthy, protected, and comfortable at all times."
  },
  {
    name: "Snow Pers for Cats",
    image: p6_img,
    new_price: 19.99,
    old_price: 29.99,
    description: "Tasty and nutritious treats for cats that they’ll love. Supports healthy digestion and provides a delightful snack for your furry friend’s wellbeing."
  },
  {
    name: "Dogs Food (2kg)",
    image: p7_img,
    new_price: 79.99,
    old_price: 99.99,
    description: "Premium dog food with a blend of high-quality ingredients. Supports strong muscles, a healthy coat, and overall vitality for active pets daily."
  },
  {
    name: "Premium Cat Heal",
    image: p8_img,
    new_price: 24.99,
    old_price: 34.99,
    description: "Advanced supplement for cats' joint health and mobility. Easy to administer and ideal for maintaining your pet's active lifestyle and daily comfort."
  }
];

// Generate 52 items
for (let i = 0; i < 52; i++) {
  const product = products[i % products.length]; // Cycle through the 8 products
  data_product.push({
    id: i + 1, // Unique ID
    ...product,
  });
}

export default data_product;