var assert = require('assert');
var PUBNUB = require('../pubnub.js');
var _ = require("underscore");
var pubnub = PUBNUB.init({
    publish_key     : 'ds',
    subscribe_key   : 'ds',
    origin          : 'pubsub.pubnub.com',
    build_u       : true
});


var pubnub_pam = PUBNUB.init({
    publish_key     : 'ds-pam',
    subscribe_key   : 'ds-pam',
    secret_key      : 'ds-pam',
    origin          : 'pubsub.pubnub.com',
    build_u       : true
});

var pubnub_enc = PUBNUB({
    publish_key     : 'ds',
    subscribe_key   : 'ds', 
    cipher_key      : 'enigma',
    origin : 'pubsub.pubnub.com',
    build_u       : true
}); 

var channel = 'javascript-test-channel-' + Date.now();
var count = 0;

var message_string = "Hi from Javascript";
var message_jsono = {"message": "Hi from Javascript"};
var message_jsono_q = {"message": "How are you ?"};
var message_jsona = ["message" , "Hi from javascript"];
var message_num = 123;
var message_num_str = "123";
var message_jsono_str = '{"message" : "Hi from Javascript"}';
var message_jsona_str = '["message" , "Hi from javascript"]';


function in_list(list,str) {
    for (var x in list) {
        if (list[x] === str) return true;
    }
    return false;
 }
  function in_list_deep(list,str) {
    for (var x in list) {
        if (_.isEqual(list[x], str)) return true;
    }
    return false;
 }

function get_random(max){
    return Math.floor((Math.random()* (max || 1000000000)+1))
}

function log(r) {
	console.log(JSON.stringify(r, null, 2));
}

namespaces = []
groups     = []

