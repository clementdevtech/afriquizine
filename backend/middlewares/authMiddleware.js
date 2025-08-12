const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  //console.log("Auth Header:", req.headers.authorization);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //console.log("❌ No token found in request headers");
    return res.status(401).json({ error: "Unauthorized, token missing" });
  }

  const token = authHeader.split(" ")[1];
  //console.log("Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("✅ Decoded User:", decoded); 

    req.user = decoded; 
    next();
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.message); 
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
