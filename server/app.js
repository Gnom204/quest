const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["http://109.196.102.188", "http://localhost:5173"],
    credentials: true,
  }),
);
// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/quests", require("./routes/quest"));
app.use("/api/users", require("./routes/user"));
app.use("/api/bookings", require("./routes/booking"));
app.use("/api/requests", require("./routes/request"));
app.use("/api/comments", require("./routes/comment"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
