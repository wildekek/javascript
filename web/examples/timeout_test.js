

var publish_key = "ds";
var subscribe_key = "ds";
var origin = "ps1.pubnub.com";


var pubnub_arr = [];
var timeouts = 0;
var errors = 0;
var total_messages = 0;


function publish(pubnub, channel, message, count, index, iteration) {
    setTimeout(function(){
        pubnub.publish({
            'channel' : channel + '-' + count,
            'message' : message + '-' + count,
            'callback' : function(r){
                ++total_messages;
                ++count;
                if (count <= 200) {
                    publish(pubnub, channel, message, count, index, iteration);
                } else {
                    console.log("Finshed, error count " + errors + 
                        ", Timeouts : " + timeouts + ", PN Count " + pubnub_arr.length
                        + ", count = " + count + ", index " + index + ", iteration = " + iteration + ", Total = " + total_messages);
                }

            },   
            'error' : function(r) {
                if (r['message'] === "timeout") {
                    timeouts++;
                    if (timeouts == 1) {
                        console.log("timeout happened at " + pubnub_arr.length);
                    }
                    errors++;
                }
            }         
        })
    }, 50);
}

function test(i) {
    setTimeout(function(){
        pubnub_arr[i] = PUBNUB.init({
            'origin' : origin,
            'publish_key' : publish_key,
            'subscribe_key' : subscribe_key,
        });

        for (var j = 1 ; j <= pubnub_arr.length; j++) {
            var pn = pubnub_arr[j];
            pn && publish(pn, "channel", "message", 0, j, i);
        }
    }, 120000);
}

for (var i = 1; i <= 20; i++) {
    test(i);
}

