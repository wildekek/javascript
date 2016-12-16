'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

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

var _abstractedXDR = function _abstractedXDR(_ref) {
  var fetchUrl = _ref.fetchUrl,
      method = _ref.method,
      endpoint = _ref.endpoint,
      callback = _ref.callback,
      body = _ref.body;

  var fetchConfig = {
    method: method,
    timeout: endpoint.timeout
  };

  console.log({ fetchUrl: fetchUrl, fetchConfig: fetchConfig });

  (0, _nodeFetch2.default)(fetchUrl, fetchConfig).then(function (response) {
    console.log('response', response);
  }).catch(function (error) {
    console.log('error', error);
  });
};

var createURL = function createURL(origin, path, queryParams) {
  var base = origin + path;

  if (queryParams && Object.keys(queryParams).length > 0) {
    base += '?' + Object.keys(queryParams).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(queryParams[k]);
    }).join('&');
  }

  return base;
};

exports.default = {
  POST: function POST(_ref2) {
    var queryParams = _ref2.queryParams,
        body = _ref2.body,
        endpoint = _ref2.endpoint,
        callback = _ref2.callback;

    var fetchUrl = createURL(endpoint.origin, endpoint.url, queryParams);
    return _abstractedXDR({ fetchUrl: fetchUrl, method: 'POST', endpoint: endpoint, callback: callback, body: body });
  },

  GET: function GET(_ref3) {
    var queryParams = _ref3.queryParams,
        endpoint = _ref3.endpoint,
        callback = _ref3.callback;

    var fetchUrl = createURL(endpoint.origin, endpoint.url, queryParams);
    return _abstractedXDR({ fetchUrl: fetchUrl, method: 'GET', endpoint: endpoint, callback: callback });
  }
};
module.exports = exports['default'];
//# sourceMappingURL=fetch.js.map
