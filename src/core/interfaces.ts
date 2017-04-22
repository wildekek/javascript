export interface CallbackStruct {
  status: Function;
  presence: Function;
  message: Function;
}

export interface ProxyStruct {
  port: number;
  hostname: string;
  headers: Object;
}

export interface KeepAliveStruct {
  keepAlive: number;
  keepAliveMsecs: number;
  freeSocketKeepAliveTimeout: number;
  timeout: number;
  maxSockets: number;
  maxFreeSockets: number;
}

export interface NetworkingModules {
  keepAlive?: Function;
  sendBeacon?: Function;
  get: Function;
  post: Function;
}

export interface ConfigConstructArgs {
  setup: InternalSetupStruct | any;
  db: DatabaseInterface;
}

export interface InternalSetupStruct {
  publishKey?: string; // API key required for publishing
  subscribeKey: string; // API key required to subscribe
  cipherKey: string; // decryption keys
  origin?: string; // an optional FQDN which will recieve calls from the SDK.
  ssl?: boolean; // is SSL enabled?
  shutdown?: Function; // function to call when pubnub is shutting down.

  sendBeacon?: Function; // executes a call against the Beacon API
  useSendBeacon?: boolean; // enable, disable usage of send beacons

  subscribeRequestTimeout?: number; // how long to wait for subscribe requst
  transactionalRequestTimeout?: number; // how long to wait for transactional requests

  proxy?: ProxyStruct; // configuration to support proxy settings.

  keepAlive?: boolean; // is keep-alive enabled?

  keepAliveSettings?: KeepAliveStruct; // configuration on keep-alive usage

  suppressLev?: boolean;

  db: DatabaseInterface; // get / set implementation to store data
  networking: any; // component of networking to use
}

export interface DatabaseInterface {
  get: Function;
  set: Function;
}

export interface EndpointKeyDefinition {
  required: boolean;
}

export interface SupportedParams {
  subscribeKey: EndpointKeyDefinition;
  uuid: EndpointKeyDefinition;
}

export interface endpointDefinition {
  params: SupportedParams;
  timeout: number;
  url: string;
}

export interface StateChangeAnnouncement {
  state: Object;
  channels: Array<string>;
  channelGroups: Array<string>;
}

// ****************** SUBSCRIPTIONS ********************************************

export interface SubscribeMetadata {
  timetoken: number;
  region: number;
}

export class PublishMetaData {
  publishTimetoken: number;
  region: number;
  constructor() {}
}

export class SubscribeMessage {
  shard: number;
  subscriptionMatch: string;
  channel: string;
  payload: Object;
  flags: string;
  issuingClientId: string;
  subscribeKey: string;
  originationTimetoken: string;
  publishMetaData: PublishMetaData;
  constructor() {}
}

// subscribe responses
export interface SubscribeEnvelope {
  messages: Array<SubscribeMessage>;
  metadata: SubscribeMetadata;
}

// ****************** Announcements ********************************************

export class PresenceAnnouncement {
  event: string;
  uuid: string;
  timestamp: number;
  occupancy: number;
  state: Object;
  subscribedChannel: string; // deprecated
  actualChannel: string;     // deprecated
  channel: string;
  subscription: string;
  timetoken: number;
  userMetadata: Object;
  action?: string;
  join?: Array<string>;
  leave?: Array<string>;
  timeout?: any;
  constructor () {}
}

export class MessageAnnouncement {
  message: Object;
  subscribedChannel: string; // deprecated
  actualChannel: string;     // deprecated
  channel: string;
  subscription: string;
  timetoken: number | string;
  userMetadata: Object;
  publisher: string;
  constructor() {}
}

export class StatusAnnouncement {
  error: boolean;
  statusCode: number;
  category: string;
  operation? : string;
  errorData: Object;
  lastTimetoken: number;
  currentTimetoken: number;
  // send back channel, channel groups that were affected by this operation
  affectedChannels: Array<String>;
  affectedChannelGroups: Array<String>;
  subscribedChannels?: any;
  constructor() {}
}

// *****************************************************************************

// Time endpoints

