const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const userrouter = require("./routes/Userroutes");
const categoryrouter = require("./routes/Categoryroutes");
const productrouter = require("./routes/Productroutes");
const Bagroutes = require("./routes/Bagroutes");
const Wishlistroutes = require("./routes/Wishlistroutes");
const OrderRoutes = require("./routes/OrderRoutes");
const RecommendationRoutes = require("./routes/RecommendationRoutes");
const TransactionRoutes = require("./routes/TransactionRoutes");
const NotificationRoutes = require("./routes/NotificationRoutes");
const CartReminderRoutes = require("./routes/CartReminderRoutes");
const PaymentMethodRoutes = require("./routes/PaymentMethodRoutes");
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', 
  credentials: true, 
}));
app.get("/", (req, res) => {
  res.send("✅ Myntra backend in working");
});
app.use("/user", userrouter);
app.use("/category", categoryrouter);
app.use("/product", productrouter);
app.use("/bag", Bagroutes);
app.use("/wishlist", Wishlistroutes);
app.use("/Order", OrderRoutes);
app.use("/recommendation", RecommendationRoutes);
app.use("/transaction", TransactionRoutes);
app.use("/notification", NotificationRoutes);
app.use("/cart-reminder", CartReminderRoutes);
app.use("/payment-methods", PaymentMethodRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((err) => console.log(err));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));