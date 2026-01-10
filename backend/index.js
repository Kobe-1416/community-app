const express = require("express");
const app = express();
const authRouter = require("./auth"); // your auth.js

app.use(express.json());        // to parse JSON body
app.use("/auth", authRouter); // mount your auth routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend running on port ${PORT}`));
