import { StatusAnnouncement, ReconnectionManagerArgs } from '../interfaces';


export default class {
  _reconnectionCallback: Function;
  _timeEndpoint: any;
  _timeTimer: number;

  constructor({ timeEndpoint }: ReconnectionManagerArgs) {
    this._timeEndpoint = timeEndpoint;
  }

  onReconnection(reconnectionCallback: Function) {
    this._reconnectionCallback = reconnectionCallback;
  }

  startPolling() {
    this._timeTimer = setInterval(this.performTimeLoop.bind(this), 3000);
  }

  stopPolling() {
    clearInterval(this._timeTimer);
  }

  private performTimeLoop() {
    this._timeEndpoint((status: StatusAnnouncement) => {
      if (!status.error) {
        clearInterval(this._timeTimer);
        this._reconnectionCallback();
      }
    });
  }

}
