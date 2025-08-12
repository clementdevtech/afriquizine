import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaServicestack,
  FaImage,
  FaInfoCircle,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserShield
} from "react-icons/fa";
import "../assets/css/Navbar.css";
import logo from "../assets/images/logo.png";

const API_URL = process.env.REACT_APP_API_URL;

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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
      localStorage.removeItem("token");
      setUser(null);
      navigate("/"); // Redirect home after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="main-navbar desktop-navbar">
        <div className="nav-container">
          {/* Left Side */}
          <div className="nav-side nav-left">
            <Link to="/" className="nav-logo">
              <img src={logo} alt="Logo" />
              <span>Afrikuizine Delights</span>
            </Link>
            <ul className="nav-links">
              <li><Link className={location.pathname === "/" ? "active" : ""} to="/"><FaHome /> Home</Link></li>
              <li><Link to="/services"><FaServicestack /> Services</Link></li>
              <li><Link to="/gallery"><FaImage /> Gallery</Link></li>
              <li><Link to="/about-us"><FaInfoCircle /> About</Link></li>
              {!loading && user?.role === "admin" && (
                <li><Link to="/admin"><FaUserShield /> Admin</Link></li>
              )}
            </ul>
          </div>

          {/* Right Side */}
          <div className="nav-side nav-right">
            {loading ? (
              <span>Loading...</span>
            ) : user ? (
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            ) : (
              <Link to="/login" state={{ from: location }}>
                <FaSignInAlt /> Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="split-navbar mobile-navbar">
        <div className="nav-side left-links">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}><FaHome /><span>Home</span></Link>
          <Link to="/services"><FaServicestack /><span>Services</span></Link>
          <Link to="/gallery"><FaImage /><span>Gallery</span></Link>
        </div>

        <div className="nav-center">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Logo" className="nav-logo" />
          </Link>
        </div>

        <div className="nav-side right-links">
          <Link to="/about-us"><FaInfoCircle /><span>About</span></Link>
          {!loading && user?.role === "admin" && (
            <Link to="/admin"><FaUserShield /><span>Admin</span></Link>
          )}
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <button onClick={handleLogout} className="nav-btn">
              <FaSignOutAlt /><span>Logout</span>
            </button>
          ) : (
            <Link to="/login" state={{ from: location }}>
              <FaSignInAlt /><span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;