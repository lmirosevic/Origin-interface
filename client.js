//
//  client.js
//  origin-service-interface
//
//  Created by Luka Mirosevic on 05/06/2014.
//  Copyright (c) 2014 Goonbee. All rights reserved.
//

var nconf = require('./lib/config'),
    coffeeResque = require('coffee-resque'),
    url = require('url'),
    path = require('path'),
    _ = require('underscore'),
    toolbox = require('gb-toolbox');

/* Main */

var Client = function() {
  var resque;

  this.connect = function(redisURL) {
    var parsedUrl = url.parse(redisURL);
    var connectionOptions = {};
    if (!_.isNull(parsedUrl.hostname)) connectionOptions.host = parsedUrl.hostname;
    if (!_.isNull(parsedUrl.port)) connectionOptions.port = parsedUrl.port;
    if (!_.isNull(parsedUrl.auth)) connectionOptions.password = parsedUrl.auth.split(':')[1];
    if (!_.isNull(parsedUrl.pathname)) connectionOptions.database = parsedUrl.pathname.split('/')[1];
    console.log('Attempting connection to Redis for Origin interface...');
    resque = coffeeResque.connect(connectionOptions);
    resque.redis.on('error', function(err) {
        console.error('Error occured on Origin interface Redis', err);
    });
    resque.redis.on('reconnecting', function(err) {
      console.log('Attempting reconnection to Redis for Origin interface...');
    });
    resque.redis.retry_max_delay = nconf.get('MAX_RECONNECTION_TIMEOUT');

    return resque.redis;
  };

  this.set = function(channel, value, callback) {
    toolbox.requiredArguments(channel, value);

    // convert the input into a update object that the origin service expects
    var update = {
      channel: channel,
      value: value
    };

    // send the state update off
    resque.enqueue(nconf.get('QUEUE'), 'OriginUpdateJob', [update], function(err, remainingJobs) {
      toolbox.callCallback(callback, err);
    });
  };
};
var client = module.exports = new Client();

// Payload format (egress)
//
// {
//   channel: 'wcsg.score.crovsbra',    // any unique string
//   value: _                           // any valid JSON object
// }
