import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/css/Booking.css';

const API_URL = process.env.REACT_APP_API_URL;

const BookingPage = () => {
  const [availableDates, setAvailableDates] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    numberOfGuests: 1,
  });

  useEffect(() => {
    axios.get(`${API_URL}/availability/dates`)
      .then((response) => {
        console.log("Available Dates API Response:", response.data);
        setAvailableDates(response.data.dates || []);
      })
      .catch((error) => {
        console.error('Error fetching available dates:', error);
      });
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post(`${API_URL}/booking`, formData)
      .then(() => {
        alert('Booking successful!');

        // ✅ Mark selected date as booked in the database
        axios.put(`${API_URL}/book-date`, { date: formData.date })
          .then(() => {
            setAvailableDates(availableDates.filter(d => d !== formData.date));
          })
          .catch(err => console.error('Error marking date as booked:', err));

        // Reset form
        setFormData({
          name: '',
          email: '',
          date: '',
          numberOfGuests: 1,
        });
      })
      .catch((error) => {
        console.error('Error creating booking!', error);
        alert('Error creating booking. Please try again.');
      });
  };

  return (
    <div className="booking-container">
      <div className="booking-card">
        <h2 className="text-center">Catering Booking</h2>

        <form onSubmit={handleSubmit} className="booking-form">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
         <label htmlFor="date">Select Date:</label>
         <select id="date" name="date" value={formData.date} onChange={handleChange} required>
            <option value="">Select a date</option>
              {availableDates.length > 0 ? (
                    availableDates.map((dateObj, index) => {
                            const date = new Date(dateObj.date);
                            const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
                              .toString().padStart(2, "0")}/${date.getFullYear()} ${date.toLocaleDateString('en-US', { weekday: 'short' })}`;
                return (
                  <option key={index} value={dateObj.date}>
                     {formattedDate}
                  </option>
                  );
              })
           ) : (
            <option disabled>No available dates</option>
          )}
          </select>



          <label htmlFor="numberOfGuests">Number of Guests:</label>
          <input
            type="number"
            id="numberOfGuests"
            name="numberOfGuests"
            value={formData.numberOfGuests}
            onChange={handleChange}
            required
            min="1"
          />

          <button type="submit">Book Now</button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
