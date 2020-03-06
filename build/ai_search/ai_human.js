"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HunmaAI = /*#__PURE__*/function () {
  function HunmaAI() {
    _classCallCheck(this, HunmaAI);

    this.url = "https://www.twinword.com/api/";
    this.rest = require("unirest");
  }

  _createClass(HunmaAI, [{
    key: "isStr",
    value: function isStr(value) {
      if (value == null || value == "") return false;
      return true;
    }
  }, {
    key: "contains",
    value: function contains(string, value) {
      return string.includes(value);
    } //Detect human text meaning using the given text.
    //Topics,  sentiment

  }, {
    key: "detectHumanAI",
    value: function detectHumanAI(url, q, cb) {
      var self = this;
      (0, _axios["default"])({
        method: 'post',
        url: url,
        data: q,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }).then(function (response) {
        if (response.error) {
          console.log("ERROR: " + response.error);
          cb(response, null);
        } else {
          var body = response.data;

          if (self.isStr(body)) {
            body = self.getJSON(body);

            if (body.result_msg == "Success") {
              return cb(response, body);
            }
          }

          cb(response, "gg");
        }
      }, function (error) {
        cb(response, "failed ");
      });
    } //Return sentiment analysis results with score for the given text.
    //get possibility of a text either positive or negative 

  }, {
    key: "getWordAISentiment",
    value: function getWordAISentiment(q, cb) {
      this.detectHumanAI(this.url + "v4/sentiment/analyze/", "text=" + q, cb);
    } //Detect and generate human like topics to the given text.

  }, {
    key: "getWordAITopic",
    value: function getWordAITopic(q, cb) {
      this.detectHumanAI(this.url + "v4/word/associations/", "entry=" + q, cb);
    } //Get word associations with semantic distance score.

  }, {
    key: "getAIWordAssociations",
    value: function getAIWordAssociations(q, cb) {
      this.detectHumanAI(this.url + "v5/topic/generate/", "text=" + q, cb);
    }
  }, {
    key: "getAll",
    value: function getAll(q, cb) {
      var self = this;
      var result = {
        "type": "all"
      };
      this.getWordAISentiment(q, function (response, sentiment) {
        self.getWordAITopic(q, function (response, topic) {
          self.getAIWordAssociations(q, function (response, associations) {
            //cb(response, topic);
            result["topic"] = topic;
            result["sentiment"] = sentiment;
            result["associations"] = associations;
            cb(response, result);
          });
        });
      });
    }
  }, {
    key: "getJSON",
    value: function getJSON(json) {
      if (!(json instanceof Object) && json.startsWith("{")) {
        try {
          return JSON.parse(json);
        } catch (e) {
          return json;
        }
      } else {
        return json;
      }
    }
  }, {
    key: "customStringify",
    value: function customStringify(v) {
      var cache = new Set();
      return JSON.stringify(v, function (key, value) {
        if (_typeof(value) === 'object' && value !== null) {
          if (cache.has(value)) {
            try {
              return JSON.parse(JSON.stringify(value));
            } catch (err) {
              return;
            }
          }

          cache.add(value);
        }

        return value;
      });
    }
  }]);

  return HunmaAI;
}();

exports["default"] = HunmaAI;