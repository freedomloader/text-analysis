//import '@babel/polyfill'
//"start": "babel-watch public/src/main",

var express = require("express");
var loadAnalysis = require("./public/src/index");
const http = require("http");

var app = express();
app.use(express.json());
require("dotenv").config();

var port = process.env.PORT || 8080;

app.get("/", loadAnalysis);
app.set("port", port);

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`App listening on PORT ${port}`);
});
