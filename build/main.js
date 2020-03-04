"use strict";

require("@babel/polyfill");

var _express = _interopRequireDefault(require("express"));

var _ai_human = _interopRequireDefault(require("./ai_search/ai_human"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
app.use(_express["default"].json());

require('dotenv').config();

var port = 3020;
app.get('/', function (req, res) {
  if (!req.params.text) {
    var noresult = {
      'type': 'No Request',
      'count': '0'
    };
    return res.status(400).send(noresult);
  }

  var ai = new _ai_human["default"]();
  ai.getAll(req.params.text, function (response, result) {
    if (result) {
      return res.status(200).send(result);
    }

    var noresult = {
      'type': 'No Request',
      'count': '0'
    };
    return res.status(400).send(noresult);
  });
});
app.set('port', port);
var server = http.createServer(app);
server.listen(port, function () {
  console.log("App listening on PORT ".concat(port));
});