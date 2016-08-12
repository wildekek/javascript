import TimeEndpoint from '../endpoints/time';
import { StatusAnnouncement } from '../flow_interfaces';

type ReconnectionManagerArgs = {
  timeEndpoint: TimeEndpoint,
  onConnectionStateChange: Function
}

export default class {

  _onConnectionStateChange: Function;
  _timeEndpoint: TimeEndpoint;
  _timeTimer: number;
  _connected: boolean;

  constructor({ timeEndpoint, onConnectionStateChange }: ReconnectionManagerArgs) {
    this._timeEndpoint = timeEndpoint;
    this._onConnectionStateChange = onConnectionStateChange;
    this._connected = true;
  }

  startPolling() {
    this._timeTimer = setInterval(this._performTimeLoop.bind(this), 6000);
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
        this._connected = false;
        this._onConnectionStateChange(this._connected);
      }
    });
  }

}