export interface TimeResponse {
  timetoken: number;
};

// history
export interface FetchHistoryArguments {
  channel: string; // fetch history from a channel
  start: number | string; // start timetoken for history fetching
  end: number | string; // end timetoken for history fetching
  includeTimetoken: boolean; // include time token for each history call
  reverse: boolean;
  count: number;
  stringifiedTimeToken: boolean;
}

export interface FetchMessagesArguments {
  channels: Array<string>; // fetch history from a channel
  start: number | string; // start timetoken for history fetching
  end: number | string; // end timetoken for history fetching
  count: number;
}

export interface FetchMessagesResponse {
  channels: any;
}

export interface HistoryItem {
  timetoken: number | string | null;
  entry: any;
}

export interface HistoryResponse {
  messages: Array<HistoryItem>;
  startTimeToken: number | string;
  endTimeToken: number | string;
}

export interface HistoryV3Response {
  channels: Object;
}

// CG endpoints

export interface AddChannelParams {
  channels: Array<string>;
  channelGroup: string;
}

export interface RemoveChannelParams {
  channels: Array<string>;
  channelGroup: string;
}

export interface DeleteGroupParams {
  channelGroup: string;
}

export interface ListAllGroupsResponse {
  groups: Array<string>;
}

export interface ListChannelsParams {
  channelGroup: string;
}

export interface ListChannelsResponse {
  channels: Array<string>;
}

// push

export interface ProvisionDeviceArgs {
  operation: 'add' | 'remove';
  pushGateway: 'gcm' | 'apns' | 'mpns';
  device: string;
  channels: Array<string>;
};

export interface ModifyDeviceArgs {
  pushGateway: 'gcm' | 'apns' | 'mpns';
  device: string;
  channels: Array<string>;
};

export interface ListChannelsArgs {
  pushGateway: 'gcm' | 'apns' | 'mpns';
  device: string;
};

export interface RemoveDeviceArgs {
  pushGateway: 'gcm' | 'apns' | 'mpns';
  device: string;
};

export interface ListPushChannelsResponse {
  channels: Array<string>;
}

// presence

export interface LeaveArguments {
  channels: Array<string>;
  channelGroups: Array<string>;
}

export interface HereNowArguments {
  channels: Array<string>;
  channelGroups: Array<string>;
  includeUUIDs: boolean;
  includeState: boolean;
}

export interface WhereNowArguments {
  uuid: string;
}

export interface WhereNowResponse {
  channels: Array<string>;
}

//

export interface GetStateArguments {
  uuid: string;
  channels: Array<string>;
  channelGroups: Array<string>;
}

export interface GetStateResponse {
  channels: Object;
}

//

export interface SetStateArguments {
  channels: Array<string>;
  channelGroups: Array<string>;
  state: Object;
}

export interface SetStateResponse {
  state: Object;
}


export interface HeartbeatArguments {
  channels: Array<string>;
  channelGroups: Array<string>;
  state: Object;
}

// subscribe

export interface SubscribeArguments {
  channels: Array<string>;
  channelGroups: Array<string>;
  timetoken: number;
  filterExpression?: string;
  region?: string;
}

// access manager

export interface AuditArguments {
  channel: string;
  channelGroup: string;
  authKeys: Array<string>;
}

export interface GrantArguments {
  channels: Array<string>;
  channelGroups: Array<string>;
  ttl: number;
  read: boolean;
  write: boolean;
  manage: boolean;
  authKeys: Array<string>;
}

// publish

export interface PublishResponse {
  timetoken: number;
};

export interface PublishArguments {
  message: Object | string | number | boolean; // the contents of the dispatch
  channel: string; // the destination of our dispatch
  sendByPost: boolean | null; // use POST when dispatching the message
  storeInHistory: boolean | null; // store the published message in remote history
  meta: Object; // psv2 supports filtering by metadata
  replicate: boolean | null; // indicates to server on replication status to other data centers.
  ttl?: number;
}

//

export interface ModulesInject {
  config: any;
}

export interface ReconnectionManagerArgs {
  timeEndpoint: any;
}