describe('Pubnub', function() {

    this.timeout(180000);

    before(function(){
        pubnub_pam.revoke({})
        pubnub.channel_group_list_groups({
            result : function(r) {
                var groups = r.groups;
                for (var i in groups) {
                    var group = groups[i];
                    pubnub.channel_group_remove_group({
                        channel_group : group
                    })
                }
            }
        });
        pubnub.channel_group_list_namespaces({
            result : function(r) {
                var namespaces = r.namespaces;
                for (var i in namespaces) {
                    var namespace = namespaces[i];
                    pubnub.channel_group_remove_namespace({
                        namespace : namespace
                    })
                }
            }
        });

    })

    after(function(){
        for (var i in namespaces) {
            var namespace = namespaces[i];
            pubnub.channel_group_remove_namespace({
                namespace : namespace
            })
        }
        for (var i in groups) {
            var group = groups[i];
            pubnub.channel_group_remove_group({
                channel_group : group
            })
        }
    })
    describe('#publish()', function(){
        it('should publish strings without error', function(done){
            var ch = channel + '-' + ++count;
            pubnub.subscribe({channel : ch ,
                state : { "name" : "dev" },
                status : function(ev) {
                	if (ev.category === 'connect') {
                		pubnub.publish({channel: ch , message : message_string,
	                        result : function(response) {
	                            //log(response);
	                        }
	                    });
                	}
                },
                result : function(response) {
                    assert.deepEqual(response.data,message_string);
                    pubnub.unsubscribe({channel : ch});
                    done();
                }

            })
        })
        it('should store in history when store is not there or store is true', function(done){
            var ch = channel + '-' + ++count;
            var messages = [1,2,3]
            pubnub.publish({channel: ch , message : messages[0],
                result : function(response) {
                    assert.deepEqual(response.data[0],1);
                    pubnub.publish({channel: ch , message : messages[1],
                        result : function(response) {
                            assert.deepEqual(response.data[0],1);
                            pubnub.publish({channel: ch , message : messages[2],
                                result : function(response) {
                                    assert.deepEqual(response.data[0],1);
                                    setTimeout(function(){
                                        pubnub.history({
                                            channel  : ch,  
                                            result : function(response) {
                                                assert.deepEqual(messages, response.data[0]);
                                                done(); 
                                            },
                                            count : 3
                                        });
                                    },5000);
                                }
                            });
                        }
                    });
                }
            });
        })
        it('should not store in history when store is false', function(done){
            var ch = channel + '-' + ++count;
            var messages = [4,5,6]
            pubnub.publish({channel: ch , message : messages[0], store_in_history : false,
                result : function(response) {
                    assert.deepEqual(response.data[0],1);
                    pubnub.publish({channel: ch , message : messages[1], store_in_history : false,
                        result : function(response) {
                            assert.deepEqual(response.data[0],1);
                            pubnub.publish({channel: ch , message : messages[2], store_in_history : false,
                                result : function(response) {
                                    assert.deepEqual(response.data[0],1);
                                    setTimeout(function(){
                                        pubnub.history({
                                            channel  : ch,  
                                            result : function(response) {
                                                assert.notDeepEqual(messages, response.data[0]);
                                                done(); 
                                            },
                                            count : 3
                                        });
                                    },5000);
                                }
                            });
                        }
                    });
                }
            });
        })  
    })

    describe('#subscribe()', function(){
        it('should pass plain text to callback on decryption error', function(done){
            var ch = channel + '-' + ++count;
            pubnub_enc.subscribe({channel : ch ,
                status : function(ev) {
                    if (ev.category === 'connect') {
                        pubnub.publish({channel: ch , message : message_string,
                            result : function(response) {
                                assert.deepEqual(response.data[0],1);
                            }
                        });
                    }
                    if (ev.category === 'error') {
                        assert.ok(false);
                        pubnub_enc.unsubscribe({channel : ch});
                        done();      
                    }
                },
                result : function(response) {
                    assert.deepEqual(response.data,message_string);
                    pubnub_enc.unsubscribe({channel : ch});
                    done();
                }
            })
        })
        it('should take an error callback which will be invoked if channel permission not there', function(done){
            var channel = 'channel' + Date.now();
            var auth_key = 'abcd';
            pubnub_pam.subscribe({
                'auth_key' : auth_key,
                'channel' : channel,
                'status'   : function(r) {
                    if (r.category === 'error') {
                        assert.deepEqual(r.data['message'],'Forbidden');
                        assert.ok(r.data['payload'], "Payload should be there in error response");
                        assert.ok(r.data['payload']['channels'], "Channels should be there in error payload");
                        assert.ok(in_list_deep(r.data['payload']['channels'], channel), "Channel should be there in channel list");
                        pubnub_pam.unsubscribe({'channel' : channel });
                        done();
                    }
                },
                'result' : function(r) {
                    assert.ok(false, "Callback should not get invoked if permission not there");
                }
            })
        })
    })
    describe('#history() with encryption', function(){
        var history_channel = channel + '-history-enc';

        before(function(done){
            this.timeout(40000);
            var x;
            pubnub_enc.publish({channel: history_channel,
                message : message_string + '-1',
                result : function(response){
                    assert.deepEqual(response.data[0], 1);
                    pubnub_enc.publish({channel: history_channel,
                        message : message_string + '-2',
                        result : function(response){
                            assert.deepEqual(response.data[0], 1);
                            done();
                        }
                    });
                }
            });

        })
        it('should return 2 messages when 2 messages were published on channel', function(done) {
            this.timeout(40000);
            setTimeout(function() {
                pubnub_enc.history({channel : history_channel,
                    result : function(response) {
                        assert.deepEqual(response.data[0].length, 2);
                        assert.deepEqual(response.data[0][0], message_string + '-1');
                        assert.deepEqual(response.data[0][1], message_string + '-2');
                        done();
                    }
                })
            },5000);
        })
        it('should return 1 message when 2 messages were published on channel and count is 1', function(done) {
            this.timeout(40000);
            setTimeout(function() {
                pubnub_enc.history({channel : history_channel,
                    count : 1,
                    result : function(response) {
                        assert.deepEqual(response.data[0].length, 1);
                        assert.deepEqual(response.data[0][0], message_string + '-2');
                        done();
                    }
                })
            },5000);
        })
        it('should return 1 message from reverse when 2 messages were published on channel and count is 1', function(done) {
            this.timeout(40000);
            setTimeout(function() {
                pubnub_enc.history({channel : history_channel,
                    count : 1,
                    reverse : true,
                    result : function(response) {
                        assert.deepEqual(response.data[0].length, 1);
                        assert.deepEqual(response.data[0][0], message_string + '-1');
                        done();
                    }
                })
            },5000);
        })
    })
    describe('#here_now()', function(){
        var uuid  = '' + get_random()
        ,   uuid1 = uuid + '-1'
        ,   uuid2 = uuid + '-2'
        ,   uuid3 = uuid + '-3';

        var pubnub_pres = PUBNUB.init({
            origin            : 'pubsub.pubnub.com',
            publish_key       : 'ds', // 'demo',
            subscribe_key     : 'ds',  // 'demo',
            uuid              : uuid,
            build_u           : true
        });
        var pubnub_pres_1 = PUBNUB.init({
            origin            : 'pubsub.pubnub.com',
            publish_key       : 'ds', // 'demo',
            subscribe_key     : 'ds',  // 'demo',
            uuid              : uuid1,
            build_u           : true
        });
        var pubnub_pres_2 = PUBNUB.init({
            origin            : 'pubsub.pubnub.com',
            publish_key       : 'ds', // 'demo',
            subscribe_key     : 'ds',  // 'demo',
            uuid              : uuid2,
            build_u           : true
        });
        var pubnub_pres_3 = PUBNUB.init({
            origin            : 'pubsub.pubnub.com',
            publish_key       : 'ds', // 'demo',
            subscribe_key     : 'ds',  // 'demo',
            uuid              : uuid3,
            build_u           : true
        });

        it("should return channel channel list with occupancy details and uuids for a subscribe key", function(done) {
            var ch = channel + '-' + 'here-now-' + Date.now();
            var ch1 = ch + '-1' ;
            var ch2 = ch + '-2' ;
            var ch3 = ch + '-3' ;

            pubnub_pres.subscribe({
                channel: ch ,
                status : function(ev) {
                	if (ev.category === 'status') {
                		assert.ok(false, "Error occurred in subscribe");
                    	assert.done();
                	}

                	if (ev.category === 'connect') {
	                    pubnub_pres_1.subscribe({
	                        channel: ch1 ,
	                        status : function(ev) {

	                        	if (ev.category === 'status') {
	                        		assert.ok(false, "Error occurred in subscribe");
                    				assert.done();
	                        	}

	                        	if (ev.category === 'connect') {
	                        		//console.log('CONNECT 1');
		                            pubnub_pres_2.subscribe({
		                                channel: ch2 ,
		                                status : function(ev) {
		                                	if (ev.category === 'status') {
		                                		assert.ok(false, "Error occurred in subscribe 2");
		                                    	assert.done();
		                                	}
		                                	if (ev.category === 'connect') {
		                                		//console.log('CONNECT 2');
			                                    pubnub_pres_3.subscribe({
			                                        channel: ch3 ,
			                                        status : function(response) {
					                                	if (ev.category === 'status') {
					                                		assert.ok(false, "Error occurred in subscribe 2");
					                                    	assert.done();
					                                	}
			                                        	if (ev.category === 'connect') {
			                                        		//console.log('CONNECT 3');		                                        		
				                                            setTimeout(function() {
				                                                pubnub_pres.here_now({
				                                                    result : function(response) {
				                                                    	//console.log(JSON.stringify(response.data, null, 2));
				                                                        assert.ok(response.data.channels[ch], "subscribed channel should be present in payload");
				                                                        assert.ok(response.data.channels[ch1], "subscribed 1 channel should be present in payload");
				                                                        assert.ok(response.data.channels[ch2], "subscribed 2 channel should be present in payload");
				                                                        assert.ok(response.data.channels[ch3], "subscribed 3 channel should be present in payload");
				                                                        assert.ok(in_list(response.data.channels[ch].uuids, uuid), "uuid should be there in the uuids list");
				                                                        assert.ok(in_list(response.data.channels[ch1].uuids,uuid1), "uuid 1 should be there in the uuids list");
				                                                        assert.ok(in_list(response.data.channels[ch2].uuids,uuid2), "uuid 2 should be there in the uuids list");
				                                                        assert.ok(in_list(response.data.channels[ch3].uuids,uuid3), "uuid 3 should be there in the uuids list");
				                                                        assert.deepEqual(response.data.channels[ch].occupancy,1);
				                                                        assert.deepEqual(response.data.channels[ch1].occupancy,1);
				                                                        assert.deepEqual(response.data.channels[ch2].occupancy,1);
				                                                        assert.deepEqual(response.data.channels[ch3].occupancy,1);
				                                                        pubnub_pres.unsubscribe({channel : ch});
				                                                        pubnub_pres_1.unsubscribe({channel : ch1});
				                                                        pubnub_pres_2.unsubscribe({channel : ch2});
				                                                        pubnub_pres_3.unsubscribe({channel : ch3});
				                                                        done();
				                                                    },
				                                                    status : function(error) {
				                                                    	//console.log(JSON.stringify(error));
				                                                        assert.ok(false, "Error occurred in here now");
				                                                        assert.done();
				                                                    }
				                                                });
				                                            },5000);
														}
			                                        },
			                                        result : function(response) {
			                                        }
			                                    })
											}
		                                },
		                                result : function(response) {
		                                }
		                            })
		                        }                   	
	                        },
	                        result : function(response) {
	                        }
	                    })
	                }
	            },
                result : function(response) {
                }
            })
        })

    })
    describe('#where_now()', function() {
        var uuid = Date.now();
        var pubnub = PUBNUB.init({
            publish_key       : 'ds',  //'demo',
            subscribe_key     : 'ds', //'demo',
            uuid              :  uuid,
            origin            : 'pubsub.pubnub.com',
            build_u       : true
        });
        this.timeout(80000);
        it('should return channel x in result for uuid y, when uuid y subscribed to channel x', function(done){
            var ch = channel + '-' + 'where-now' ;
            pubnub.subscribe({
                channel: ch ,
                status : function(ev) {
                	if (ev.category === 'status') {
                		assert.ok(false, "Error occurred in subscribe");
                	}
                	if (ev.category === 'connect') {
                        setTimeout(function() {
                            pubnub.where_now({
                                uuid: uuid,
                                result : function(response) {
                                    assert.ok(in_list(response.data.channels,ch), "subscribed Channel should be there in where now list");
                                    pubnub.unsubscribe({channel : ch});
                                    done();
                                },
                                status : function(error) {
                                    assert.ok(false, "Error occurred in where_now");
                                    done();
                                }
                            })
                        }, 3000);
                    }
                },
                result : function(response) {
                }
            })
		})
	})
    describe('#state()', function() {
        var uuid = Date.now();
        var pubnub = PUBNUB.init({
            publish_key       : 'ds', // 'demo',
            subscribe_key     : 'ds' , // 'demo',
            uuid              :  uuid,
            origin            : 'pubsub.pubnub.com',
            build_u       : true
        });
        this.timeout(80000);
        it('should be able to set state for uuid', function(done){
            var ch = channel + '-' + 'setstate' ;
            var uuid = pubnub.uuid();
            var state = { 'name' : 'name-' + uuid};
            pubnub.state({
                channel  : ch ,
                uuid     : uuid,
                state : state,
                result : function(response) {
                    assert.deepEqual(response.data, state);
                    pubnub.state({
                        channel  : ch ,
                        uuid     : uuid,
                        result : function(response) {
                            assert.deepEqual(response.data, state);
                            done();
                        },
                        status    : function(error) {
                            assert.ok(false, "Error occurred in state " + JSON.stringify(error));
                            done();
                        }
                     });
                },
                status : function(error) {
                    assert.ok(false, "Error occurred in state " + JSON.stringify(error));
                    done();
                }
            })
        })
	})
    describe('Channel Group',function(){

        describe('#channel_group_add_channel()', function(){

            it('should be able to add channels to channel groups', function(done){
                var channels = 'a,b,c';
                var channel_group = 'r1' + Date.now();
                groups.push(channel_group);

                pubnub.channel_group_add_channel({
                    result : function(r) {
                        pubnub.channel_group_list_channels({
                            channel_group : channel_group,
                            result : function(r) {
                                assert.deepEqual(channels.split(','), r.data.channels);
                                done();
                            },
                            status    : function(r) {
                                assert.ok(false, "Error occurred in getting registry " + JSON.stringify(r));
                                done();
                            } 
                        });
                    },
                    status    : function(r) {
                        assert.ok(false, "Error occurred in adding channel to registry " + JSON.stringify(r));
                        done();
                    },
                    channels : channels,
                    channel_group : channel_group
                });

            })
            it('should be able to add channels to channel group with namespace', function(done){
                var unique_suffix   = Date.now();
                var channels        = 'a,b,c';
                var namespace       = 'ns' + unique_suffix;
                namespaces.push(namespace);

                var channel_group   = namespace + ':' + 'r1' + unique_suffix;

                pubnub.channel_group_add_channel({
                    result : function(r) {
                        assert.deepEqual(r.data.status,200);
                        pubnub.channel_group_list_channels({
                            channel_group : channel_group,
                            result : function(r) {
                                assert.deepEqual(channels.split(','), r.data.channels);
                                done();
                            },
                            status    : function(r) {
                                assert.ok(false, "Error occurred in getting registry " + JSON.stringify(r));
                                done();
                            } 
                        });
                    },
                    error    : function(r) {
                        assert.ok(false, "Error occurred in adding channel to registry " + JSON.stringify(r));
                        done();
                    },
                    add      : true,
                    channels : channels,
                    channel_group : channel_group
                });

            })
        })
        describe('#channel_group_remove_channel()', function(){
            it('should be able to remove channels from channel group', function(done){
                var channels = 'a,b,c';
                var channel_group = 'r1' + Date.now();
                groups.push(channel_group);

                pubnub.channel_group_add_channel({
                    result : function(r) {
                        assert.deepEqual(r.data.status,200);
                        pubnub.channel_group_list_channels({
                            channel_group : channel_group,
                            result : function(r) {
                                assert.deepEqual(channels.split(','), r.data.channels);
                                pubnub.channel_group_remove_channel({
                                    result : function(r) {
                                        setTimeout(function(){
                                            pubnub.channel_group_list_channels({
                                                channel_group : channel_group,
                                                result : function(r) {
                                                    assert.deepEqual([], r.data.channels);
                                                    done();
                                                },
                                                status    : function(r) {
                                                    assert.ok(false, "Error occurred in getting group " + JSON.stringify(r));
                                                    done();
                                                } 
                                            });
                                        }, 5000);
                                    },
                                    status    : function(r) {
                                        assert.ok(false, "Error occurred in adding channel to group " + JSON.stringify(r));
                                        done();
                                    },
                                    channels : channels,
                                    channel_group : channel_group
                                });
                            },
                            status    : function(r) {
                                assert.ok(false, "Error occurred in getting group " + JSON.stringify(r));
                                done();
                            } 
                        });
                    },
                    status    : function(r) {
                        assert.ok(false, "Error occurred in adding channel to group " + JSON.stringify(r));
                        done();
                    },
                    channels : channels,
                    channel_group : channel_group
                });                    

            })
            it('should be able to remove channels to channel group with namespace', function(done){
                var unique_suffix   = get_random();
                var channels        = 'a,b,c';
                var namespace       = 'ns' + unique_suffix;
                var channel_group   = namespace + ':' + 'r1' + unique_suffix;
                namespaces.push(namespace);

                pubnub.channel_group_add_channel({
                    result : function(r) {
                        assert.deepEqual(r.data.status,200);
                        pubnub.channel_group_list_channels({
                            channel_group : channel_group,
                            result : function(r) {
                                assert.deepEqual(channels.split(','), r.data.channels);
                                pubnub.channel_group_remove_channel({
                                    result : function(r) {
                                        setTimeout(function(){
                                            pubnub.channel_group_list_channels({
                                                channel_group : channel_group,
                                                result : function(r) {
                                                    assert.deepEqual([], r.data.channels);
                                                    done();
                                                },
                                                status    : function(r) {
                                                    assert.ok(false, "Error occurred in getting group " + JSON.stringify(r));
                                                    done();
                                                } 
                                            });
                                        }, 5000);
                                    },
                                    status    : function(r) {
                                        assert.ok(false, "Error occurred in adding channel to group " + JSON.stringify(r));
                                        done();
                                    },
                                    channels : channels,
                                    channel_group : channel_group
                                });

                            },
                            status    : function(r) {
                                assert.ok(false, "Error occurred in getting group " + JSON.stringify(r));
                                done();
                            } 
                        });
                    },
                    status    : function(r) {
                        assert.ok(false, "Error occurred in adding channel to group " + JSON.stringify(r));
                        done();
                    },
                    channels : channels,
                    channel_group : channel_group
                });


            })
        })
        describe('#channel_group_list_groups()', function(){

            it('should be able to get all channel groups without namespace', function(done){
                var channels = 'a,b,c';
                var channel_group = 'r1' + Date.now();

                pubnub.channel_group_add_channel({
                    result : function(r) {
                        assert.deepEqual(r.data.status,200);
                        pubnub.channel_group_list_groups({
                            result : function(r) {
                                assert.ok(in_list_deep(r.data.groups, channel_group), "group not created");
                                done();
                            },
                            status    : function(r) {
                                assert.ok(false, "Error occurred in getting all group " + JSON.stringify(r));
                                done();
                            } 
                        });
                    },
                    status    : function(r) {
                        assert.ok(false, "Error occurred in adding channel to group " + JSON.stringify(r));
                        done();
                    },
                    channels : channels,
                    channel_group : channel_group
                });

            })
            it('should be able to get all channel groups with namespace', function(done){
                var unique_suffix   = Date.now();
                var channels        = 'a,b,c';
                var namespace       = 'ns' + unique_suffix;
                var channel_group   = namespace + ':' + 'r1' + unique_suffix ;

                pubnub.channel_group_add_channel({
                    result : function(r) {
                        assert.deepEqual(r.data.status,200);
                        pubnub.channel_group_list_groups({
                            namespace : namespace,
                            result : function(r) {
                                assert.ok(in_list_deep(r.data.groups, channel_group.split(':')[1]), "group not created");
                                done();
                            },
                            status    : function(r) {
                                assert.ok(false, "Error occurred in getting all group " + JSON.stringify(r));
                                done();
                            } 
                        });
                    },
                    status    : function(r) {
                        assert.ok(false, "Error occurred in adding channel to group " + JSON.stringify(r));
                        done();
                    },
                    channels : channels,
                    channel_group : channel_group
                });
            })
        })
        describe('#channel_group_remove_group()', function(){
            it('should be able to remove channel group', function(done){
                var unique_suffix   = Date.now();
                var channels        = 'a,b,c';
                var namespace       = 'ns' + unique_suffix;
                var channel_group   = namespace + ':' + 'r1' + unique_suffix;

                pubnub.channel_group_add_channel({
                    result : function(r) {
                        assert.deepEqual(r.data.status,200);
                        pubnub.channel_group_remove_group({
                            channel_group : channel_group,
                            result : function(r) {
                                pubnub.channel_group_list_groups({
                                    namespace : namespace,
                                    result : function(r) {
                                        assert.ok(!in_list_deep(r.data.groups, channel_group), "channel group not deleted");
                                        done();
                                    },
                                    status    : function(r) {
                                        assert.ok(false, "Error occurred in getting all registry " + JSON.stringify(r));
                                        done();
                                    } 
                                });
                            },
                            status    : function(r) {
                                assert.ok(false, "Error occurred in getting all registry " + JSON.stringify(r));
                                done();
                            } 
                        });
                    },
                    status    : function(r) {
                        assert.ok(false, "Error occurred in adding channel to registry " + JSON.stringify(r));
                        done();
                    },
                    channels : channels,
                    channel_group : channel_group
                });
            })
        })
        describe('#channel_group_remove_namespace()', function(){
            it('should be able to remove namespace', function(done){
                var unique_suffix   = Date.now();
                var channels        = 'a,b,c';
                var namespace       = 'ns' + unique_suffix;
                var channel_group   = namespace + ':' + 'r1' + unique_suffix;

                pubnub.channel_group_add_channel({
                    result : function(r) {
                        assert.deepEqual(r.data.status,200);
                        pubnub.channel_group_list_namespaces({
                            result : function(r) {
                                assert.ok(in_list_deep(r.data.namespaces, namespace), "namespace not created");
                                pubnub.channel_group_remove_namespace({
                                    namespace : namespace,
                                    result : function(r) {
                                        setTimeout(function(){
                                            pubnub.channel_group_list_namespaces({
                                                result : function(r) {
                                                    assert.ok(!in_list_deep(r.data.namespaces, namespace), "namespace not deleted");
                                                    done();
                                                },
                                                status    : function(r) {
                                                    assert.ok(false, "Error occurred in getting all registry " + JSON.stringify(r));
                                                    done();
                                                } 
                                            });
                                        }, 5000);
                                    },
                                    status    : function(r) {
                                        assert.ok(false, "Error occurred in getting all registry " + JSON.stringify(r));
                                        done();
                                    } 
                                });
                            },
                            status    : function(r) {
                                assert.ok(false, "Error occurred in getting all registry " + JSON.stringify(r));
                                done();
                            } 
                        });

                    },
                    status    : function(r) {
                        assert.ok(false, "Error occurred in adding channel to registry " + JSON.stringify(r));
                        done();
                    },
                    channels : channels,
                    channel_group : channel_group
                });
            })
        })
    })
    describe('#grant()', function(){
        var grant_channel = channel + '-grant';
        var auth_key = "abcd";
        var sub_key = 'ds-pam';
        var pubnub = PUBNUB.init({
            origin            : 'pubsub.pubnub.com',
            publish_key       : 'ds-pam',
            subscribe_key     : 'ds-pam',
            secret_key        : 'ds-pam',
            build_u       : true
        });
        for ( var i = 0; i < get_random(10); i++) {
            pubnub._add_param('a-' + get_random(1000) , Date.now());
        }

        before(function(){
            pubnub.revoke({
                result : function(r){}
            })
        })
        
        it('should be able to grant read write access', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    'channel' : grant_channel_local,
                    'auth_key' : auth_key,
                    read : true,
                    write : true,
                    result : function(response) {
                        pubnub.audit({
                            'channel' : grant_channel_local,
                            'auth_key' : auth_key,
                            result : function(response) {
                                assert.deepEqual(response.data.auths.abcd.r,1);
                                assert.deepEqual(response.data.auths.abcd.w,1);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : auth_key,
                                    'result' : function(response) {
                                        assert.ok(true);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'result': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.ok(false);
                                            }
                                        })
                                    },
                                    'status' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : auth_key,
                                            'result': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.ok(false);
                                                done();
                                            }
                                        })
                                    }

                                });
                            }
                        });

                    }
                })
            },5000);
        })
        
        it('should be able to grant read write access with space in auth key and channel', function(done) {
            var auth_key = "ab cd";
            var grant_channel_local = grant_channel + "   " + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    'auth_key' : auth_key,
                    read : true,
                    write : true,
                    result : function(response) {
                        pubnub.audit({
                            channel : grant_channel_local,
                            'auth_key' : auth_key,
                            result : function(response) {
                                assert.deepEqual(response.data.auths[auth_key].r,1);
                                assert.deepEqual(response.data.auths[auth_key].w,1);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : auth_key,
                                    'result' : function(response) {
                                        assert.ok(true);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'result': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.ok(false);
                                            }
                                        })
                                    },
                                    'status' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : auth_key,
                                            'result': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.ok(false);
                                                done();
                                            }
                                        })
                                    }

                                });
                            }
                        });

                    }
                })
            },5000);
        })

        
        it('should be able to grant read write access without auth key', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    read : true,
                    write : true,
                    result : function(response) {
                        pubnub.audit({
                            channel : grant_channel_local,
                            result : function(response) {
                                assert.deepEqual(response.data.channels[grant_channel_local].r,1);
                                assert.deepEqual(response.data.channels[grant_channel_local].w,1);
                                assert.deepEqual(response.data.subscribe_key,sub_key);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : "",
                                    'result' : function(response) {
                                        assert.ok(true);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : "",
                                            'message' : 'Test',
                                            'result': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.ok(false);
                                            }
                                        })
                                    },
                                    'status' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : "",
                                            'result': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.ok(false);
                                                done();
                                            }
                                        })
                                    }

                                });
                            }
                        });

                    }
                })
            },5000);
        })

        it('should be able to grant read access revoke write access', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    auth_key : auth_key,
                    read : true,
                    write : false,
                    result : function(response) {
                        pubnub.audit({
                            channel : grant_channel_local,
                            auth_key : auth_key,
                            result : function(response) {

                                assert.deepEqual(response.data.auths.abcd.r,1);
                                assert.deepEqual(response.data.auths.abcd.w,0);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : auth_key,
                                    'result' : function(response) {
                                        assert.ok(true)
                                        //console.log(JSON.stringify(response));
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'result': function(response) {
                                                //console.log(JSON.stringify(response));
                                                assert.ok(false);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                //console.log(JSON.stringify(response.data));
                                                assert.deepEqual(response.data.message, "Forbidden");
                                                in_list_deep(response.data.payload.channels,grant_channel_local);
                                                assert.ok(true);
                                                done();
                                            }
                                        })
                                    },
                                    'status' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : auth_key,
                                            'result': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.deepEqual(response.data.message, "Forbidden");
                                                in_list_deep(response.data.payload.channels,grant_channel_local);
                                                assert.ok(true);
                                                done();
                                            }
                                        })
                                    }

                                });

                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to revoke read access grant write access', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    auth_key : auth_key,
                    read : false,
                    write : true,
                    result : function(response) {
                        pubnub.audit({
                            channel : grant_channel_local,
                            auth_key : auth_key,
                            result : function(response) {
                                assert.deepEqual(response.data.auths.abcd.r,0);
                                assert.deepEqual(response.data.auths.abcd.w,1);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : auth_key,
                                    'result' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'result': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.ok(false);
                                                done()
                                            }
                                        })
                                    },
                                    'status' : function(response) {
                                        assert.ok(true);
                                        assert.deepEqual(response.data.message, "Forbidden");
                                        in_list_deep(response.data.payload.channels,grant_channel_local);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : auth_key,
                                            'result': function(response) {
                                                assert.ok(true)
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.ok(false);
                                                done();
                                            }
                                        })
                                    }

                                });

                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to revoke read and write access', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    auth_key : auth_key,
                    read : false,
                    write : false,
                    result : function(response) {
                        pubnub.audit({
                            channel : grant_channel_local,
                            auth_key : auth_key,
                            result : function(response) {
                                assert.deepEqual(response.data.auths.abcd.r,0);
                                assert.deepEqual(response.data.auths.abcd.w,0);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : auth_key,
                                    'result' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'result': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.ok(true);
                                                assert.deepEqual(response.data.message, "Forbidden");
                                                in_list_deep(response.data.payload.channels,grant_channel_local);
                                                done();
                                            }
                                        })
                                    },
                                    'status' : function(response) {
                                        assert.deepEqual(response.data.message, "Forbidden");
                                        in_list_deep(response.data.payload.channels,grant_channel_local);
                                        assert.ok(true);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : auth_key,
                                            'result': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.deepEqual(response.data.message, "Forbidden");
                                                in_list_deep(response.data.payload.channels,grant_channel_local);
                                                assert.ok(true);
                                                done();
                                            }
                                        })
                                    }

                                });

                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to revoke read and write access without auth key', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    read : false,
                    write : false,
                    result : function(response) {
                        pubnub.audit({
                            channel : grant_channel_local,
                            result : function(response) {
                                assert.deepEqual(response.data.channels[grant_channel_local].r,0);
                                assert.deepEqual(response.data.channels[grant_channel_local].w,0);
                                assert.deepEqual(response.data.subscribe_key,sub_key);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : "",
                                    'result' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : "",
                                            'message' : 'Test',
                                            'result': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.deepEqual(response.data.message, "Forbidden");
                                                in_list_deep(response.data.payload.channels,grant_channel_local);
                                                assert.ok(true);
                                                done();
                                            }
                                        })
                                    },
                                    'status' : function(response) {
                                        assert.ok(true);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : "",
                                            'result': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.deepEqual(response.data.message, "Forbidden");
                                                in_list_deep(response.data.payload.channels,grant_channel_local);
                                                assert.ok(true);
                                                done();
                                            }
                                        })
                                    }

                                });

                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to revoke read write access at sub key level', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            var auth_key = "abcd";
            var pubnub = PUBNUB.init({
                origin            : 'pubsub.pubnub.com',
                publish_key       : 'ds-pam',
                subscribe_key     : 'ds-pam',
                secret_key        : 'ds-pam',
                build_u       : true
            });

            setTimeout(function() {
                pubnub.grant({
                    read : false,
                    write : false,
                    result : function(response) {
                        pubnub.audit({
                            result : function(response) {
                                assert.deepEqual(response.data.subscribe_key,'ds-pam');
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : "",
                                    'result' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : "",
                                            'message' : 'Test',
                                            'result': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.deepEqual(response.data.message, "Forbidden");
                                                in_list_deep(response.data.payload.channels,grant_channel_local);
                                                assert.ok(true);
                                                done();
                                            }
                                        })
                                    },
                                    'status' : function(response) {
                                        assert.ok(true);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : "",
                                            'result': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.deepEqual(response.data.message, "Forbidden");
                                                in_list_deep(response.data.payload.channels,grant_channel_local);
                                                assert.ok(true);
                                                done();
                                            }
                                        })
                                    }

                                });

                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to grant read write access at sub key level', function(done) {
            var grant_channel_local = grant_channel + Date.now();
           // var auth_key = "abcd";
            var pubnub = PUBNUB.init({
                origin            : 'pubsub.pubnub.com',
                publish_key       : 'pam' ,
                subscribe_key     : 'pam' ,
                secret_key        : 'pam' ,
                build_u       : true
            });
            setTimeout(function() {
                pubnub.grant({
                    //auth_key : auth_key,
                    read : true,
                    write : true,
                    result : function(response) {
                        pubnub.audit({
                            //auth_key : auth_key,
                            result : function(response) {
                                assert.deepEqual(response.data.subscribe_key,'pam');
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'result' : function(response) {
                                        assert.ok(true);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'result': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.ok(false);
                                            }
                                        })
                                    },
                                    'status' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'result': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'status'   : function(response) {
                                                assert.ok(false);
                                                done();
                                            }
                                        })
                                    }

                                });
                            }
                        });

                    }
                })
            },5000);
        })
    })
})
