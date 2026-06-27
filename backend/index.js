
// index.js
require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const apiRouter = require("./api");
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    "http://localhost:8081",
    "http://10.162.147.147:8081",
    "https://community-app-ccmd.onrender.com",
    "https://community-app-v10.vercel.app",
  ],
  credentials: true,
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server awake" });
});

app.use("/api", apiRouter);

app.listen(PORT, () => console.log(`Server running on ${PORT}`));