
var suffix = ".devbuild.pubnub.com"


function get_origin(o) {
    return o + suffix
}

function get_origins(o) {
    var o1 = [];
    for (var i in o) {
        o1[i] = o[i] + suffix;
    }
    return o1;
}

function check_origin(a,b) {
    deepEqual(a.split('://')[1], b);
}

function down(origin, time) {
    var pn = PUBNUB.init({
        'origin'       : get_origin(origin),
        'publish_key'  : 'demo',
    });
    var channel = 'denyme' + time + origin;

    pn.publish({
        channel : channel,
        message : 'denyme',
        callback : function(r) {}
    })
} 

var tests = [
    
    {
        "name"    : "ha test 1",
        "channel" : "ab",
        "origins" : ["geo1", "geo2", "geo3", "geo4"],
        "down"    : [
                        { origin : "geo1", duration : 120}
                    ],
        "checks"  : [
                        { origin : "geo2", interval : 90},
                        { origin : "geo1", interval : 180}
                    ]
    },

    {
        "name"    : "ha test 2",
        "channel" : "ab",
        "origins" : ["geo1", "geo2", "geo3", "geo4"],
        "down"    : [
                        { origin : "geo1", duration : 120}
                    ],
        "checks"  : [
                        { origin : "geo1", interval : 180}
                    ]
    },
    {
        "name"    : "ha test 3",
        "channel" : "ab",
        "origins" : ["geo1", "geo2", "geo3", "geo4"],
        "down"    : [
                        { origin : "geo1", duration : 600},
                        { origin : "geo2", duration : 480},
                        { origin : "geo3", duration : 360}
                    ],
        "checks"  : [   
                        { origin : "geo4", interval : 240},
                        { origin : "geo3", interval : 420},
                        { origin : "geo2", interval : 540},
                        { origin : "geo1", interval : 660}
                    ]
    },
    {
        "name"    : "ha test 4",
        "channel" : "ab",
        "origins" : ["geo1", "geo2", "geo3", "geo4"],
        "down"    : [
                        { origin : "geo1", duration : 360},
                        { origin : "geo2", duration : 360},
                        { origin : "geo3", duration : 360},
                        { origin : "geo4", duration : 360}
                    ],
        "checks"  : [   
                        { origin : "geo1", interval : 480}
                    ]
    },
    {
        "name"    : "ha test 5",
        "channel" : "ab",
        "origins" : ["geo1", "geo2", "geo3", "geo4"],
        "down"    : [
                        { origin : "geo1", duration : 600},
                        { origin : "geo2", duration : 600},
                        { origin : "geo3", duration : 600},
                        { origin : "geo4", duration : 400}
                    ],
        "checks"  : [ 
                        { origin : "geo4", interval : 540},  
                        { origin : "geo1", interval : 720}
                    ]
    }



]

var l = 0;
var j = 0;
for (var i in tests) {

    test(tests[l++]['name'], function() {

        var max = 0;
        var t = tests[j++];

        var checks_count = t.checks.length;
        stop(1);

        for ( var ci in t["checks"]) {
            if (t["checks"][ci]["interval"] > max) max = t["checks"][ci]["interval"];
        }

        expect(checks_count);

        var pubnub = PUBNUB.init({
            publish_key   : 'demo',
            subscribe_key : 'demo',
            origins       : get_origins(t["origins"])
        });

        pubnub.subscribe({ 
            channel : t["channel"],
            callback : function(response) {
            }
        });

        for (var di in t["down"]) {
            down(t["down"][di]["origin"],t["down"][di]["duration"]);
        }

        var k = 0;
        for ( var ci in t["checks"]) {
            setTimeout(function(){
                check_origin(pubnub.get_sub_origin(), get_origin(t["checks"][k++]["origin"]));
            }, t["checks"][ci]["interval"] * 1000);
        }

        setTimeout(function(){
            start();
            pubnub.unsubscribe({channel : t["channel"]});
        }, (max + 5) * 1000);

    });
}
