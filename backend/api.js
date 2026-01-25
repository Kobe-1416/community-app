
const express = require("express");
const router = express.Router();

const authRouter = require("./auth"); // your auth.js
const visitorsRouter = require("./visitors");
const gateCodesRouter = require("./gateCodes");
const announcementsRouter = require("./announcements");
const dashboardRouter = require("./dashboard");

router.use("/auth", authRouter);
router.use("/visitors", visitorsRouter);
router.use("/gate-codes", gateCodesRouter);
router.use("/announcements", announcementsRouter);
router.use("/", dashboardRouter);

module.exports = router;