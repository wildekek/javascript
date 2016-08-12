import TimeEndpoint from '../endpoints/time';
import Config from '../components/config';

import { StatusAnnouncement } from '../flow_interfaces';

type ReconnectionManagerArgs = {
  timeEndpoint: TimeEndpoint,
  onReconnection: Function,
  onDisconnection: Function,
  config: Config
}

const SUCCESSFUL_INTERVAL = 6000;
const MAX_FAILED_BACKOFF = 5;

export default class {
  _config: Config;
  _timeEndpoint: TimeEndpoint;

  _timeTimer: number;
  _connected: boolean;
  _failedTries: number;

  _onReconnection: Function;
  _onDisconnection: Function;

  constructor({ timeEndpoint, onReconnection, onDisconnection, config }: ReconnectionManagerArgs) {
    this._timeEndpoint = timeEndpoint;
    this._config = config;

    this._connected = true;
    this._failedTries = 0;

    this._onReconnection = onReconnection;
    this._onDisconnection = onDisconnection;
  }

  startPolling() {
    this.stopPolling();

    if (!this._connected || this._config.periodicalConnectivityCheck) {
      this._timeTimer = setTimeout(this._performTimeLoop.bind(this), this.decideInterval());
    }
  }

  decideInterval() {
    if (this._connected) {
      return SUCCESSFUL_INTERVAL;
    } else {
      return 1000 * this._failedTries;
    }
  }

  stopPolling() {
    clearTimeout(this._timeTimer);
  }

  _performTimeLoop() {
    this._timeEndpoint((status: StatusAnnouncement) => {
      if (status.error && this._connected) {
        this._connected = false;
        this._onDisconnection();
      } else if (!status.error && !this._connected) {
        this._connected = true;
        this._failedTries = 0;
        this._onReconnection();
      }

      // if we are still not connected, bump up the unsuccessful count for exponential back-off.
      if (!this._connected) {
        this._failedTries = this._failedTries === MAX_FAILED_BACKOFF ? 1 : this._failedTries += 1;
      }

      this.startPolling();
    });
  }

  signalNetworkReconnected() {
    this._connected = true;
    this._onReconnection();
    this.startPolling();
  }

  signalNetworkDisconnected() {
    this._connected = false;
    this._onDisconnection();
    this.startPolling();
  }

}
