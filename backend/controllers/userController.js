const jwt = require("jsonwebtoken");

const getUser = (req, res) => {
  //console.log("Auth Header:", req.headers.authorization); 

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  const token = authHeader.split(" ")[1]; 
  //console.log("Extracted Token:", token); 

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("✅ Decoded User:", user); 
    res.status(200).json(user);
  } catch (error) {
    //console.error("❌ JWT Verification Error:", error.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = { getUser };
