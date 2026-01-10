const express = require("express");
const app = express();
const authRouter = require("./auth"); // your auth.js

app.use(express.json());        // to parse JSON body
app.use("/auth1", authRouter); // mount your auth routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
