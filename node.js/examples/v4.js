

var PUBNUB = require("../pubnub.js")

var pubnub = PUBNUB({
    publish_key   : "pam",
    subscribe_key : "pam"
});

var channel = "abcd";

function log(c, m) {
	console.log(c + ' : ' + JSON.stringify(m));
}
function connect(m) {log('CONNECT',m)}
function disconnect(m) {log('DISCONNECT',m)}
function reconnect(m) {log('RECONNECT',m)}
function error(m) {log('ERROR',m)}
function callback(m) {log('CALLBACK',m)}

pubnub.subscribe({
	channel : 'a',
	connect  : function(se) {
		console.log('CONNECT : ' + JSON.stringify(se,null,2));
	},
	error : function(e) {
		console.log(JSON.stringify(e));
	},
	callback    : function(data) {
		console.log(JSON.stringify(data,null,2));
	}
});
/*
pubnub.subscribe({
	channel : 'a',
	status  : function(se) {
		console.log(JSON.stringify(se,null,2));
	},
	result    : function(data) {
		console.log(JSON.stringify(data,null,2));
	}
});
/*
pubnub.publish({
	channel : channel,
	message : 'hi',
	status : function(se) {
		console.log(JSON.stringify(data, null, 2));
	},
	result : function(data){
		console.log(JSON.stringify(data, null, 2));
	}
})
*/
