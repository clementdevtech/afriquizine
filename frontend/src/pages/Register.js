import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ProgressBar, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";


const API_URL = process.env.REACT_APP_API_URL;

const Register = () => {
  const [user, setUser] = useState({ email: "", name: "", password: "", confirmPassword: "", code: "" });
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [attempts, setAttempts] = useState(5);
  const [formErrors, setFormErrors] = useState({});
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const validateStep = () => {
    let errors = {};
    if (step === 1) {
      if (!user.email.match(/^\S+@\S+\.\S+$/)) errors.email = "Invalid email format";
      if (user.name.trim().length < 3) errors.name = "Username must be at least 3 characters";
      if (userExists) errors.email = "User already exists. Please login or use a different email.";
    }
    if (step === 2) {
      if (user.password.length < 8) errors.password = "Password must be at least 8 characters";
      const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=|,.<>/?]).{12,}$/;
      if (!passwordComplexity.test(user.password))
        errors.password = "Password must include uppercase, lowercase, number, and special character.";
      if (user.password !== user.confirmPassword) errors.confirmPassword = "Passwords do not match";
    }
    if (step === 3 && codeSent) {
      if (!user.code.match(/^\d{6}$/)) errors.code = "Verification code must be 6 digits";
    }
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      if (step === 2 && !codeSent) sendVerificationCode();
      return true;
    }
    return false;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const checkUserExists = useCallback(async () => {
    if (!user.email || !user.name) return;
    try {
      const res = await axios.post(`${API_URL}/auth/check-user`, {
        email: user.email,
        name: user.name,
      });
      setUserExists(res.data.exists);
      setError(res.data.exists ? "User already exists. Please login or use a different email." : "");
    } catch {
      setUserExists(true);
    }
  }, [user.email, user.name]);

  const sendVerificationCode = useCallback(async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/email/sendcode`, { email: user.email });
      setCodeSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code");
    }
    setLoading(false);
  }, [user.email]);

  const handleVerifyEmail = async () => {
    try {
      const res = await axios.post(`${API_URL}/email/verify-email`, {
        email: user.email,
        code: user.code,
      });
      alert(res.data.message);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      try {
        const res = await axios.post(`${API_URL}/auth/register`, user);
        alert(res.data.message);
        navigate("/email-verification");
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed");
      }
    }
  };

  const resendCode = () => {
    if (attempts > 0 && countdown === 0) {
      setCountdown(60);
      setAttempts(attempts - 1);
      sendVerificationCode();
    }
  };

  useEffect(() => {
    const delayCheck = setTimeout(() => {
      if (user.email || user.name) checkUserExists();
    }, 500);
    return () => clearTimeout(delayCheck);
  }, [user.email, user.name, checkUserExists]);

  useEffect(() => {
    if (countdown > 0 && codeSent) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, codeSent]);

  return (
    <div
      className="d-flex align-items-center min-vh-100"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            <div className="card shadow p-4 bg-white rounded">
              <h3 className="text-center mb-4">Register</h3>
              <ProgressBar now={(step / 3) * 100} className="mb-3" />
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <>
                    <div className="mb-3">
                      <label>Email</label>
                      <input type="email" name="email" className="form-control" onChange={handleChange} required />
                      {formErrors.email && <p className="text-danger">{formErrors.email}</p>}
                    </div>
                    <div className="mb-3">
                      <label>Username</label>
                      <input type="text" name="name" className="form-control" onChange={handleChange} required />
                      {formErrors.name && <p className="text-danger">{formErrors.name}</p>}
                    </div>
                    <Button onClick={nextStep} className="w-100">Next</Button>
                  </>
                )}

                {step === 2 && (
  <>
    {/* Password */}
    <div className="mb-3">
      <label>Password</label>
      <div className="position-relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          className="form-control pe-5"
          onChange={handleChange}
          required
        />
        <span
          className="position-absolute top-50 end-0 translate-middle-y me-3"
          style={{ cursor: "pointer", color: "#6c757d" }}
          onClick={togglePassword}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </span>
      </div>
      {formErrors.password && <p className="text-danger">{formErrors.password}</p>}
    </div>

    {/* Confirm Password */}
    <div className="mb-3">
      <label>Confirm Password</label>
      <div className="position-relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          className="form-control pe-5"
          onChange={handleChange}
          required
        />
        <span
          className="position-absolute top-50 end-0 translate-middle-y me-3"
          style={{ cursor: "pointer", color: "#6c757d" }}
          onClick={toggleConfirmPassword}
        >
          <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
        </span>
      </div>
      {formErrors.confirmPassword && <p className="text-danger">{formErrors.confirmPassword}</p>}
    </div>

    {/* Navigation Buttons */}
    <div className="d-flex justify-content-between">
      <Button onClick={prevStep}>Back</Button>
      <Button onClick={nextStep}>Next</Button>
    </div>
  </>
)}


                {step === 3 && (
                  <>
                    {loading ? (
                      <p>Sending verification code...</p>
                    ) : codeSent ? (
                      <>
                        <div className="mb-3">
                          <label>Enter Verification Code</label>
                          <input
                            type="text"
                            name="code"
                            className="form-control"
                            onChange={(e) => setUser({ ...user, code: e.target.value })}
                            required
                          />
                          {error && <p className="text-danger">{error}</p>}
                        </div>
                        <p>Code expires in 10 minutes</p>
                        <p>Resend code in: {countdown} seconds</p>
                        {attempts > 0 && countdown === 0 && (
                          <Button onClick={resendCode}>Resend Code ({attempts} attempts left)</Button>
                        )}
                        <div className="d-flex justify-content-between mt-3">
                          <Button onClick={prevStep}>Back</Button>
                          <Button type="submit" onClick={handleVerifyEmail}>
                            Verify
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p>Waiting for verification code...</p>
                    )}
                  </>
                )}
              </form>
              <div className="text-center mt-3">
                Already have an account?{" "}
                <Link to="/login" className="text-decoration-none">
                  Login here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
