

import Crypto from './cryptography/index';
import Config from './config';

type NetworkingModules = {
  crypto: Crypto,
  config: Config,
  sendBeacon: Function
}

export default class {
  _sendBeacon: Function;

  _config: Config;
  _crypto: Crypto;

  _maxSubDomain: number;
  _currentSubDomain: number;

  _standardOrigin: string;
  _subscribeOrigin: string;

  _providedFQDN: string;

  _requestTimeout: number;

  _coreParams: Object; /* items that must be passed with each request. */

  constructor({ config, crypto, sendBeacon }: NetworkingModules) {
    this._config = config;
    this._crypto = crypto;
    this._sendBeacon = sendBeacon;

    this._maxSubDomain = 20;
    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

    this._providedFQDN = (this._config.secure ? 'https://' : 'http://') + this._config.origin;
    this._coreParams = {};

    // create initial origins
    this.shiftStandardOrigin();
  }

  nextOrigin(): string {
    // if a custom origin is supplied, use do not bother with shuffling subdomains
    if (this._providedFQDN.indexOf('pubsub.') === -1) {
      return this._providedFQDN;
    }

    let newSubDomain: string;

    this._currentSubDomain = this._currentSubDomain + 1;

    if (this._currentSubDomain >= this._maxSubDomain) {
      this._currentSubDomain = 1;
    }

    newSubDomain = this._currentSubDomain.toString();

    return this._providedFQDN.replace('pubsub', 'ps' + newSubDomain);
  }

  // origin operations
  shiftStandardOrigin(failover: boolean = false): string {
    this._standardOrigin = this.nextOrigin(failover);

    return this._standardOrigin;
  }

  getStandardOrigin(): string {
    return this._standardOrigin;
  }

  GET(queryParams, endpoint, callback) {
    endpoint.origin = this.getStandardOrigin();
    this._config._networkTransport.GET({ queryParams, endpoint, callback });
  }

  POST(queryParams, body, endpoint, callback) {
    endpoint.origin = this.getStandardOrigin();
    this._config._networkTransport.POST({ queryParams, body, endpoint, callback });
  }

}
