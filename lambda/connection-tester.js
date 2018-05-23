// lambda connection tester
'use strict';
var net = require('net');
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
        return callback(new Error("Invalid call: Event data missing"));
    }

    if (!isInt(event.endpointPort)) {
        return callback(new Error('Invalid call:  Event data malformed: "destinationPort" should be an integer'));
    }

    var connectionSuccessful = false;
    var timeoutRef = undefined;

    var socket = net.createConnection(event.endpointPort, event.endpointAddress);
    socket.on('error', function() {
        clearTimeout(timeoutRef);
        socket.end();
        fail(event, callback);
    });
    socket.on('connect', function() {
        clearTimeout(timeoutRef);
        try{
            socket.end();
        } catch (e) {
            socket.destroy();
        }
        callback(null, {result: true});
    });

    if (event.connectionTimeout_ms) {
        timeoutRef = setTimeout(function() {
            try{
                socket.end();
            } catch (e) {
                console.log('Error ending socket');
                console.log(e);
            }
            socket.destroy();
            callback(null, {result: false});
        }, event.connectionTimeout_ms);
    }
};

function fail(event, callback) {
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