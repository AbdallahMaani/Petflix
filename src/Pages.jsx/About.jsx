import React from 'react';
import '../Pages.css/About.css'; // Assuming you have a CSS file for styling
import Footer from '../Components/Footer/Footer'; // Import Footer

const About = () => {
  return (
    <>
    <div className="about-page">
      <h1>About Petflix</h1>
      <div className="about-content">
        <div className="left-side">
          <section className="about-description">
            <h2>Description</h2>
            <div className="description-part">
              <p>
                At Petflix, we understand that pets are more than just animals; they are family. Our platform offers a wide range of products, from food and toys to accessories and healthcare items, ensuring that your pets get the best care possible. We also provide valuable resources and articles on pet care, training, and health to help you become the best pet parent you can be.
              </p>
              <p>
                Our community section allows you to connect with other pet enthusiasts, share your experiences, and learn from others. Whether you have a dog, cat, bird, fish, or any other pet, Petflix is here to support you every step of the way.
              </p>
            </div>
            </section>
            <section className="about-description">
            <div className="description-part">
              <h2>Overview</h2>
              <p>
                Petflix is your one-stop destination for all things related to pets. Whether you are looking for the best products for your furry friends, seeking advice on pet care, or wanting to connect with other pet lovers, Petflix has got you covered.
              </p>
            </div>
            </section>
            
            <section className="about-description">
            <div className="description-part">
              <h2>Unique Idea</h2>
              <p>
                We provide a unique idea that does not exist in the Middle East. Our platform offers innovative solutions and services tailored to the needs of pet owners in the region. From exclusive products to specialized care guides, Petflix is dedicated to enhancing the pet ownership experience in the Middle East.
              </p>
            </div>
          </section>
        </div>
        <div className="right-side">
          <section className="about-overview">
            <h2>Petflix AI</h2>
            <p>
              At Petflix, we leverage the power of AI to help our users and customers get their needs met faster. You can ask Petflix AI about everything inside the website, such as the best animals, products, and related items. Our AI can provide information about the best owners, reviews, contact details, locations, and all the details about owners and animals. Additionally, Petflix AI offers guides for animal care, tips, and other valuable information to ensure your pets receive the best treatment.
            </p>
          </section>
          <section className="about-approach">
            <h2>Our Approach</h2>
            <p>
              At Petflix, our approach is centered around three core principles:
            </p>
            <br></br>
            <ul>
              <li><strong>Quality:</strong> We offer only the best products that meet our high standards of quality and safety.</li>
              <li><strong>Community:</strong> We believe in the power of community and strive to create a supportive and engaging environment for all pet lovers.</li>
              <li><strong>Education:</strong> We provide valuable resources and information to help you take the best care of your pets.</li>
            </ul>
            <p>
              Join us on Petflix and become a part of a community that loves and cares for pets just as much as you do. Together, we can ensure that our pets lead happy, healthy, and fulfilling lives.
            </p>
          </section>
          <section className="about-vision">
            <h2>Our Vision</h2>
            <p>
              Our vision is to be the leading platform for pet care, connecting pet owners with the best products, resources, and community support. We aim to make a positive impact on the lives of pets and their owners around the world.
            </p>
          </section>
        </div>
      </div>
      <div className="bottom-side">
        <section className="about-summary">
          <h2>Summary</h2>
          <p>
            Our mission at Petflix is to enhance the lives of pets and their owners by providing high-quality products, valuable information, and a supportive community. We are dedicated to promoting responsible pet ownership and ensuring that every pet receives the love and care they deserve.
          </p>
        </section>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default About;