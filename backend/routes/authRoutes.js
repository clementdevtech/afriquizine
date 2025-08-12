const express = require('express');
const router = express.Router();
const { register, check_user, login, logout, forgotPassword, ResetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/check-user', check_user);
router.post('/login', login);
router.post('/logout', logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", ResetPassword);

module.exports = router;
