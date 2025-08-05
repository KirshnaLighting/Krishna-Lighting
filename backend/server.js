require("dotenv").config();
const express = require("express");
const cors = require("cors");
const DB = require("./database/Db");
const app = express();
const cookieParser = require("cookie-parser");
const trackViews = require('./middleware/analytic');

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import Routes
const ProductRouter = require("./routes/product.routes");
const authRoutes = require('./routes/user.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const dashboardRoutes = require('./routes/dashboardstats.routes');

// Route middlewares
app.use(trackViews);
app.use('/api/auth', authRoutes);
app.use("/api/products", ProductRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/", dashboardRoutes);

DB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Listening to the PORT ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
