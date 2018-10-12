// lambda connection tester that returns the http response
'use strict';
var request = require('request-promise-native');
/**
 * Establishes connection to a destination URL and returns the response.
 *
 * @param {Object} event The lambda event object. Required properties:
 *          Uri
 *          failOnHTTP
 *          timeout
 *
 * @param {Object} context The lambda context object
 * @param {Function} callback A callback method to signal the completion
 *          lambda function
 * @param {Object} ext Extended properties containing references to injected
 *        properties such as config, logger, etc.
 */

exports.connect = function(event, context, callback) {
    if (!event.Uri) {
        return callback(new Error("Invalid call: Event data missing : Uri"));
    }

    var options = {
        uri: event.Uri,
        resolveWithFullResponse: true,
        timeout: event.timeout || 20,
    };
    
    request(options).then(function(response) {
        if (event.failOnHTTP && !response.header.location.startsWith("https://")) {
            return callback(new Error("Redirected to non-HTTPS URL"));
        }

        return callback(null, { result: true});
    }).catch(function(error) {
        return callback(error);
    });
};