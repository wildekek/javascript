'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('./cryptography/index');

var _index2 = _interopRequireDefault(_index);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var config = _ref.config,
        crypto = _ref.crypto,
        sendBeacon = _ref.sendBeacon;

    _classCallCheck(this, _class);

    this._config = config;
    this._crypto = crypto;
    this._sendBeacon = sendBeacon;

    this._maxSubDomain = 20;
    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

    this._providedFQDN = (this._config.secure ? 'https://' : 'http://') + this._config.origin;
    this._coreParams = {};

    this.shiftStandardOrigin();
  }

  _createClass(_class, [{
    key: 'nextOrigin',
    value: function nextOrigin() {
      if (this._providedFQDN.indexOf('pubsub.') === -1) {
        return this._providedFQDN;
      }

      var newSubDomain = void 0;

      this._currentSubDomain = this._currentSubDomain + 1;

      if (this._currentSubDomain >= this._maxSubDomain) {
        this._currentSubDomain = 1;
      }

      newSubDomain = this._currentSubDomain.toString();

      return this._providedFQDN.replace('pubsub', 'ps' + newSubDomain);
    }
  }, {
    key: 'shiftStandardOrigin',
    value: function shiftStandardOrigin() {
      var failover = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      this._standardOrigin = this.nextOrigin(failover);

      return this._standardOrigin;
    }
  }, {
    key: 'getStandardOrigin',
    value: function getStandardOrigin() {
      return this._standardOrigin;
    }
  }, {
    key: 'GET',
    value: function GET(queryParams, endpoint, callback) {
      endpoint.origin = this.getStandardOrigin();
      this._config._networkTransport.GET({ queryParams: queryParams, endpoint: endpoint, callback: callback });
    }
  }, {
    key: 'POST',
    value: function POST(queryParams, body, endpoint, callback) {
      endpoint.origin = this.getStandardOrigin();
      this._config._networkTransport.POST({ queryParams: queryParams, body: body, endpoint: endpoint, callback: callback });
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=networking.js.map
