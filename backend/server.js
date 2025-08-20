require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Parse allowed origins from .env (comma-separated)
const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(',').map(url => url.trim())
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Serve static files (general public folder if needed)
app.use(express.static('public'));

// ✅ Serve uploaded files explicitly from backend/uploads
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const galleryRoutes = require('./routes/galleryRoutes');
const testimonialsRoutes = require('./routes/testimonialsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require("./routes/userRoutes");
const emailRoutes = require("./routes/emailRoutes");
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require("./routes/adminRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const menuRoutes = require("./routes/menuRoutes");
const menuCategoryRoutes = require("./routes/menuCategoryRoutes");

// Use Routes
app.use('/api/gallery', galleryRoutes);
app.use("/api/email", emailRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', availabilityRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/menu-categories", menuCategoryRoutes);

// ✅ Keep Alive Pinger (prevents Render from idling)
if (process.env.RENDER_EXTERNAL_URL) {
  setInterval(() => {
    axios
      .get(process.env.RENDER_EXTERNAL_URL + "/api/health")
      .then(() => console.log("🔄 Keep-alive ping sent"))
      .catch(err => console.error("⚠️ Keep-alive ping failed", err.message));
  }, 14 * 60 * 1000); // every 14 minutes (Render sleeps after 15m)
}

// ✅ Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is alive 🚀" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));