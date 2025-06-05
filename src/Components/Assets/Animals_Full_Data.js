import p1_img from '../Assets/Kitten-with-ball-1-scaled-1.jpg';
import p2_img from '../Assets/DogFood1.avif';
import p3_img from '../Assets/Toronto-cat-photography1-4.jpg';
import p4_img from '../Assets/image-asset.jpeg';
import p5_img from '../Assets/Dog.jpg';
import p6_img from '../Assets/thumb-1920-969616.jpg';
import p7_img from '../Assets/cat-photographer-in-los-angeles.jpg';
import p8_img from '../Assets/cat-2083492_1280.jpg';

// Original data
let data_product = [
  {
    id: 1,
    name: "Male cat 2.5 years old",
    image: p1_img,
    new_price: 99.99,
    old_price: 119.99,
    description: "Friendly 2.5-year-old male cat, fully vaccinated and litter trained. Great with families and individuals, he loves to play and will bring joy and companionship to your home."
  },
  {
    id: 2,
    name: "Female Dog 3.5 years old",
    image: p2_img,
    new_price: 119.99,
    old_price: 149.99,
    description: "Gentle 3.5-year-old female cat, perfect for quiet homes. Health-checked, neutered, and vaccinated, she loves affection and will bring warmth to your life."
  },
  {
    id: 3,
    name: "Female cat 4 years old",
    image: p3_img,
    new_price: 129.99,
    old_price: 179.99,
    description: "Elegant 4-year-old female cat, fully vaccinated and healthy. Calm and curious, she makes an ideal companion for those who enjoy a relaxed pet."
  },
  {
    id: 4,
    name: "Male Dog 5 years old",
    image: p4_img,
    new_price: 299.99,
    old_price: 349.99,
    description: "Energetic 5-year-old male dog, vaccinated and trained. Perfect for active families, he loves outdoor activities and will be a loyal, fun companion."
  },
  {
    id: 5,
    name: "3 Dogs 6 months old",
    image: p5_img,
    new_price: 499.99,
    old_price: 579.99,
    description: "Playful 6-month-old male kitten, vaccinated and litter trained. Great for families or anyone seeking a loving, energetic pet to brighten their home."
  },
  {
    id: 6,
    name: "Female puppy 1 year old",
    image: p6_img,
    new_price: 179.99,
    old_price: 299.99,
    description: "Cheerful 1-year-old female puppy, vaccinated and trained. Loves cuddles and adventures, making her a perfect fit for active families or individuals."
  },
  {
    id: 7,
    name: "Male Persian cat 3 years old",
    image: p7_img,
    new_price: 199.99,
    old_price: 249.99,
    description: "Elegant 3-year-old Persian male cat, vaccinated and groomed. Calm and friendly, he loves lounging and being pampered, bringing sophistication to any home."
  },
  {
    id: 8,
    name: "Female cat 1.5 years old",
    image: p8_img,
    new_price: 299.99,
    old_price: 349.99,
    description: "Affectionate 4-year-old female cat, neutered and vaccinated. Sociable and sweet, she adapts quickly and is a wonderful addition to a loving home."
  },
];

// Function to generate additional items
const generateAdditionalItems = (originalArray, targetLength) => {
  const additionalItems = [];
  for (let i = originalArray.length + 1; i <= targetLength; i++) {
    const originalItem = originalArray[(i - 1) % originalArray.length]; // Cycle through original items
    const newItem = {
      ...originalItem,
      id: i,
      name: `${originalItem.name}`, // Use the original name without "Copy"
      new_price: originalItem.new_price, // Adjust price for uniqueness
      old_price: originalItem.old_price, // Adjust price for uniqueness
      description: `${originalItem.description} This is a duplicate item to expand the catalog.`,
    };
    additionalItems.push(newItem);
  }
  return additionalItems;
};

// Generate additional items to reach 52 items
const additionalItems = generateAdditionalItems(data_product, 52);

// Combine original and additional items
const expandedDataProduct = [...data_product, ...additionalItems];

export default expandedDataProduct;