const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");
require("dotenv").config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/guides", require("./routes/api/guides"));
app.use("/api/vehicles", require("./routes/api/vehicles"));
app.use("/api/locations", require("./routes/api/locations"));
app.use("/api/itineraries", require("./routes/api/itineraries"));
app.use("/api/bookings", require("./routes/api/bookings"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/events", require("./routes/api/events"));
app.use("/api/comments", require("./routes/api/comments"));

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Sri Lanka Tourism Guide API" });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
