import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import BookingPage from "./Booking";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
console.log("API_URL:", API_URL);

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
      {/* Hero Section */}
      <section className="hero d-flex align-items-center justify-content-center text-center text-white">
        <div className="overlay p-4">
          <h1>Welcome to Afrikuizine Delights</h1>
          <p>Delicious African & International Cuisine for All Occasions</p>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="container my-5">
        <h2 className="text-center mb-4">Gallery</h2>
        <div className="row">
          {["Events", "Decorations", "Menu/Food"].map((category) => {
            if (!images[category] || images[category].length === 0) return null;

            // Sanitize category string for HTML id
            const safeId = `carousel-${category.replace(/[^a-zA-Z0-9-_]/g, "")}`;

            return (
              <div key={category} className="col-md-4 mb-4">
                <div
                  id={safeId}
                  className="carousel slide shadow rounded"
                  data-bs-ride="carousel"
                >
                  <div className="carousel-inner">
                    {images[category].map((img, index) => (
                      <div
                        key={index}
                        className={`carousel-item ${
                          index === currentIndexes[category] ? "active" : ""
                        }`}
                      >
                        <img
                          src={`${API_URL}/uploads/${img.image_url}`}
                          className="d-block w-100"
                          alt={category}
                          style={{
                            height: "250px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                          onClick={() => handleCategoryClick(category)}
                        />
                        <div className="carousel-caption d-none d-md-block">
                          <h5 className="bg-dark bg-opacity-50 p-2 rounded">
                            {category}
                          </h5>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Controls */}
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target={`#${safeId}`}
                    data-bs-slide="prev"
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target={`#${safeId}`}
                    data-bs-slide="next"
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Next</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section container mt-5">
        <h2 className="text-center">Customer Reviews</h2>
        <div className="review-list mt-3">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div
                key={index}
                className="review p-3 mb-3 shadow-sm rounded bg-light"
              >
                {review.text}
              </div>
            ))
          ) : (
            <p className="text-center">No reviews yet.</p>
          )}
        </div>

        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            axios
              .post(`${API_URL}/testimonials/addtestimonial`, {
                text: newReview,
              })
              .then((response) => {
                setReviews([...reviews, response.data]);
                setNewReview("");
              })
              .catch((error) =>
                console.error("Error submitting review:", error)
              );
          }}
        >
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

      {/* Booking Section */}
      <section className="booking-section mt-5">
        <BookingPage />
      </section>
    </>
  );
};

export default Home;