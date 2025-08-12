const express = require("express");
const { verifyEmail, sendAdminEmail, sendVerificationEmail } = require("../controllers/emailController");

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post('/sendcode', sendVerificationEmail);
router.post("/admin-email", sendAdminEmail);

module.exports = router;
