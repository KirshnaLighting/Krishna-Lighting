const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const trackViews = require("./middleware/analytic");
require("dotenv").config();
const DB = require("./database/Db");
const app = express();

// ✅ CORS middleware must come before any routes
app.use(
  cors({
    origin: "https://krishna-lighting.onrender.com", // Your frontend domain
    credentials: true, // Allow cookies and auth headers
  })
);

// Middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Custom Middleware
app.use(trackViews);

// Routes
app.use("/api/auth", require("./routes/user.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/", require("./routes/dashboardstats.routes"));

// Start server
DB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Listening to the PORT ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
