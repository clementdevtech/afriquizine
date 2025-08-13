import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../assets/css/style.css";

const API_URL = process.env.REACT_APP_API_URL;

const Gallery = () => {
  const { category } = useParams(); // Get selected category from URL
  const [groupedImages, setGroupedImages] = useState({});
  const [filteredImages, setFilteredImages] = useState([]);
  const [currentIndexes, setCurrentIndexes] = useState({});
  const [fullScreenImage, setFullScreenImage] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/gallery/getimages`)
      .then((response) => response.json())
      .then((data) => {
        const imagesByCategory = data.reduce((acc, image) => {
          if (!acc[image.category]) {
            acc[image.category] = [];
          }
          acc[image.category].push(image);
          return acc;
        }, {});

        setGroupedImages(imagesByCategory);

        // If a category is selected, show only that category
        if (category && imagesByCategory[category]) {
          setFilteredImages(imagesByCategory[category]);
        } else {
          setFilteredImages([]);
          setCurrentIndexes(
            Object.keys(imagesByCategory).reduce((acc, cat) => {
              acc[cat] = 0;
              return acc;
            }, {})
          );
        }
      })
      .catch((error) => console.error("Error fetching gallery:", error));
  }, [category]);

  useEffect(() => {
    if (!category) {
      const interval = setInterval(() => {
        setCurrentIndexes((prevIndexes) => {
          const newIndexes = { ...prevIndexes };
          Object.keys(groupedImages).forEach((cat) => {
            if (groupedImages[cat]?.length > 0) {
              newIndexes[cat] = (prevIndexes[cat] + 1) % groupedImages[cat].length;
            }
          });
          return newIndexes;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [groupedImages, category]);

  return (
    <div className="container mt-4">
      <h2 className="text-center">{category ? `${category} Gallery` : "Gallery"}</h2>

      <div className="gallery-container">
        {category ? (
          filteredImages.length > 0 ? (
            filteredImages.map((img) => (
              <div key={img.id} className="gallery-item text-center">
                <img
                  src={`/uploads/${img.image_url}`}
                  alt={`Gallery ${img.id}`}
                  className="img-fluid rounded shadow fade-in"
                  onClick={() => setFullScreenImage(img.image_url)}
                  onError={(e) => console.error("Image Load Error:", e.target.src)} // Debugging
                />
              </div>
            ))
          ) : (
            <p className="text-center">No images found for this category.</p>
          )
        ) : (
          Object.keys(groupedImages).map((cat) => {
            if (!groupedImages[cat] || groupedImages[cat].length === 0) return null;
            const currentImage = groupedImages[cat][currentIndexes[cat]];
            return (
              <div key={cat} className="gallery-item text-center">
                <img
                  src={`/uploads/${currentImage.image_url}`} 
                  alt={cat}
                  className="img-fluid rounded shadow fade-in"
                  style={{ cursor: "pointer" }}
                  onClick={() => setFullScreenImage(currentImage.image_url)}
                />
                <div className="description mt-2">
                  <p className="text-primary">{cat}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full-Screen Image Viewer */}
      {fullScreenImage && (
        <div className="fullscreen-overlay" onClick={() => setFullScreenImage(null)}>
          <img src={`/uploads/${fullScreenImage}`} alt="Full View" className="fullscreen-image" />
        </div>
      )}
    </div>
  );
};

export default Gallery;
