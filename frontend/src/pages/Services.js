import React, { useState, useEffect } from "react";
import { FaUtensils, FaBirthdayCake, FaTruck, FaStore } from "react-icons/fa";
import { GiCookingPot, GiBabyBottle } from "react-icons/gi";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const WHATSAPP_NUMBER = "+254704064441"; // Change to your main ordering WhatsApp number

const Services = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [orderOptions, setOrderOptions] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/menu`)
      .then((res) => {
        setMenuItems(res.data);
        const uniqueCategories = [
          ...new Set(res.data.map((item) => item.category)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => console.error("Error fetching menu:", err));
  }, []);

  const handleOptionChange = (id, option) => {
    setOrderOptions((prev) => ({ ...prev, [id]: option }));
  };

  const handleOrderNow = (item) => {
    const option = orderOptions[item.id] || "Pickup";
    const message =
      `Hello Afriquize Delights, I would like to order:\n\n` +
      `*${item.name}*\n` +
      `Option: ${option}\n` +
      `Price: $${item.price}\n\n` +
      `Please confirm availability.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`,
      "_blank"
    );
  };

  return (
    <section className="container my-5">
      <h2 className="text-center mb-4">Our Services</h2>
      <p className="text-center mb-5">
        <strong>Afriquize Delights</strong> proudly serves{" "}
        <strong>Adelaide, Australia</strong> and <strong>Nairobi, Kenya</strong>
        , offering top-quality catering for weddings, pre-weddings, baby
        showers, funerals, birthdays, engagement parties, staff events, and
        casual gatherings.
      </p>

      {/* SERVICES GRID */}
      <div className="row g-4 text-center mb-5">
        <div className="col-md-3">
          <div className="card p-4 shadow-sm h-100">
            <GiCookingPot size={40} className="text-primary mb-3" />
            <h5>Catering Equipment Hire</h5>
            <p>
              Commercial cooking pots, chafing dishes, bain-maries, drink urns &
              more.
            </p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-4 shadow-sm h-100">
            <FaUtensils size={40} className="text-danger mb-3" />
            <h5>Weddings & Pre-Weddings</h5>
            <p>Custom menus with elegant presentation to suit your big day.</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-4 shadow-sm h-100">
            <GiBabyBottle size={40} className="text-warning mb-3" />
            <h5>Baby Showers</h5>
            <p>Delightful food and décor to welcome your little one.</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-4 shadow-sm h-100">
            <FaBirthdayCake size={40} className="text-pink mb-3" />
            <h5>Birthday Parties</h5>
            <p>Fun, flavorful catering tailored to your celebration theme.</p>
          </div>
        </div>
      </div>

      {/* MENU SECTION */}
      <h3 className="text-center mt-5 mb-4">Our Menu</h3>
      {categories.map((category) => (
        <div key={category} className="mb-5">
          <h4 className="mb-3">{category}</h4>
          <div className="row g-4">
            {menuItems
              .filter((item) => item.category === category)
              .map((item) => (
                <div className="col-md-4" key={item.id}>
                  <div className="card shadow-sm h-100">
                    {item.image && (
                      <img
                        src={`${API_URL}/uploads/${item.image}`}
                        className="card-img-top"
                        alt={item.name}
                        style={{ height: "200px", objectFit: "cover" }}
                        onError={(e) =>
                          console.error("Image failed:", e.target.src)
                        }
                      />
                    )}
                    <div className="card-body">
                      <h5>{item.name}</h5>
                      <p className="text-muted">{item.description}</p>
                      <h6 className="text-success">
                        ${item.price.toFixed(2)}
                      </h6>

                      <div className="mt-3">
                        <label className="me-3">
                          <input
                            type="radio"
                            name={`option-${item.id}`}
                            value="Pickup"
                            onChange={() =>
                              handleOptionChange(item.id, "Pickup")
                            }
                            checked={orderOptions[item.id] === "Pickup"}
                          />{" "}
                          <FaStore className="text-primary" /> Pickup
                        </label>

                        <label>
                          <input
                            type="radio"
                            name={`option-${item.id}`}
                            value="Delivery"
                            onChange={() =>
                              handleOptionChange(item.id, "Delivery")
                            }
                            checked={orderOptions[item.id] === "Delivery"}
                          />{" "}
                          <FaTruck className="text-warning" /> Delivery
                        </label>
                      </div>

                      <button
                        className="btn btn-outline-primary btn-sm mt-3 w-100"
                        onClick={() => handleOrderNow(item)}
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default Services;