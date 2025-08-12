import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import BookingPage from "./Booking";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;
console.log("API_URL:", process.env.REACT_APP_API_URL);

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [images, setImages] = useState({});
  const [currentIndexes, setCurrentIndexes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/testimonials/gettestimonials`)
      .then((response) => setReviews(response.data))
      .catch((error) => console.error("Error fetching reviews:", error));

    // Fetch gallery images
    fetch(`${API_URL}/gallery/getimages`)
      .then((response) => response.json())
      .then((data) => {
        const groupedImages = data.reduce((acc, image) => {
          if (!acc[image.category]) {
            acc[image.category] = [];
          }
          acc[image.category].push(image);
          return acc;
        }, {});

        setImages(groupedImages);
        setCurrentIndexes(
          Object.keys(groupedImages).reduce((acc, category) => {
            acc[category] = 0;
            return acc;
          }, {})
        );
      })
      .catch((error) => console.error("Error fetching gallery:", error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndexes((prevIndexes) => {
        const newIndexes = { ...prevIndexes };
        Object.keys(images).forEach((category) => {
          if (images[category]?.length > 0) {
            newIndexes[category] =
              (prevIndexes[category] + 1) % images[category].length;
          }
        });
        return newIndexes;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  const handleCategoryClick = (category) => {
    navigate(`/gallery/${category}`);
  };

  return (
    <>
      <section className="hero">
        <div className="screen text-center text-white">
          <h1>Welcome to Afrikuizine Delights</h1>
          <p>
            We provide top-tier catering, event decoration, public address, and
            event planning services.
          </p>
        </div>
      </section>

      <section id="gallery" className="container my-5">
        <h2 className="text-center mb-4">Gallery</h2>
        <div className="gallery-container">
  {["Events", "Decorations", "Menu/Food"].map((category) => {
    if (!images[category] || images[category].length === 0) return null;
    const currentImage = images[category][currentIndexes[category]];

    return (
      <div key={category} className="gallery-item text-center">
        <img
          src={require(`../assets/images/${currentImage.image_url}`)} 
          alt={category}
          className={`fade-in`}
          onLoad={(e) => {
            e.target.classList.remove("fade-out");
            e.target.classList.add("fade-in");
          }}
          onError={(e) => console.error("Image load error:", e)}
          style={{ cursor: "pointer" }}
          onClick={() => handleCategoryClick(category)}
        />
        <div className="description mt-2">
                  <p className="text-primary">{category}</p>
        </div>
      </div>
    );
  })}
</div>

      </section>

      <section className="reviews-section container mt-5">
        <h2 className="text-center">Customer Reviews</h2>
        <div className="review-list mt-3">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="review p-3 mb-3 shadow-sm rounded">
                {review.text}
              </div>
            ))
          ) : (
            <p className="text-center">No reviews yet.</p>
          )}
        </div>
        <form className="mt-4" onSubmit={(e) => {
          e.preventDefault();
          axios
            .post(`${API_URL}/testimonials/addtestimonial`, { text: newReview })
            .then((response) => {
              setReviews([...reviews, response.data]);
              setNewReview("");
            })
            .catch((error) => console.error("Error submitting review:", error));
        }}>
          <textarea
            className="form-control"
            placeholder="Write a review..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            required
          />
          <button className="btn btn-primary mt-2" type="submit">
            Submit Review
          </button>
        </form>
      </section>

 
      <section className="booking-section mt-5">
        <BookingPage />
      </section>
    </>
  );
};

export default Home;
