/* @flow */
/* global window */

import superagent from 'superagent';

import categoryConstants from '../../constants/categories';

import { EndpointDefinition, StatusAnnouncement } from '../../flow_interfaces';

const _detectErrorCategory = (err: Object): string => {
  if (err.code === 'ENOTFOUND') return categoryConstants.PNNetworkIssuesCategory;
  if (err.status === 0 || (err.hasOwnProperty('status') && typeof err.status === 'undefined')) return categoryConstants.PNNetworkIssuesCategory;
  if (err.timeout) return categoryConstants.PNTimeoutCategory;

  if (err.response) {
    if (err.response.badRequest) return categoryConstants.PNBadRequestCategory;
    if (err.response.forbidden) return categoryConstants.PNAccessDeniedCategory;
  }

  return categoryConstants.PNUnknownCategory;
};

const _attachSuperagentLogger = (req: Object) => {
  let _pickLogger = () => {
    if (console && console.log) return console; // eslint-disable-line no-console
    if (window && window.console && window.console.log) return window.console;
    return console;
  };

  let start = new Date().getTime();
  let timestamp = new Date().toISOString();
  let logger = _pickLogger();
  logger.log('<<<<<');                                               // eslint-disable-line no-console
  logger.log('[' + timestamp + ']', '\n', req.url, '\n', req.qs);    // eslint-disable-line no-console
  logger.log('-----');                                               // eslint-disable-line no-console

  req.on('response', (res) => {
    let now = new Date().getTime();
    let elapsed = now - start;
    let timestampDone = new Date().toISOString();

    logger.log('>>>>>>');                                                                                  // eslint-disable-line no-console
    logger.log('[' + timestampDone + ' / ' + elapsed + ']', '\n', req.url, '\n', req.qs, '\n', res.text);  // eslint-disable-line no-console
    logger.log('-----');                                                                                   // eslint-disable-line no-console
  });
};

const _abstractedXDR = (superagentConstruct: superagent, endpoint: EndpointDefinition, callback: Function): Object => {
  // attach a logger
  if (endpoint.isDebug) {
    superagentConstruct = superagentConstruct.use(_attachSuperagentLogger);
  }

  return superagentConstruct
    .timeout(endpoint.timeout)
    .end((err, resp) => {
      let status: StatusAnnouncement = {};
      status.error = err !== null;
      status.operation = endpoint.operation;

      if (resp && resp.status) {
        status.statusCode = resp.status;
      }

      if (err) {
        status.errorData = err;
        status.category = _detectErrorCategory(err);
        return callback(status, null);
      }

      let parsedResponse = JSON.parse(resp.text);
      return callback(status, parsedResponse);
    });
};

export default {
  POST: ({ queryParams, body, endpoint, callback }): superagent => {
    let superagentConstruct = superagent
      .post(endpoint.origin + endpoint.url)
      .query(queryParams)
      .send(body);
    return _abstractedXDR(superagentConstruct, endpoint, callback);
  },

  GET: ({ queryParams, endpoint, callback }): superagent => {
    let superagentConstruct = superagent
      .get(endpoint.origin + endpoint.url)
      .query(queryParams);
    return _abstractedXDR(superagentConstruct, endpoint, callback);
  }
};
