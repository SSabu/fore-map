const fs = require('fs');
const express = require("express");
const { Client } = require('pg');
const routes = require("./routes");
const path = require("path");
const https = require('https');

const privateKey = fs.readFileSync('dist/server.key', 'utf8');
const certificate = fs.readFileSync('dist/server.cert', 'utf8');

const credentials = {key: privateKey, cert: certificate};

const PORT = process.env.PORT || 1000;
const app = express();

const connectionString = "postgres://postgres:7C4dfo047wcdwrXZ1i8G@asukergis.cufrrg4evyls.us-west-1.rds.amazonaws.com:5432/foreclosure";
const client = new Client({connectionString});

global.client = client;

client.connect().then(success => console.log("connected successfully")).catch(err => console.log("error connecting to the database", err))

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "geojson")));
app.use("/", routes);

app.listen(PORT, () => console.log(`app is running on port ${PORT}`));

// const httpsServer = https.createServer(credentials, app);
// httpsServer.listen(3000, () => console.log("HTTP server listening"));
