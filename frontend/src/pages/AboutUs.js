import React from "react";
import "../assets/css/Legal.css";
import { FaUtensils, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaConciergeBell} from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="container about-container">
      <h1 className="about-title">About Us</h1>
      <p className="about-intro">
        Welcome to <strong>Afriquizine Delights</strong>, where we combine culinary excellence with
        seamless event planning to create unforgettable moments.
      </p>

      <section className="about-section">
        <h2><FaConciergeBell className="icon" /> Our Mission</h2>
        <p>
          To provide world-class catering and event solutions, blending passion, creativity, and professionalism. 
          We aim to delight our clients with mouth-watering dishes and impeccable service.
        </p>
      </section>

      <section className="about-section">
        <h2><FaUtensils className="icon" /> What We Offer</h2>
        <ul>
          <li>🍽 Catering equipment hire — commercial cooking pots, chafing dishes, bain-maries, drink urns.</li>
          <li>🎉 Catering for weddings, pre-weddings, baby showers, funerals, birthdays, engagement parties, staff parties, and friendly get-togethers.</li>
          <li>📋 Customizable menus to suit every occasion and preference.</li>
          <li>👨‍🍳 Professional chefs and experienced service staff.</li>
          <li>🗓 Full event planning and coordination services.</li>
        </ul>
      </section>

      <section className="about-section">
        <h2><FaMapMarkerAlt className="icon" /> Our Locations</h2>
        <p>
          📍 <strong>Adelaide, Australia</strong> — providing premium catering and equipment hire for all occasions.
        </p>
        <p>
          📍 <strong>Gatundu South, Nairobi, Kenya</strong> — delivering top-tier catering and event services.
        </p>
      </section>

      <section className="about-section contact-info">
        <h2><FaPhoneAlt className="icon" /> Contact Us</h2>
        <p><FaEnvelope /> Email: <a href="mailto:afriquizines@gmail.com">afriquizines@gmail.com</a></p>
        <p><FaPhoneAlt /> Phone (Australia): <a href="tel:+61404450433">+61 404 450 433</a></p>
        <p><FaPhoneAlt /> Phone (Kenya): <a href="tel:+254704064441">+254 704 064 441</a></p>
      </section>
    </div>
  );
};

export default AboutUs;