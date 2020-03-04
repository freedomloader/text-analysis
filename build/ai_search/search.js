"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ = require("..");

var Request = _interopRequireWildcard(require("../ai"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var search = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var result, q, qs;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            result = false;
            _context.prev = 1;
            q = req.query.q.trim().toLowerCase();
            qs = q;
            result = (qs = _.func.isSearchApp(qs)) ? Request.getapp(req, res, qs) : false;
            result = isfalse(result) && (qs = _.func.isSearchQuiz(q)) ? Request.question(req, res, qs) : result;
            result = isfalse(result) && (qs = _.func.isSearchJokes(q)) ? Request.joke(req, res, qs) : result;
            result = isfalse(result) && (qs = _.mfunc.isSearchMusic(q)) ? Request.music(req, res, qs) : result;
            result = isfalse(result) && (qs = _.mfunc.isSearchMovie(q)) ? Request.music(req, res, qs) : result;
            result = isfalse(result) ? getAnalysisFunctions(req, res, q) : null;
            _context.next = 16;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](1);

            if (result) {
              _context.next = 16;
              break;
            }

            return _context.abrupt("return", res.status(500).send(_context.t0.stack));

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 12]]);
  }));

  return function search(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function getAnalysisFunctions(req, res, q) {
  var isSearchAITopic = null; //ai.getAnalysisFunction(qs);

  return _.func.isStr(isSearchAITopic) ? _.ai.loadSearchAITopic(q, null) : Request.wiki(req, res, q);
}

function isfalse(value) {
  return value == false;
}

var _default = search;
exports["default"] = _default;