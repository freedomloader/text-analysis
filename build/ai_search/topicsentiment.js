"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TopicSentiment = /*#__PURE__*/function () {
  function TopicSentiment(db) {
    _classCallCheck(this, TopicSentiment);

    this.db = db;
  }

  _createClass(TopicSentiment, [{
    key: "loadSearchAI",
    value: function loadSearchAI(qs, cb) {
      var start = db.microtime(true);
      ai.loadAITopic(q, function (response, sentiment) {
        ai.loadAISentiment(q, function (response, topic) {
          var result = {
            "type": "all"
          };
          result["topic"] = topic;
          result["sentiment"] = sentiment;
          result['time_elapsed'] = db.microtime(true) - start;
        });
      });
    }
  }, {
    key: "loadAITopic",
    value: function loadAITopic(qs, cb) {
      ai.getWordAITopic(q, function (response, topic) {
        cb(response, topic);
      });
    }
  }, {
    key: "loadAISentiment",
    value: function loadAISentiment(qs, cb) {
      ai.getWordAISentiment(q, function (response, sentiment) {
        cb(response, sentiment);
      });
    }
  }]);

  return TopicSentiment;
}();

exports["default"] = TopicSentiment;