/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */

var pubnub = require("./../pubnub.js").init({
    publish_key   : "demo",
    ssl : true,
    subscribe_key : "demo"
});

var pubnub_pam = require("./../pubnub.js").init({
    publish_key   : "pam",
    ssl : true,
    subscribe_key : "pam"
});

var channel = "abcd";
var message = "Hello World !!!"

function log(r){
    console.log(JSON.stringify(r,null,2));
}

pubnub.publish({
    channel  : channel,
    message  : message,
    callback : log,
    error    : log
});

pubnub_pam.publish({
    channel  : channel,
    message  : message,
    callback : log,
    error    : log
});