import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white text-center p-3">
      <div className="footer">
        <div className="footer-links">
          <Link to="/about-us">About Us</Link> |  
          <Link to="/terms-of-service"> Terms of Service</Link> |  
          <Link to="/privacy-policy"> Privacy Policy</Link> |  
          <Link to="/contact"> Contact</Link> |  
          <Link to="/booking"> Book an Event</Link>
        </div>

        <div className="social-links mt-2">
          <a href="https://www.facebook.com/profile.php?id=61572956517590" target="_blank" rel="noopener noreferrer">
            <FaFacebook size={24} />
          </a>
          <a href="https://www.instagram.com/savourykitchens1/" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={24} />
          </a>
          <a href="https://www.tiktok.com/@savourykitchens1" target="_blank" rel="noopener noreferrer">
            <FaTiktok size={24} />
          </a>
        </div>

        <p className="copyright">&copy; 2025 Afriquize Delights Events. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
