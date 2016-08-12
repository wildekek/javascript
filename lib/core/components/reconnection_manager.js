'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _time = require('../endpoints/time');

var _time2 = _interopRequireDefault(_time);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SUCCESSFUL_INTERVAL = 6000;
var MAX_FAILED = 5;

var _class = function () {
  function _class(_ref) {
    var timeEndpoint = _ref.timeEndpoint;
    var onConnectionStateChange = _ref.onConnectionStateChange;

    _classCallCheck(this, _class);

    this._timeEndpoint = timeEndpoint;
    this._onConnectionStateChange = onConnectionStateChange;
    this._connected = true;
    this._failedTries = 0;
  }

  _createClass(_class, [{
    key: 'startPolling',
    value: function startPolling() {
      this.stopPolling();
      this._timeTimer = setTimeout(this._performTimeLoop.bind(this), this.decideInterval());
    }
  }, {
    key: 'decideInterval',
    value: function decideInterval() {
      if (this._connected) {
        return SUCCESSFUL_INTERVAL;
      } else {
        return 1000 * this._failedTries;
      }
    }
  }, {
    key: 'stopPolling',
    value: function stopPolling() {
      clearInterval(this._timeTimer);
    }
  }, {
    key: '_performTimeLoop',
    value: function _performTimeLoop() {
      var _this = this;

      this._timeEndpoint(function (status) {
        if (status.error && _this._connected) {
          _this._connected = false;
          _this._onConnectionStateChange(_this._connected);
        } else if (!status.error && !_this._connected) {
          _this._connected = true;
          _this._failedTries = 0;
          _this._onConnectionStateChange(_this._connected);
        }

        if (!_this._connected) {
          _this._failedTries = _this._failedTries === MAX_FAILED ? 1 : _this._failedTries += 1;
        }

        _this.startPolling();
      });
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=reconnection_manager.js.map
