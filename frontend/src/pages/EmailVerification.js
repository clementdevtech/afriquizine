import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL;

const EmailVerification = () => {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [verificationCountdown, setVerificationCountdown] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(null);
  const [canResend, setCanResend] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const emailFromLink = params.get("email");

    if (token && emailFromLink) {
      setEmail(decodeURIComponent(emailFromLink)); 
      setShowCodeInput(true); 
      setVerificationCountdown(600); 

      
      axios
        .get(`${API_URL}/email/verify-email?token=${token}`)
        .then((res) => {
          alert(res.data.message);
          navigate("/login");
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Verification failed.");
          setShowCodeInput(true);
        });
    } else {
      setShowCodeInput(false);
    }
  }, [location, navigate]);

  // **Verification Code Expiry Countdown**
  useEffect(() => {
    if (verificationCountdown !== null && verificationCountdown > 0) {
      const timer = setTimeout(() => setVerificationCountdown(verificationCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationCountdown]);

  // **Resend Code Countdown**
  useEffect(() => {
    if (resendCountdown !== null && resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
  }, [resendCountdown]);

  // **Handle Verification Code Input**
  const handleChange = (e) => {
    const input = e.target.value.replace(/\D/g, ""); 
    setCode(input.slice(0, 6)); 
  };

  // **Handle Manual Verification Submission**
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Verification code must be 6 digits.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/email/verify-email`, { code, email });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    }
  };

  // **Handle Sending Verification Code**
  const handleSendCode = async () => {
    if (!email) {
      setError("Please enter a valid email.");
      return;
    }

    try {
      await axios.post(`${API_URL}/email/sendcode`, { email });
      setError("");
      setShowCodeInput(true); 
      setVerificationCountdown(600);
      setResendCountdown(60); 
      setCanResend(false);
      alert("A verification code has been sent to your email.");
    } catch (err) {
      setError("Failed to send verification code. Please try again.");
    }
  };

  return (
    <div className="container mt-5 text-center">
      <h2>Email Verification</h2>
      {error && <p className="text-danger">{error}</p>}

      {/* Email Input & Send Code */}
      {!showCodeInput && (
        <div className="mb-4">
          <label>Enter your email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="form-control mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button variant="primary" onClick={handleSendCode}>
            Send Verification Email
          </Button>
        </div>
      )}

      {/* Verification Code Input */}
      {showCodeInput && (
        <form onSubmit={handleSubmit} className="mt-4">
          <label>Enter Verification Code:</label>
          <input
            type="text"
            name="code"
            className="form-control mb-3"
            value={code}
            onChange={handleChange}
            required
          />
          <p>
            {verificationCountdown > 0
              ? `Code expires in ${Math.floor(verificationCountdown / 60)}:${(verificationCountdown % 60)
                  .toString()
                  .padStart(2, "0")}`
              : "Code expired. Request a new one."}
          </p>
          <Button type="submit" variant="success" disabled={verificationCountdown <= 0}>
            Verify
          </Button>
        </form>
      )}

      {/* Resend Code Button */}
      {showCodeInput && (
        <div className="mt-3">
          <Button
            variant="secondary"
            onClick={handleSendCode}
            disabled={!canResend}
          >
            {canResend
              ? "Resend Code"
              : `Resend in ${Math.floor(resendCountdown / 60)}:${(resendCountdown % 60)
                  .toString()
                  .padStart(2, "0")}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;
