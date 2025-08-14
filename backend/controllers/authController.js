const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {pool, db} = require("../db");
const crypto = require("crypto");
//const rateLimit = require('express-rate-limit');
const { sendVerificationEmail, sendPasswordRecoveryEmail } = require("./emailController");
require("dotenv").config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role }, 
        process.env.JWT_SECRET,
    { expiresIn: "7d" } 
  );
};

const check_user = async (req, res) => {
  try {
    let { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: "Email and username are required" });
    }

    email = email.trim().toLowerCase();
    name = name.trim();

    // Query the database for matching email OR username
    const user = await db("users")
      .where("email", email)
      .orWhere("username", name)
      .first();

    if (user) {
      // Exact matches for both
      if (user.email === email && user.username === name) {
        return res.status(409).json({ message: "Email and Username already exist" });
      }
      // Only email matches
      if (user.email === email) {
        return res.status(409).json({ message: "Email already exists" });
      }
      // Only username matches
      if (user.username === name) {
        return res.status(409).json({ message: "Username already exists" });
      }
    }

    // If no match found
    return res.json({ exists: false });

  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const register = async (req, res) => {
  try {
    let { email, name, password } = req.body;

    // ====== 1. Basic validations ======
    if (!email || !name || !password) {
      return res.status(400).json({ message: "Email, username, and password are required" });
    }
    email = email.trim().toLowerCase();
    name = name.trim();

    if (typeof password !== "string" || !password.trim()) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // ====== 2. Check if user exists ======
    const existingUser = await db("users")
      .where("email", email)
      .orWhere("username", name)
      .first();

    if (existingUser) {
      return res.status(400).json({ message: "Email or Username already exists" });
    }

    // ====== 3. Hash password ======
    console.log("Raw password to hash:", password);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!hashedPassword.startsWith("$2a$") && !hashedPassword.startsWith("$2b$")) {
      throw new Error("Password hashing failed");
    }
    console.log("Generated hash:", hashedPassword);

    // ====== 4. Insert user ======
    const [newUser] = await db("users")
      .insert({
        email,
        username: name,
        password: hashedPassword,
        verified: false,
      })
      .returning(["id", "email", "username"]);

    return res.status(201).json({
      message: "User registered successfully. Proceed to verification.",
      user: newUser,
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/*
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many login attempts from this IP, please try again later.',
});*/


//................Login route
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }
    email = email.trim().toLowerCase();

    if (typeof password !== "string" || !password.trim()) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ====== 1. Find user ======
    const user = await db("users").where("email", email).first();
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // ====== 2. Compare password ======

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password match:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // ====== 3. Create token ======
    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign(userWithoutPassword, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.error("Error in login:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};



const logout = (req, res) => {
  res.clearCookie("auth_token", { httpOnly: true, sameSite: "Strict", secure: process.env.NODE_ENV === "production" });
  res.json({ message: "Logged out successfully" });
};



const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();


  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  try {

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    const response = await sendPasswordRecoveryEmail(normalizedEmail);
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }
    res.status(200).json(response);
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const ResetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Missing token or password." });
  }

  try {
    // Hash the incoming token for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Look up reset record
    const resetRecord = await pool.query(
      "SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()",
      [hashedToken]
    );

    if (resetRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const email = resetRecord.rows[0].email;

    // Hash the new password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);

    // Delete the reset token so it can't be reused
    await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);

    res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Error resetting password:", err.message);
    res.status(500).json({ message: "Server error." });
  }
};


module.exports = { register, check_user, login, logout, forgotPassword, ResetPassword };
