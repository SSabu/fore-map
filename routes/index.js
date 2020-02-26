const express = require("express");
const { getClosures } = require("../controllers/controller.js")

const app = express();

app.get("/closures", getClosures);

module.exports = app;
