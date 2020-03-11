require("@babel/polyfill");
var express = require("express");
var func = require("./public/src/index");
const path = require("path");
var app = express();

var port = process.env.PORT || 8080;
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", func.loadAnalysis);

app.get("/eventcsv", (req, res) => {
  const csvFile = path.resolve(__dirname, "views", "employee.csv");
  func.loadCSV(res, csvFile);
});

app.listen(port, function() {
  console.log("api is running on http://localhost:" + port);
});
