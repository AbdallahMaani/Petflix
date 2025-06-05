import p1_img from '../Assets/selling-print-on-demand-pet-products.jpg';
import p2_img from '../Assets/3.webp';
import p3_img from '../Assets/Dog_products2.jpg';
import p4_img from '../Assets/home4_png-3.webp';
import p5_img from '../Assets/Untitled_design_92.webp';
import p6_img from '../Assets/Kit-Cat-Home-Banner_Kit-Cat-Snow-Peas-1.jpg';
import p7_img from '../Assets/DogToppers.avif';
import p8_img from '../Assets/Credelio CAT pack shot.jpg';
import Male_Pic from '../Assets/male.jpeg';
import Female_Pic from '../Assets/female.jpeg';

let data_product = [
  {
    id: 1,
    name: "Comfortable Pet Seat",
    image: p1_img,
    new_price: 49.99,
    old_price: 59.99,
    description: "Give your pet a cozy space with this soft, durable seat. Perfect for cats and dogs, it provides maximum comfort for naps, lounging, or relaxation time.",
    ownerName: "Pet Supplies Store",
    ownerContact: "petsupplies@live.com",
    ownerLocation: "Amman, Jordan",
    ownerPhone: "+962 777 654 321",
    ownerDelivery: "Yes",
    ownerAvailableDays: "Weekends",
    ownerAvailableHours: "10:00 AM to 4:00 PM",
    ownerProfilePic: Male_Pic,
    category: "Accessories",
    type: "Pet Seat",
    size: "Large",
    weight: "None",
    expiration: "None",
    usage: "Indoor & Travel",
    designedFor: "Cats & Dogs",
    reviews: [
        { reviewer: "Alice", profilePic: Female_Pic, content: "Super comfortable seat! My cat loves it." },
        { reviewer: "Bob", profilePic: Male_Pic, content: "Great quality, highly recommend!" },
        { reviewer: "Carol", profilePic: Female_Pic, content: "Excellent value for the price. My dog uses it all the time." },
    ],
    ownerReviews: [
        { reviewer: "David", profilePic: Male_Pic, content: "Great seller, fast shipping!" },
        { reviewer: "Eve", profilePic: Female_Pic, content: "Very responsive and helpful." },
    ]
},

  {
    id: 2,
    name: "Dogs Vaccine",
    image: p2_img,
    new_price: 14.99,
    old_price: 19.99,
    description: "Ensure your dog's health with this essential vaccine. Designed to protect against common diseases and keep your pet safe and healthy year-round.",
    ownerId:5,
    ownerName: "Vet Clinic Amman",
    ownerContact: "vetclinic@yahoo.com",
    ownerLocation: "Amman, Jordan",
    ownerPhone: "+962 777 123 789",
    ownerDelivery: "No",
    ownerAvailableDays: "Monday to Friday",
    ownerAvailableHours: "9:00 AM to 6:00 PM",
    ownerProfilePic: Female_Pic,
    category: "Healthcare",
    type: "Vaccine",
    size: "Small",
    weight: "0.1",
    expiration: "2026-08-15",
    usage: "Preventative Care",
    designedFor: "Dogs",
    reviews: [
        { reviewer: "Charlie", profilePic: Male_Pic, content: "Easy to use, and my dog had no issues!" },
        { reviewer: "Diana", profilePic: Female_Pic, content: "Great vaccine, keeps my dog healthy." },
        { reviewer: "Fiona", profilePic: Female_Pic, content: "Highly recommend this clinic for vaccinations." },
    ],
    ownerReviews: [
        { reviewer: "Grace", profilePic: Female_Pic, content: "Excellent service, very professional." },
        { reviewer: "Adam", profilePic: Male_Pic, content: "Amzaing service and very quick in responsing." }

    ]
},
{
  id: 3,
  name: "Dogs Food (1.5kg)",
  image: p3_img,
  new_price: 39.99,
  old_price: 49.99,
  description: "Nutritious dog food with a balanced formula for energy and growth. Perfect for maintaining your dog's health, shiny coat, and strong muscles daily.",
  ownerName: "Premium Pet Foods",
  ownerContact: "petfoods@hotmail.com",
  ownerLocation: "Zarqa, Jordan",
  ownerPhone: "+962 777 987 654",
  ownerDelivery: "Yes",
  ownerAvailableDays: "Monday to Saturday",
  ownerAvailableHours: "8:00 AM to 5:00 PM",
  ownerProfilePic: Male_Pic,
  category: "Food",
  type: "Dog Food",
  size: "Medium",
  weight: "1.5",
  expiration: "2025-12-30",
  usage: "Daily Nutrition",
  designedFor: "Dogs",
  reviews: [
    { reviewer: "Eve", profilePic: Female_Pic, content: "My dog loves this food!" },
    { reviewer: "Frank", profilePic: Male_Pic, content: "Great quality and value for money." },
  ],
  ownerReviews: [
    { reviewer: "Gina", profilePic: Female_Pic, content: "Excellent seller, Every time i buy from them it ends always happy." },
    { reviewer: "Henry", profilePic: Male_Pic, content: "Fast delivery and great communication." },
  ]
},
{
  id: 4,
  name: "Pet Wood House",
  image: p4_img,
  new_price: 24.99,
  old_price: 34.99,
  description: "Stylish and sturdy wooden house for your pets. Offers a warm and safe shelter indoors or outdoors, with an easy assembly process included.",
  ownerName: "Top Pets Products",
  ownerContact: "petcomforts@yahoo.com",
  ownerLocation: "Irbid, Jordan",
  ownerPhone: "+962 777 321 987",
  ownerDelivery: "Yes",
  ownerAvailableDays: "Tuesday to Sunday",
  ownerAvailableHours: "7:00 AM to 9:00 PM",
  ownerProfilePic: Female_Pic,
  category: "Accessories",
  type: "Pet House",
  size: "Large",
  weight: "5",
  expiration: "None",
  usage: "Indoor & Outdoor Shelter",
  designedFor: "Cats & Dogs",
  reviews: [
    { reviewer: "George", profilePic: Male_Pic, content: "My pets love this house, very sturdy!" },
    { reviewer: "Hannah", profilePic: Female_Pic, content: "Looks great in my backyard." },
    { reviewer: "Ian", profilePic: Male_Pic, content: "Very well made, my cat loves it!" },
    { reviewer: "Julia", profilePic: Female_Pic, content: "Fantastic quality, easy to assemble." }
  ],
  ownerReviews: [
    { reviewer: "Kevin", profilePic: Male_Pic, content: "Beautifully crafted pet houses." },
    { reviewer: "Linda", profilePic: Female_Pic, content: "Excellent customer service." },
  ]
},
{
  id: 5,
  name: "Cream and Vaccine for Dogs",
  image: p5_img,
  new_price: 49.99,
  old_price: 59.99,
  description: "Comprehensive care pack including medicine, soothing cream, and essential vaccines for dogs. Ensures your pet stays healthy, protected, and comfortable at all times.",
  ownerName: "Healthy Paws",
  ownerProfilePic: Male_Pic,
  ownerContact: "healthypaws@live.com",
  ownerLocation: "Amman, Jordan",
  ownerPhone: "+962 777 456 123",
  ownerDelivery: "No",
  ownerAvailableDays: "Every day",
  ownerAvailableHours: "9:00 AM to 6:00 PM",
  category: "Healthcare",
  type: "Medical Kit",
  size: "Small",
  weight: "0.5",
  expiration: "2025-10-05",
  usage: "First Aid & Treatment",
  designedFor: "Dogs",
  reviews: [
    { reviewer: "Kate", profilePic: Female_Pic, content: "Really useful kit for my dog’s care!" },
    { reviewer: "Liam", profilePic: Male_Pic, content: "The cream works wonders, great product." }
  ],
  ownerReviews: [
      { reviewer: "Mia", profilePic: Female_Pic, content: "Reliable and trustworthy pet care products." },
      { reviewer: "Noah", profilePic: Male_Pic, content: "Highly recommend this seller for pet healthcare." },
    ]
},
{
  id: 6,
  name: "Snow Pers for Cats",
  image: p6_img,
  new_price: 19.99,
  old_price: 29.99,
  description: "Tasty and nutritious treats for cats that they’ll love. Supports healthy digestion and provides a delightful snack for your furry friend’s wellbeing.",
  ownerName: "Cat Treats Co.",
  ownerContact: "cattreats@hotmail.com",
  ownerLocation: "Aqaba, Jordan",
  ownerPhone: "+962 777 852 741",
  ownerDelivery: "Yes",
  ownerAvailableDays: "Weekdays",
  ownerAvailableHours: "8:00 AM to 4:00 PM",
  category: "Food",
  type: "Cat Treats",
  size: "Small",
  weight: "0.2",
  expiration: "2026-06-10",
  usage: "Snack & Supplement",
  designedFor: "Cats",
  reviews: [
    { reviewer: "Kate", profilePic: Female_Pic, content: "Really useful kit for my cat's care!" },
    { reviewer: "Liam", profilePic: Male_Pic, content: "The house is so cute, great product." }
  ],
  ownerReviews: [
      { reviewer: "Olivia", profilePic: Female_Pic, content: "My cats go crazy for these treats!" },
      { reviewer: "Peter", profilePic: Male_Pic, content: "Great selection of cat treats." },
    ]
},
{
  id: 7,
  name: "Dogs Food (2kg)",
  image: p7_img,
  new_price: 79.99,
  old_price: 99.99,
  description: "Premium dog food with a blend of high-quality ingredients. Supports strong muscles, a healthy coat, and overall vitality for active pets daily.",
  ownerId:1,
  ownerName: "John Doe",
  ownerContact: "topdog@gamil.com",
  ownerLocation: "Salt, Jordan",
  ownerPhone: "+962 777 963 258",
  ownerDelivery: "Yes",
  ownerAvailableDays: "Tuesday to Sunday",
  ownerAvailableHours: "10:00 AM to 6:00 PM",
  category: "Food",
  type: "Dog Food",
  size: "Large",
  weight: "2",
  expiration: "2025-09-20",
  usage: "Daily Nutrition",
  designedFor: "Dogs",
  reviews: [
    { reviewer: "Cali Logan", profilePic: Female_Pic, content: "Very responsive and helpful and he listen for feedback." },
    { reviewer: "Montana", profilePic: Male_Pic, content: "Great quality and value for money." }
  ],
  ownerReviews: [
      { reviewer: "Quinn", profilePic: Female_Pic, content: "Best seller food I've found, highly recommend." },
      { reviewer: "Ryan", profilePic: Male_Pic, content: "My dog's coat has never been shinier thx to the seller." },
    ]
},
{
        id: 8,
        name: "Premium Cat Heal",
        image: p8_img,
        new_price: 24.99,
        old_price: 34.99,
        description: "Advanced supplement for cats' joint health and mobility. Easy to administer and ideal for maintaining your pet's active lifestyle and daily comfort.",
        ownerName: "Feline Wellness",
        ownerContact: "wellness@icloud.com",
        ownerLocation: "Madaba, Jordan",
        ownerPhone: "+962 777 741 852",
        ownerDelivery: "No",
        ownerAvailableDays: "Monday to Friday",
        ownerAvailableHours: "9:00 AM to 5:00 PM",
        ownerProfilePic: Male_Pic,
        category: "Healthcare",
        type: "Cat Supplement",
        size: "Small",
        weight: "0.3",
        expiration: "2026-01-15",
        usage: "Joint & Mobility Support",
        designedFor: "Cats",
        reviews: [
            { reviewer: "Ivy", profilePic: Female_Pic, content: "My cat is much more active now!" },
            { reviewer: "Jack", profilePic: Male_Pic, content: "Great for senior cats." },
            { reviewer: "Kelly", profilePic: Female_Pic, content: "Helped improve my cat's mobility." },
        ],
        ownerReviews: [
            { reviewer: "Liam", profilePic: Male_Pic, content: "Fast and efficient service." },
            { reviewer: "Mia", profilePic: Female_Pic, content: "Very knowledgeable about cat health." },
        ]
    }];

export default data_product;
