import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Testimonials from './pages/Testimonials';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import Booking from './pages/Booking';
import EmailVerification from "./pages/EmailVerification";
import AdminPage from "./pages/AdminPage";
import Recovery from "./pages/ForgotPassword";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutUs from "./pages/AboutUs";
import ProtectedRoute from "./components/ProtectedRoute";  
import Unauthorized from "./pages/Unauthorized"; 
import ResetPassword from "./pages/ResetPassword"; 



function AppContent() {
  const location = useLocation();

  // Pages where Navbar & Footer should be hidden
  const hideLayoutOn = [
    "/register",
    "/login",
    "/email-verification",
    "/unauthorized",
    "/terms-of-service",
    "/privacy-policy",
    "/forgot-password",
    "/reset-password",
  ];

  const shouldHideLayout = hideLayoutOn.includes(location.pathname);

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<Recovery />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Admin Route */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
      {!shouldHideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;