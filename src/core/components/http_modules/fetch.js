/* @flow */
/* global window */

import nodeFetch from 'node-fetch';

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

const _abstractedXDR = ({ fetchUrl, method, endpoint, callback, body}): Object => {
  const fetchConfig = {
    method,
    timeout: endpoint.timeout
  };

  console.log({ fetchUrl, fetchConfig });

  nodeFetch(fetchUrl, fetchConfig)
    .then((response) => {
      console.log('response', response);
    })
    .catch((error) => {
      console.log('error', error);
    });

  // attach a logger
  // if (endpoint.isDebug) {
  //   superagentConstruct = superagentConstruct.use(_attachSuperagentLogger);
  // }

  /*
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
    */
};

const createURL = (origin, path, queryParams) => {
  let base = origin + path;

  if (queryParams && Object.keys(queryParams).length > 0) {
    base += '?' + Object.keys(queryParams).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(queryParams[k])).join('&');
  }

  return base;
};

export default {
  POST: ({ queryParams, body, endpoint }, callback): nodeFetch => {
    const fetchUrl = createURL(endpoint.origin, endpoint.url, queryParams);
    return _abstractedXDR({ fetchUrl, method: 'POST', endpoint, callback, body });
  },

  GET: ({ queryParams, endpoint }, callback): nodeFetch => {
    const fetchUrl = createURL(endpoint.origin, endpoint.url, queryParams);
    return _abstractedXDR({ fetchUrl, method: 'GET', endpoint, callback });
  }
};
