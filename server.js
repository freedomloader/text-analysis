//import '@babel/polyfill'
//"start": "babel-watch public/src/main",
var express = require('express');
var loadAnalysis = require("./public/src/index");
var app = express();

var port = process.env.PORT || 8080;
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', loadAnalysis);

app.listen(port, function() {
	console.log('api is running on http://localhost:' + port);
});