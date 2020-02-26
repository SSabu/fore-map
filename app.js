const express = require("express");
const { Client } = require('pg');
const routes = require("./routes");
const path = require("path");

const PORT = process.env.PORT || 5000;
const app = express();

const connectionString = "postgres://postgres:Spi9dlee6@localhost:5432/foreclosure_trial";
const client = new Client({connectionString});

global.client = client;

client.connect().then(success => console.log("connected successfully")).catch(err => console.log("error connecting to the database", err))

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "geojson")));
app.use("/", routes);

app.listen(PORT, () => console.log(`app is running on port ${PORT}`));
