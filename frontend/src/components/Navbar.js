import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaServicestack, FaImage, FaInfoCircle, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";
import "../assets/css/Navbar.css";
import logo from "../assets/images/logo.png";

const API_URL = process.env.REACT_APP_API_URL;

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/users/getuser`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Auth Error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* Desktop / Large screen navbar */}
      <nav className="main-navbar desktop-navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <img src={logo} alt="Logo" />
            <span>Afrikuizine Delights</span>
          </Link>
          <ul className="nav-links">
            <li><Link className={location.pathname === "/" ? "active" : ""} to="/"><FaHome /> Home</Link></li>
            <li><Link to="/services"><FaServicestack /> Services</Link></li>
            <li><Link to="/gallery"><FaImage /> Gallery</Link></li>
            <li><Link to="/about-us"><FaInfoCircle /> About</Link></li>
            {loading ? (
              <li><span>Loading...</span></li>
            ) : user ? (
              <li><button className="logout-btn" onClick={handleLogout}><FaSignOutAlt /> Logout</button></li>
            ) : (
              <li><Link to="/login"><FaSignInAlt /> Login</Link></li>
            )}
          </ul>
        </div>
      </nav>

      {/* Mobile / Small screen split-navbar */}
      <nav className="split-navbar mobile-navbar">
        <div className="nav-side left-links">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}><FaHome /><span>Home</span></Link>
          <Link to="/services"><FaServicestack /><span>Services</span></Link>
        </div>

        <div className="nav-center">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Logo" className="nav-logo" />
          </Link>
        </div>

        <div className="nav-side right-links">
          <Link to="/gallery"><FaImage /><span>Gallery</span></Link>
          <Link to="/about-us"><FaInfoCircle /><span>About</span></Link>
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <button onClick={handleLogout} className="nav-btn"><FaSignOutAlt /><span>Logout</span></button>
          ) : (
            <Link to="/login"><FaSignInAlt /><span>Login</span></Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;