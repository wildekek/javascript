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

var _class = function () {
  function _class(_ref) {
    var timeEndpoint = _ref.timeEndpoint;
    var onConnectionStateChange = _ref.onConnectionStateChange;

    _classCallCheck(this, _class);

    this._timeEndpoint = timeEndpoint;
    this._onConnectionStateChange = onConnectionStateChange;
    this._connected = true;
  }

  _createClass(_class, [{
    key: 'startPolling',
    value: function startPolling() {
      this._timeTimer = setInterval(this._performTimeLoop.bind(this), 6000);
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
          _this._connected = false;
          _this._onConnectionStateChange(_this._connected);
        }
      });
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=reconnection_manager.js.map
