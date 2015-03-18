/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */

function logResults(r){
    console.log("RESULT from " + r.operation + " call:");
    console.log(JSON.stringify(r,null,2));
}

function logStatus(r){
    console.log("STATUS from " + r.operation + " call:");
    console.log(JSON.stringify(r,null,2));
}

var pubnub = require("./../pubnub.js").init({
    publish_key   : "demo-36",
    subscribe_key : "demo-36",
    secret_key : "demo-36",
    ssl : true,
    uuid : "v4_migration",
    result : logResults,
    status : logStatus
});

var channel = "a";
var message = "Hello World !!!"

pubnub.subscribe({
    channel: channel}
);

pubnub.history({
    channel : channel
});

pubnub.publish({
    channel : channel,
    message : message
});

pubnub.grant({
    channel: channel,
    read : true,
    write : true
});

pubnub.audit({
    channel: channel
});
