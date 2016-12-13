'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _categories = require('../../constants/categories');

var _categories2 = _interopRequireDefault(_categories);

var _flow_interfaces = require('../../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _detectErrorCategory = function _detectErrorCategory(err) {
  if (err.code === 'ENOTFOUND') return _categories2.default.PNNetworkIssuesCategory;
  if (err.status === 0 || err.hasOwnProperty('status') && typeof err.status === 'undefined') return _categories2.default.PNNetworkIssuesCategory;
  if (err.timeout) return _categories2.default.PNTimeoutCategory;

  if (err.response) {
    if (err.response.badRequest) return _categories2.default.PNBadRequestCategory;
    if (err.response.forbidden) return _categories2.default.PNAccessDeniedCategory;
  }

  return _categories2.default.PNUnknownCategory;
};

var _attachSuperagentLogger = function _attachSuperagentLogger(req) {
  var _pickLogger = function _pickLogger() {
    if (console && console.log) return console;
    if (window && window.console && window.console.log) return window.console;
    return console;
  };

  var start = new Date().getTime();
  var timestamp = new Date().toISOString();
  var logger = _pickLogger();
  logger.log('<<<<<');
  logger.log('[' + timestamp + ']', '\n', req.url, '\n', req.qs);
  logger.log('-----');

  req.on('response', function (res) {
    var now = new Date().getTime();
    var elapsed = now - start;
    var timestampDone = new Date().toISOString();

    logger.log('>>>>>>');
    logger.log('[' + timestampDone + ' / ' + elapsed + ']', '\n', req.url, '\n', req.qs, '\n', res.text);
    logger.log('-----');
  });
};

var _abstractedXDR = function _abstractedXDR(superagentConstruct, endpoint, callback) {
  if (endpoint.isDebug) {
    superagentConstruct = superagentConstruct.use(_attachSuperagentLogger);
  }

  return superagentConstruct.timeout(endpoint.timeout).end(function (err, resp) {
    var status = {};
    status.error = err !== null;
    status.operation = endpoint.operation;

    if (resp && resp.status) {
      status.statusCode = resp.status;
    }

    if (err) {
      status.errorData = err;
      status.category = _detectErrorCategory(err);
      return callback(status, null);
    }

    var parsedResponse = JSON.parse(resp.text);
    return callback(status, parsedResponse);
  });
};

exports.default = {
  POST: function POST(_ref) {
    var queryParams = _ref.queryParams,
        body = _ref.body,
        endpoint = _ref.endpoint,
        callback = _ref.callback;

    var superagentConstruct = _superagent2.default.post(endpoint.origin + endpoint.url).query(queryParams).send(body);
    return _abstractedXDR(superagentConstruct, endpoint, callback);
  },

  GET: function GET(_ref2) {
    var queryParams = _ref2.queryParams,
        endpoint = _ref2.endpoint,
        callback = _ref2.callback;

    var superagentConstruct = _superagent2.default.get(endpoint.origin + endpoint.url).query(queryParams);
    return _abstractedXDR(superagentConstruct, endpoint, callback);
  }
};
module.exports = exports['default'];
//# sourceMappingURL=superagent.js.map
