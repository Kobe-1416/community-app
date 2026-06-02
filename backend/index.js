// index.js
require("dotenv").config();
const express = require("express");
const app = express();
const apiRouter = require("./api");

const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use("/api", apiRouter);
app.get("/health", (req, res) => {
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
