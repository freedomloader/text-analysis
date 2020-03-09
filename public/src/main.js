//import '@babel/polyfill'
//"start": "babel-watch public/src/main",

var express = require("express");
var loadAnalysis = require("./ai_search/load_analysis");
const http = require("http");

const app = express();
app.use(express.json());
require("dotenv").config();

const port = 3020;

app.get("/", loadAnalysis);
app.set("port", port);

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`App listening on PORT ${port}`);
});
