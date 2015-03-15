/* ---------------------------------------------------------------------------

    Init PubNub and Get your PubNub API Keys:
    http://www.pubnub.com/account#api-keys

--------------------------------------------------------------------------- */

var pubnub = require("./../pubnub.js").init({
    publish_key   : "demo",
    ssl : true,
    subscribe_key : "demo",
    cipher_key : "demo",
    result : rlog,
    status : slog
});

var pubnub_pam = require("./../pubnub.js").init({
    publish_key   : "pam",
    ssl : true,
    subscribe_key : "pam",
    result : rlog,
    status : slog
});

var channel = "abcd";
var message = "Hello World !!!"

function rlog(r){
    console.log("RESULT");
    console.log(JSON.stringify(r,null,2));
}

function slog(r){
    console.log(JSON.stringify("STATUS"));
    console.log(JSON.stringify(r,null,2));
}

pubnub.where_now({
    channel  : 'crypto'
});


//pubnub.history({
//    channel : 'crypto'
//})

//pubnub_pam.history({
//    channel : 'abcd'
//})


/*
pubnub_pam.publish({
    channel  : channel,
    message  : message,
    callback : log,
    error    : log
});
*/