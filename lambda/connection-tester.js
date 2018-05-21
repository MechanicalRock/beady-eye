// lambda connection tester
'use strict';

/**
 * Test connection to a destination host/port.
 *
 * @param {Object} event The lambda event object. Required properties:
 *          endpointAddress - the host address to connect to
 *          endpointPort - the destination port on endpointAddress to connect to
 * @param {Object} context The lambda context object
 * @param {Function} callback A callback method to signal the completion
 *          lambda function
 * @param {Object} ext Extended properties containing references to injected
 *        properties such as config, logger, etc.
 */
exports.connect = function(event, context, callback) {

    if (!event || !event.endpointAddress || !event.endpointPort) {
        return callback(new Error("Connection failed.  Event data missing"));
    }

    if (!isInt(event.endpointPort)) {
        return callback(new Error('Connection failed.  Event data malformed: "destinationPort" should be an integer'));
    }

    var socket = new require('net').Socket().setTimeout(1000);

    var connectionSuccessful = false;

    socket.on('error', function() {
        socket.end();
        fail(event, context, callback);
    }).on('timeout', function() {
        socket.end();
        fail(event, context, callback);
    });
    socket.connect(event.endpointPort, event.endpointAddress, function() {
        socket.end();
        callback(null, {
            result: true
        });
    })

};

function fail(event, context, callback) {
    const util = require('util');
    var msg = util.format("Connection failed to %s:%s", event.endpointAddress, event.endpointPort)
    callback(new Error(msg));
}

// Short-circuiting, and saving a parse operation
function isInt(value) {
    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}