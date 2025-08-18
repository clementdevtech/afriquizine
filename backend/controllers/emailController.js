const nodemailer = require("nodemailer");
const { db, pool} = require("../db");
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
  console.log("📩 Incoming verify request:", { email, token: !!token, code: !!code });

  if (!email || (!token && !code)) {
    console.warn("⚠️ Missing verification details.");
    return res.status(400).json({ message: "Missing verification details." });
  }

  try {
    await db.transaction(async (trx) => {
      // 1) find verification record (token or code) that hasn't expired
      let verification;
      if (token) {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        console.log("🔑 Hashed token:", hashedToken);
        verification = await trx("email_verifications")
          .where({ token: hashedToken, email })
          .andWhere("expires_at", ">", db.fn.now())
          .first();
      } else {
        console.log("🔍 Verifying via code:", code);
        verification = await trx("email_verifications")
          .where({ code, email })
          .andWhere("expires_at", ">", db.fn.now())
          .first();
      }

      if (!verification) {
        console.warn("❌ No matching verification record found");
        // nothing to commit — rollback by throwing or simply return from transaction callback
        // we return outside the transaction by throwing a controlled error
        const err = new Error("Invalid or expired token/code.");
        err.status = 400;
        throw err;
      }
      console.log("✅ Verification record found:", verification);

      // 2) fetch pending user and existing main user inside same transaction
      const pendingUser = await trx("pending_users").where({ email }).first();
      const existingUser = await trx("users").where({ email }).first();

      console.log("📂 Pending user record:", pendingUser);
      console.log("👤 Existing user record:", existingUser ? { id: existingUser.id, email: existingUser.email } : null);

      // 3) If user already exists in users table -> just mark verified (merge) & cleanup
      if (existingUser) {
  console.log("ℹ️ User already exists in users table, ensuring verified=true and syncing password if missing.");

  const insertObj = {
      email: pendingUser.email,
      username: pendingUser.username,
      password: pendingUser.password,
      verified: true,
      created_at: new Date(),
     };
  await trx("users")
     .insert(insertObj)
     .onConflict("email")
     .merge({ 
        password: pendingUser.password,
        verified: true 
     });


  // If password missing or blank in users, and we have one in pending_users, update it
  if ((!existingUser.password || existingUser.password.trim() === "") && pendingPasswordRow?.password) {
    console.log("🔄 Updating missing password from pending_users.");
    await trx("users")
      .where({ email })
      .update({
        password: pendingPasswordRow.password,
        verified: true,
      });
  } else {
    await trx("users").where({ email }).update({ verified: true });
  }

  // cleanup pending + verification rows
  await trx("pending_users").where({ email }).del();
  await trx("email_verifications").where({ email }).del();

  return res.json({ message: "Email already verified. You can log in now." });
}


      // 4) if pending user missing -> error
      if (!pendingUser) {
        console.warn("❌ No pending user found for email:", email);
        const err = new Error("Pending user not found or already verified.");
        err.status = 404;
        throw err;
      }

      // 5) make sure pendingUser has password preserved
      if (!pendingUser.password || pendingUser.password.trim() === "") {
        console.error("🚨 Pending user password missing for email:", email, pendingUser);
        const err = new Error("Pending user has no password saved.");
        err.status = 500;
        throw err;
      }

      // 6) Move pending user into users table safely (insert or merge verified flag if race)
      const insertObj = {
        email: pendingUser.email,
        username: pendingUser.username,
        password: pendingUser.password, // hashed password preserved
        verified: true,
        created_at: new Date(),
      };

      // Use ON CONFLICT ... DO UPDATE to avoid duplicate key crash if race occurs
      // (Knex's onConflict().merge(...) will update only the specified fields)
      const inserted = await trx("users")
        .insert(insertObj)
        .onConflict("email")
        .merge({ verified: true }) // if user was inserted concurrently, just ensure verified true
        .returning(["id", "email"]);

      console.log("⬆️ Inserted / merged user:", inserted);

      // 7) cleanup pending and verification records
      await trx("pending_users").where({ email }).del();
      await trx("email_verifications").where({ email }).del();

      console.log("🧹 Cleanup completed for email:", email);

      // commit will happen automatically if we reach this point (no throw). send response:
      return res.json({ message: "Email verified successfully!", redirect: "/login" });
    });
  } catch (err) {
    // If we threw a controlled error with status, use it
    if (err && err.status) {
      console.warn("Handled error in verifyEmail:", err.message);
      return res.status(err.status).json({ message: err.message });
    }

    console.error(`💥 Error verifying email: ${err.message}`, err);
    return res.status(500).json({ message: "Error verifying email." });
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
