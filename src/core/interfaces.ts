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

export interface InternalSetupStruct {
    useSendBeacon?: boolean; // configuration on beacon usage
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

    db: Function; // get / set implementation to store data
    networking: Function; // component of networking to use
}

