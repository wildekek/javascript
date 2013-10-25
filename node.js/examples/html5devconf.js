/* ---------------------------------------------------------------------------
Init Supervisor
--------------------------------------------------------------------------- */
var pubnub   = require("./../pubnub.js")
,   auth_key = 'abcd'
,   pn       = pubnub.init({
    publish_key   : 'pub-c-a2650a22-deb1-44f5-aa87-1517049411d5',
    subscribe_key : 'sub-c-a478dd2a-c33d-11e2-883f-02ee2ddab7fe',
    secret_key    : 'sec-c-YjFmNzYzMGMtYmI3NC00NzJkLTlkYzYtY2MwMzI4YTJhNDVh'
});

grant('34');
grant('34-pnpres');

function grant(channel) {
    pn.grant({
        ttl      : 1000,
        channel  : channel,
        auth_key : auth_key,
        read     : true,
        callback : function(d) { console.log(JSON.stringify(d))}
    });
}

/*function revoke(channel) {
    pn.revoke({
        channel: channel,
        auth_key : auth_key,
        callback : function(d) { console.log(d)}
    });
}*/
