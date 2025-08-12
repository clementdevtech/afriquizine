const express = require("express");
const router = express.Router();
const { getUser } = require("../controllers/userController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/getuser", verifyToken, getUser);

module.exports = router;
