import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ProgressBar, Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = process.env.REACT_APP_API_URL;

const Register = () => {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState({ email: "", name: "", password: "", confirmPassword: "", code: "" });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [attempts, setAttempts] = useState(3);
  const [userExists, setUserExists] = useState(false);

  const navigate = useNavigate();

  /** Handle input changes */
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setFormErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  /** Validate each step */
  const validateStep = () => {
    let errors = {};
    if (step === 1) {
      if (!/^\S+@\S+\.\S+$/.test(user.email)) errors.email = "Invalid email format.";
      if (user.name.trim().length < 3) errors.name = "Name must be at least 3 characters.";
      if (userExists) errors.email = "User already exists.";
    }
    if (step === 2) {
      const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
      if (!passwordComplexity.test(user.password)) {
        errors.password = "Password must be 12+ chars, with upper, lower, number, and special char.";
      }
      if (user.password !== user.confirmPassword) errors.confirmPassword = "Passwords do not match.";
    }
    if (step === 3 && codeSent) {
      if (!/^\d{6}$/.test(user.code)) errors.code = "Code must be exactly 6 digits.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /** Step navigation */
  const nextStep = () => validateStep() && setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  /** Check if user exists */
  const checkUserExists = useCallback(async () => {
    if (!user.email || !user.name) return;
    try {
      const res = await axios.post(`${API_URL}/auth/check-user`, { email: user.email, name: user.name });
      setUserExists(res.data.exists);
    } catch {
      setUserExists(true);
    }
  }, [user.email, user.name]);

  /** Send verification code */
  const sendVerificationCode = useCallback(async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email: user.email.trim(),
        name: user.name.trim(),
        password: user.password
      });
      await axios.post(`${API_URL}/email/sendcode`, { email: user.email });
      setCodeSent(true);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  /** Verify email */
  const handleVerifyEmail = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/email/verify-email`, {
        email: user.email,
        code: user.code
      });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  /** Resend code */
  const resendCode = async () => {
    if (attempts > 0 && countdown === 0) {
      setCountdown(60);
      setAttempts((prev) => prev - 1);
      await sendVerificationCode();
    }
  };

  /** Auto check user existence */
  useEffect(() => {
    const delay = setTimeout(() => checkUserExists(), 500);
    return () => clearTimeout(delay);
  }, [user.email, user.name, checkUserExists]);

  /** Countdown timer */
  useEffect(() => {
    if (countdown > 0 && codeSent) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, codeSent]);

  return (
    <div className="d-flex align-items-center min-vh-100 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            <div className="card shadow p-4 bg-white rounded">
              <h3 className="text-center mb-4">Register</h3>
              <ProgressBar now={(step / 3) * 100} className="mb-3" />
              {error && <div className="alert alert-danger">{error}</div>}

              {step === 1 && (
                <>
                  <div className="mb-3">
                    <label>Email</label>
                    <input type="email" name="email" className="form-control" onChange={handleChange} />
                    {formErrors.email && <p className="text-danger">{formErrors.email}</p>}
                  </div>
                  <div className="mb-3">
                    <label>Name</label>
                    <input type="text" name="name" className="form-control" onChange={handleChange} />
                    {formErrors.name && <p className="text-danger">{formErrors.name}</p>}
                  </div>
                  <Button className="w-100" onClick={nextStep}>Next</Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="mb-3">
                    <label>Password</label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control pe-5"
                        onChange={handleChange}
                      />
                      <span className="position-absolute top-50 end-0 translate-middle-y me-3"
                        style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </span>
                    </div>
                    {formErrors.password && <p className="text-danger">{formErrors.password}</p>}
                  </div>
                  <div className="mb-3">
                    <label>Confirm Password</label>
                    <div className="position-relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="form-control pe-5"
                        onChange={handleChange}
                      />
                      <span className="position-absolute top-50 end-0 translate-middle-y me-3"
                        style={{ cursor: "pointer" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                      </span>
                    </div>
                    {formErrors.confirmPassword && <p className="text-danger">{formErrors.confirmPassword}</p>}
                  </div>
                  <div className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={prevStep}>Back</Button>
                    <Button onClick={sendVerificationCode} disabled={loading}>
                      {loading ? <Spinner size="sm" /> : "Next"}
                    </Button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="mb-3">
                    <label>Verification Code</label>
                    <input type="text" name="code" className="form-control" onChange={handleChange} />
                    {formErrors.code && <p className="text-danger">{formErrors.code}</p>}
                  </div>
                  <p>Code expires in 10 minutes.</p>
                  <p>Resend in: {countdown}s ({attempts} attempts left)</p>
                  {attempts > 0 && countdown === 0 && (
                    <Button onClick={resendCode}>Resend Code</Button>
                  )}
                  <div className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={prevStep}>Back</Button>
                    <Button onClick={handleVerifyEmail} disabled={loading}>
                      {loading ? <Spinner size="sm" /> : "Verify"}
                    </Button>
                  </div>
                </>
              )}

              <div className="text-center mt-3">
                Already have an account? <Link to="/login">Login here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
