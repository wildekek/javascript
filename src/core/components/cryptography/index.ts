import Config from '../config';
import { hmacsha256, enc, sha256, mode, AES } from './hmac-sha256';

export interface CryptoConstruct {
  config: Config;
}

export default class {
  _config: Config;
  _iv: string;
  _allowedKeyEncodings: string[];
  _allowedKeyLengths: number[];
  _allowedModes: string[];
  _defaultOptions: any;

  constructor({ config }: CryptoConstruct) {
    this._config = config;

    this._iv = '0123456789012345';

    this._allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
    this._allowedKeyLengths = [128, 256];
    this._allowedModes = ['ecb', 'cbc'];

    this._defaultOptions = {
      encryptKey: true,
      keyEncoding: 'utf8',
      keyLength: 256,
      mode: 'cbc'
    };
  }

  hmacsha256(data: string): string {
    let hash = hmacsha256(data, this._config.secretKey);
    return hash.toString(enc.Base64);
  }

  sha256(s: string): string {
    return sha256(s).toString(enc.Hex);
  }

  private parseOptions(incomingOptions?: any): Object {
    // Defaults
    let options = incomingOptions || {};
    if (!options.hasOwnProperty('encryptKey')) options.encryptKey = this._defaultOptions.encryptKey;
    if (!options.hasOwnProperty('keyEncoding')) options.keyEncoding = this._defaultOptions.keyEncoding;
    if (!options.hasOwnProperty('keyLength')) options.keyLength = this._defaultOptions.keyLength;
    if (!options.hasOwnProperty('mode')) options.mode = this._defaultOptions.mode;

    // Validation
    if (this._allowedKeyEncodings.indexOf(options.keyEncoding.toLowerCase()) === -1) {
      options.keyEncoding = this._defaultOptions.keyEncoding;
    }

    if (this._allowedKeyLengths.indexOf(parseInt(options.keyLength, 10)) === -1) {
      options.keyLength = this._defaultOptions.keyLength;
    }

    if (this._allowedModes.indexOf(options.mode.toLowerCase()) === -1) {
      options.mode = this._defaultOptions.mode;
    }

    return options;
  }

  private decodeKey(key: string, options: any): string {
    if (options.keyEncoding === 'base64') {
      return enc.Base64.parse(key);
    } else if (options.keyEncoding === 'hex') {
      return enc.Hex.parse(key);
    } else {
      return key;
    }
  }

  private getPaddedKey(key: string, options: any): string {
    key = this.decodeKey(key, options);
    if (options.encryptKey) {
      return enc.Utf8.parse(this.sha256(key).slice(0, 32));
    } else {
      return key;
    }
  }

  private getMode(options: any): string {
    if (options.mode === 'ecb') {
      return mode.ECB;
    } else {
      return mode.CBC;
    }
  }

  private getIV(options: any): string | null {
    return (options.mode === 'cbc') ? enc.Utf8.parse(this._iv) : null;
  }

  encrypt(data: string, customCipherKey?: string, options?: Object): Object | string | null {
    if (this._config.customEncrypt) {
      return this._config.customEncrypt(data);
    } else {
      return this.pnEncrypt(data, customCipherKey, options);
    }
  }

  decrypt(data: Object, customCipherKey?: string, options?: Object): Object | string | null {
    if (this._config.customDecrypt) {
      return this._config.customDecrypt(data);
    } else {
      return this.pnDecrypt(data, customCipherKey, options);
    }
  }

  pnEncrypt(data: string, customCipherKey?: string, options?: Object): Object | string | null {
    if (!customCipherKey && !this._config.cipherKey) return data;
    options = this.parseOptions(options);
    let iv = this.getIV(options);
    let mode = this.getMode(options);
    let cipherKey = this.getPaddedKey(customCipherKey || this._config.cipherKey, options);
    let encryptedHexArray = AES.encrypt(data, cipherKey, { iv, mode }).ciphertext;
    let base64Encrypted = encryptedHexArray.toString(enc.Base64);
    return base64Encrypted || data;
  }

  pnDecrypt(data: Object, customCipherKey?: string, options?: Object): Object | null {
    if (!customCipherKey && !this._config.cipherKey) return data;
    options = this.parseOptions(options);
    let iv = this.getIV(options);
    let mode = this.getMode(options);
    let cipherKey = this.getPaddedKey(customCipherKey || this._config.cipherKey, options);
    try {
      let ciphertext = enc.Base64.parse(data);
      let plainJSON = AES.decrypt({ ciphertext }, cipherKey, { iv, mode }).toString(enc.Utf8);
      let plaintext = JSON.parse(plainJSON);
      return plaintext;
    } catch (e) {
      return null;
    }
  }

}
