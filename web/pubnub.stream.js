PUBNUB.stream = function (setup) {
    var SUB_KEY     = setup.subscribe_key || "demo"
    ,   PUB_KEY     = setup.publish_key || "demo"
    ,   AUTH_KEY    = setup.auth_key || ""
    ,   SSL         = setup.ssl ? "s" : ""
    ,   ORIGIN      = "http" + SSL + "://" +
            (setup.origin || "hyper-streaming.pubnub.com") + "/"
    ,   CHANNELS    = {}
    ,   UUID        = setup.uuid || PUBNUB.db.get(SUB_KEY + "uuid")
    ,   PNSDK       = "PubNub-JS-HyperStreaming/1.0"
    ,   TIME_DRIFT  = Infinity;

    /*
     * Create a CORS XMLHttpRequest object
     */
    function XHR(){
        try {
            return new XMLHttpRequest();
        }
        catch (e1) {
            try {
                return new XDomainRequest();
            }
            catch (e2) {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            }
        }
    }

    /*
     * Calculate latency
     */
    function calc_latency(timetoken, now) {
        var server_time = timetoken / 10000;

        TIME_DRIFT = Math.min(TIME_DRIFT, now - server_time);

        return (now - TIME_DRIFT) - server_time;
    }

    /*
     * Make URL from array
     */
    function make_url(components, params) {
        var query = "?"
        PUBNUB.each(params, function (k, v) {
            query += encodeURIComponent(k) + "=";
            query += encodeURIComponent(v) + "&"
        });

        return ORIGIN + components.map(function (component) {
            return encodeURIComponent(component);
        }).join("/") + query.substr(0, query.length - 1);
    }

    /*
     * Empty callback
     */
    function empty_cb() {}

    /*
     * Close XHR
     */
    function close(xhr) {
        xhr.abort && xhr.abort();
        xhr.onerror = null;
        xhr.onreadystatechange = null;
    }

    /*
     * Set or change auth key
     */
    function auth(key) {
        AUTH_KEY = key;
    }

    /*
     * Subscribe
     */
    function subscribe(options) {
        var channel         = options.channel
        ,   message_cb      = options.callback || options.message
        ,   auth_key        = options.auth_key || AUTH_KEY
        ,   connect_cb      = options.connect || empty_cb
        // TODO: Support reconnect and disconnect callbacks on network failures
        ,   reconnect_cb    = options.reconnect || empty_cb
        ,   disconnect_cb   = options.disconnect || empty_cb
        ,   error_cb        = options.error || empty_cb
        ,   req_timetoken   =+options.timetoken || 0
        ,   max_buffer      = options.max_buffer || 1024 * 1024 // Bytes
        // TODO: Support timeout
        ,   timeout         = options.timeout || 30000
        ,   reconnecting    = false;

        // Required options
        if (!message_cb || !channel || !SUB_KEY) return false;

        var xhr = XHR();

        // Set the timetoken for this connection
        options.timetoken = req_timetoken;

        // Streaming buffer
        var index   = 0;

        /*
         * Reconnect this socket
         */
        function reconnect() {
            if (!reconnecting && xhr && !xhr.unsubscribed) {
                reconnecting = true;
                subscribe(options);
                close(xhr);
            }
        }

        /*
         * Receive and process incoming packets
         */
        function recv(data) {
            var packet          = ""
            ,   end             = -1
            ,   count           = 0
            ,   messages        = []
            ,   message         = undefined
            ,   envelope        = undefined
            ,   chan            = ""
            ,   latency         = 0
            ,   recv_timetoken  = 0;

            if (!data) return 0;

            // Get as many messages as possible
            do {
                end = data.indexOf("\n");
                if (end < 0) {
                    end = data.length;
                }
                end = Math.min(end + 1, data.length);
                packet = data.substr(0, end);

                try {
                    envelope = JSON.parse(packet);
                }
                catch (e) {
                    if (end < data.length) {
                        error_cb(e, packet);
                        return count + end;
                    }
                    
                    return count;
                }

                // Remove processed packet
                data = data.substr(end);
                count += end;

                if (Array.isArray(envelope)) {
                    messages        = envelope[0];
                    recv_timetoken  =+envelope[1];
                    chan            = envelope[2] || channel;
                    latency         = calc_latency(recv_timetoken, Date.now());

                    // Update the timetoken for this connection
                    options.timetoken = recv_timetoken;
                }

                if (envelope.error) {
                    error_cb(envelope);
                }
                else {
                    messages.forEach(function (message) {
                        message_cb(message, envelope, chan, latency);
                    });
                }
            } while (data.length);

            return count;
        }

        var url = make_url([ "stream", SUB_KEY, channel, 0, req_timetoken ], {
            "auth_key"  : auth_key,
            "uuid"      : UUID,
            "PNSDK"     : PNSDK
        });

        xhr.onerror = error_cb;
        xhr.onreadystatechange = function () {
            switch (xhr.readyState) {
            // HEADERS_RECEIVED
            case 2:
                if (!req_timetoken) {
                    connect_cb();
                }
                break;

            // LOADING
            case 3:
                var data = xhr.responseText.substr(index);
                if (xhr.status === 200 && data) {
                    index += recv(data);

                    /*
                     * Cycle the connection when we've hit the max buffer size.
                     * This prevents dragging bottom from skipping processed
                     * bytes in responseText for every message.
                     */
                    if (index >= max_buffer) {
                        reconnect();
                    }
                }
                break;

            // DONE
            case 4:
                if (xhr.status === 200) {
                    recv(xhr.responseText.substr(index));
                    reconnect();
                }
                else {
                    recv(xhr.responseText);
                    // Retry after 1 second
                    setTimeout(function () {
                        reconnect();
                    }, 1000);
                }
                break;
            }
        }
        xhr.open("GET", url, true);
        xhr.send();

        // Record channels
        channel.split(",").forEach(function (chan) {
            if (chan) {
                CHANNELS[chan] = {
                    "xhr"           : xhr,
                    "disconnect_cb" : disconnect_cb
                };
            }
        });

        return true;
    }

    /*
     * Unsubscribe
     */
    function unsubscribe(options) {
        var channels        = options.channel.split(",")
        ,   unsubscribed    = false;

        // TODO: Properly support multiplexing
        channels.forEach(function (channel) {
            if (channel && channel in CHANNELS) {
                unsubscribed = true;

                // Mark connection as unsubscribed and close it
                var xhr = CHANNELS[channel].xhr;
                xhr.unsubscribed = true;
                close(xhr);

                // Fire disconnect callback
                CHANNELS[channel].disconnect_cb(channel);

                // Forget this channel
                delete CHANNELS[channel];

            }
        });

        return unsubscribed;
    }

    /*
     * Public API
     */
    return {
        "auth"          : auth,
        "subscribe"     : subscribe,
        "unsubscribe"   : unsubscribe
    };
};
