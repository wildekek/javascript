import uuidGenerator from 'uuid';

import { StatusAnnouncement } from '../flow_interfaces';
import utils from '../utils';
import Config from './config';
import operationConstants from '../constants/operations';

class PubNubError extends Error {
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.message = message;
  }
}

function createError(errorPayload: Object, type: string): Object {
  errorPayload.type = type;
  return errorPayload;
}

function createValidationError(message: string): Object {
  return createError({ message }, 'validationError');
}

function decideURL(endpoint, modules, incomingParams) {
  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    return endpoint.postURL(modules, incomingParams);
  } else {
    return endpoint.getURL(modules, incomingParams);
  }
}

function generatePNSDK(config: Config): string {
  let base = 'PubNub-JS-' + config.sdkFamily;

  if (config.partnerId) {
    base += '-' + config.partnerId;
  }

  base += '/' + config.getVersion();

  return base;
}

function performWork(modules, endpoint, incomingParams, internalCallback) {

}

export default function (modules, endpoint, ...args) {
  let { networking, config, crypto } = modules;
  let promiseComponent = null;
  let callback = null;
  let incomingParams = {};

  // bridge in Promise support.
  if (typeof Promise !== 'undefined') {
    promiseComponent = utils.createPromise();
  }

  if (endpoint.getOperation() === operationConstants.PNTimeOperation || endpoint.getOperation() === operationConstants.PNChannelGroupsOperation) {
    callback = args[0];
  } else {
    incomingParams = args[0];
    callback = args[1];
  }

  performWork(modules, endpoint, incomingParams, (isError, status, exception, response) => {
    if (isError) {
      if (callback) callback(status);
      else if (promiseComponent) promiseComponent.reject(exception);
      return;
    }

    if (callback) {
      callback(status, response);
    } else if (promiseComponent) {
      promiseComponent.fulfill(response);
    }
  });

  /*
  let validationResult = endpoint.validateParams(modules, incomingParams);

  if (validationResult) {
    callback(createValidationError(validationResult));
    return;
  }

  let outgoingParams = endpoint.prepareParams(modules, incomingParams);
  let url = decideURL(endpoint, modules, incomingParams);
  let callInstance;
  let networkingParams = { url,
    operation: endpoint.getOperation(),
    timeout: endpoint.getRequestTimeout(modules)
  };

  outgoingParams.uuid = config.UUID;
  outgoingParams.pnsdk = generatePNSDK(config);

  if (config.useInstanceId) {
    outgoingParams.instanceid = config.instanceId;
  }

  if (config.useRequestId) {
    outgoingParams.requestid = uuidGenerator.v4();
  }

  if (endpoint.isAuthSupported() && config.getAuthKey()) {
    outgoingParams.auth = config.getAuthKey();
  }

  if (config.secretKey) {
    outgoingParams.timestamp = Math.floor(new Date().getTime() / 1000);
    let signInput = config.subscribeKey + '\n' + config.publishKey + '\n';

    if (endpoint.getOperation() === operationConstants.PNAccessManagerGrant) {
      signInput += 'grant\n';
    } else if (endpoint.getOperation() === operationConstants.PNAccessManagerAudit) {
      signInput += 'audit\n';
    } else {
      signInput += url + '\n';
    }

    signInput += utils.signPamFromParams(outgoingParams);

    let signature = crypto.HMACSHA256(signInput);
    signature = signature.replace(/\+/g, '-');
    signature = signature.replace(/\//g, '_');

    outgoingParams.signature = signature;
  }

  let onResponse = (status: StatusAnnouncement, payload: Object) => {
    if (status.error) {
      if (callback) {
        callback(status);
      } else if (promiseComponent) {
        promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', status));
      }
      return;
    }

    let parsedPayload = endpoint.handleResponse(modules, payload, incomingParams);

    if (callback) {
      callback(status, parsedPayload);
    } else if (promiseComponent) {
      promiseComponent.fulfill(parsedPayload);
    }
  };

  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    let payload = endpoint.postPayload(modules, incomingParams);
    callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
  } else {
    callInstance = networking.GET(outgoingParams, networkingParams, onResponse);
  }

  if (endpoint.getOperation() === operationConstants.PNSubscribeOperation) {
    return callInstance;
  }

  if (promiseComponent) {
    return promiseComponent.promise;
  }
  */
}
