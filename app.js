require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,
  })
);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Telegram Clone Server is running!",
    status: "OK",
    endpoints: {
      auth: "/api/auth/login, /api/auth/verify",
      user: "/api/user/contacts",
    },
  });
});

app.use("/api", require("./routes/index"));

const PORT = process.env.PORT || 6000;

app.listen(PORT, () =>
  console.log(`Server is running on port http://localhost:${PORT}`)
);
