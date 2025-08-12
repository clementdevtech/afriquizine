const nodemailer = require("nodemailer");
const { pool } = require("../db");
const crypto = require("crypto");
require("dotenv").config();

// Environment variables
const CLIENT_URL = process.env.CLIENT_URL;
const COMPANY_NAME = process.env.COMPANY_NAME || "Afriquize Delights";
const COMPANY_LOGO = process.env.COMPANY_LOGO || "";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;

// Email transporter (supports Gmail App Password or other services)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password for Gmail
  },
});

// Reusable send email function
const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `${COMPANY_NAME} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`✅ Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    return { error: "Email sending failed" };
  }
};

// Admin: Send custom email
const sendAdminEmail = async (req, res) => {
  const { email, subject, message } = req.body;
  if (!email || !subject || !message) {
    return res.status(400).json({ message: "Missing email, subject, or message." });
  }

  const template = `
    <div style="background:#f8f9fa;padding:20px;text-align:center;">
      <h2>Message from ${COMPANY_NAME}</h2>
      <p>${message}</p>
      <hr>
      <p>Need help? Email us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
    </div>
  `;

  const result = await sendEmail(email, subject, template);
  if (result.error) {
    return res.status(500).json({ message: result.error });
  }
  res.json({ message: "Admin message sent successfully!" });
};

// Notify user when booking status changes
const respondToBooking = async (req, res) => {
  const { id, status, email, message } = req.body;
  try {
    await pool.query("UPDATE bookings SET status = $1 WHERE id = $2", [status, id]);
    const emailContent = `
      <p>Hello,</p>
      <p>Your booking status is now: <strong>${status}</strong></p>
      <blockquote>${message || "No additional message provided."}</blockquote>
    `;
    await sendEmail(email, `Booking Update: ${status}`, emailContent);
    res.json({ message: "Booking update sent!" });
  } catch (err) {
    console.error("Error responding to booking:", err.message);
    res.status(500).json({ message: "Error updating booking" });
  }
};

// Send verification email
const sendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (email, username, password, verified) VALUES ($1, $2, $3, false)`,
        [email, email.split("@")[0], ""]
      );
    }

    const verificationToken = crypto.randomUUID();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    await pool.query(
      `INSERT INTO email_verifications (email, token, code, expires_at) 
       VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')
       ON CONFLICT (email) 
       DO UPDATE SET token=$2, code=$3, expires_at=NOW() + INTERVAL '10 minutes'`,
      [email, hashedToken, verificationCode]
    );

    const verificationLink = `${CLIENT_URL}/email-verification?token=${verificationToken}&email=${email}`;
    const emailTemplate = `
      <div style="background:#f8f9fa;padding:20px;text-align:center;">
        <img src="${COMPANY_LOGO}" alt="${COMPANY_NAME}" style="max-width:150px;">
        <h2>Verify Your Email</h2>
        <p>Click the button below or use the code <strong>${verificationCode}</strong>.</p>
        <a href="${verificationLink}" style="background:#007bff;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Verify Email</a>
        <p>This link and code expire in 10 minutes.</p>
      </div>
    `;

    await sendEmail(email, "Email Verification", emailTemplate);
    res.json({ message: "Verification link & code sent to email." });
  } catch (error) {
    console.error(`Error sending verification email: ${error.message}`);
    res.status(500).json({ message: "Error sending verification email." });
  }
};

// Verify email with token or code
const verifyEmail = async (req, res) => {
  const { token, email, code } = req.body;
  if (!email || (!token && !code)) {
    return res.status(400).json({ message: "Missing verification details." });
  }

  try {
    let query = "";
    let param = "";
    if (token) {
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      query = "SELECT * FROM email_verifications WHERE token=$1 AND email=$2 AND expires_at > NOW()";
      param = hashedToken;
    } else {
      query = "SELECT * FROM email_verifications WHERE code=$1 AND email=$2 AND expires_at > NOW()";
      param = code;
    }

    const result = await pool.query(query, [param, email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token/code." });
    }

    await pool.query("UPDATE users SET verified=true WHERE email=$1", [email]);
    await pool.query("DELETE FROM email_verifications WHERE email=$1", [email]);

    res.json({ message: "Email verified successfully!", redirect: "/login" });
  } catch (err) {
    console.error(`Error verifying email: ${err.message}`);
    res.status(500).json({ message: "Error verifying email." });
  }
};

// Send password reset email
const sendPasswordRecoveryEmail = async (email) => {
  if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
    return { error: "Invalid email format." };
  }

  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) {
      return { error: "User not found." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await pool.query(
      `INSERT INTO password_resets (email, token, expires_at) 
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
       ON CONFLICT (email) 
       DO UPDATE SET token=$2, expires_at=NOW() + INTERVAL '10 minutes'`,
      [email, hashedToken]
    );

    const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;
    const emailContent = `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="background:#007bff;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    return await sendEmail(email, "Password Reset Request", emailContent);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { error: "Error sending password reset email." };
  }
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  verifyEmail,
  sendPasswordRecoveryEmail,
  sendAdminEmail,
  respondToBooking,
};
