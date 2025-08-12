import React, { useState } from 'react';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaUser, FaRegCommentDots } from 'react-icons/fa';
import '../assets/css/Contact.css';

const Contact = () => {
  const contact = {
    email: 'afriquizines@gmail.com',
    phoneAustralia: '+61 404 450 433',
    phoneKenya: '+254 704 064 441',
    addressAustralia: 'Adelaide, Australia'
  };

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message Sent:", formData);
    setSuccess(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      {/* Banner Section */}
      <div className="contact-banner">
        <div className="overlay">
          <h1>Get in Touch</h1>
          <p>We’re here to help you plan your perfect event</p>
        </div>
      </div>

      <div className="container mt-5">
        <div className="row g-4">
          {/* Contact Info */}
          <div className="col-md-5">
            <div className="card contact-card p-4 shadow-sm">
              <div className="contact-item">
                <div className="icon-circle bg-primary"><FaEnvelope /></div>
                <div>
                  <h5>Email</h5>
                  <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
                </div>
              </div>
              <div className="contact-item">
                <div className="icon-circle bg-success"><FaPhoneAlt /></div>
                <div>
                  <h5>Phone</h5>
                  <p>Australia: <a href={`tel:${contact.phoneAustralia}`}>{contact.phoneAustralia}</a></p>
                  <p>Kenya: <a href={`tel:${contact.phoneKenya}`}>{contact.phoneKenya}</a></p>
                </div>
              </div>
              <div className="contact-item">
                <div className="icon-circle bg-danger"><FaMapMarkerAlt /></div>
                <div>
                  <h5>Address</h5>
                  <p>Australia: {contact.addressAustralia}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-md-7">
            <div className="card p-4 shadow-sm form-card">
              <h4 className="mb-3">Send us a Message</h4>
              {success && <div className="alert alert-success">✅ Your message has been sent!</div>}
              <form onSubmit={handleSubmit}>
                <div className="input-group mb-3">
                  <span className="input-group-text"><FaUser /></span>
                  <input type="text" name="name" className="form-control" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text"><FaEnvelope /></span>
                  <input type="email" name="email" className="form-control" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text"><FaRegCommentDots /></span>
                  <textarea name="message" className="form-control" placeholder="Your Message" rows="4" value={formData.message} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary w-100">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
