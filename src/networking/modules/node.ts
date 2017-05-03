/* global window */

import superagent from 'superagent';
import superagentProxy from 'superagent-proxy';
import AgentKeepAlive from 'agentkeepalive';

superagentProxy(superagent);

export function proxy(superagentConstruct: superagent) {
  return superagentConstruct.proxy(this._config.proxy);
}

export function keepAlive(superagentConstruct: superagent) {
  let AGENT_CLASS = null;
  let agent = null;

  if (this._config.secure) {
    AGENT_CLASS = AgentKeepAlive.HttpsAgent;
  } else {
    AGENT_CLASS = AgentKeepAlive;
  }

  if (this._config.keepAliveSettings) {
    agent = new AGENT_CLASS(this._config.keepAliveSettings);
  } else {
    agent = new AGENT_CLASS();
  }

  return superagentConstruct.agent(agent);
}
