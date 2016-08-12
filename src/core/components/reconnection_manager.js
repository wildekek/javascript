import TimeEndpoint from '../endpoints/time';
import { StatusAnnouncement } from '../flow_interfaces';

type ReconnectionManagerArgs = {
  timeEndpoint: TimeEndpoint,
  onConnectionStateChange: Function
}

const SUCCESSFUL_INTERVAL = 6000;
const MAX_FAILED = 5;

export default class {

  _onConnectionStateChange: Function;
  _timeEndpoint: TimeEndpoint;
  _timeTimer: number;
  _connected: boolean;
  _failedTries: number;

  constructor({ timeEndpoint, onConnectionStateChange }: ReconnectionManagerArgs) {
    this._timeEndpoint = timeEndpoint;
    this._onConnectionStateChange = onConnectionStateChange;
    this._connected = true;
    this._failedTries = 0;
  }

  startPolling() {
    this.stopPolling();
    this._timeTimer = setTimeout(this._performTimeLoop.bind(this), this.decideInterval());
  }

  decideInterval() {
    if (this._connected) {
      return SUCCESSFUL_INTERVAL;
    } else {
      return 1000 * this._failedTries;
    }
  }

  stopPolling() {
    clearInterval(this._timeTimer);
  }

  _performTimeLoop() {
    this._timeEndpoint((status: StatusAnnouncement) => {
      if (status.error && this._connected) {
        this._connected = false;
        this._onConnectionStateChange(this._connected);
      } else if (!status.error && !this._connected) {
        this._connected = true;
        this._failedTries = 0;
        this._onConnectionStateChange(this._connected);
      }

      // if we are still not connected, bump up the unsuccessful count for exponential back-off.
      if (!this._connected) {
        this._failedTries =  this._failedTries === MAX_FAILED ? 1 : this._failedTries += 1;
      }

      this.startPolling();

    });
  }

}
