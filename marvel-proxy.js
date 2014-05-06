/*
 * Simple reverse proxy for Marve API
 * =============================================================================
 * - Read more: http://developer.marvel.com/
 * - Store your API keys inside ./marvel-keys.json
 */

/*
 * Required modules
 * -----------------------------------------------------------------------------
 */
var express = require('express');
var app = express();
var querystring = require('querystring');
var md5 = require('MD5');
var http = require('http');

/*
 * Require the API key
 * -----------------------------------------------------------------------------
 */
var keys = require('./marvel-keys.json');

/*
 * CommonJS Export
 * -----------------------------------------------------------------------------
 */
module.exports = function(port, instanceId) {

  /*
   * Catch all GET requests
   * ---------------------------------------------------------------------------
   * - The Marvel API is read-only so only need to make GET requests
   */
  app.get('/*', function(proxyReq, proxyRes) {

    console.log('Received GET request to: '+proxyReq.url);

    /*
     * Assign stuff
     * -------------------------------------------------------------------------
     */
    var timestamp = Date.now();
    var path = '/v1/public';
    var query = proxyReq.url.indexOf('?') >= 0 ? '&' : '?';
    var params = {
      ts: timestamp,
      apikey: keys.publicApikey,
      hash: md5(timestamp+keys.privateApiKey+keys.publicApikey)
    };

    /*
     * Build the Marvel API call path
     * -------------------------------------------------------------------------
     */
    var apiPath = [path, proxyReq.url, query, querystring.stringify(params)].join('');

    /*
     * Setup the Marvel API call
     * -------------------------------------------------------------------------
     */
    var options = {
      hostname: 'gateway.marvel.com',
      port: 80,
      path: apiPath,
      agent: false
    }

    /*
     * Make API call to gateway.marvel.com and pass its response to our server
     * -------------------------------------------------------------------------
     */
    http.get(options, function (apiRes) {

      var apiResponseData = '';

      apiRes.setEncoding('utf8');

      apiRes.on('data', function (chunk) {
        apiResponseData += chunk;
      });

      apiRes.on('end', function () {
        proxyRes.send(apiResponseData);
      });

    }).on('error', function(e) {
      proxyRes.send("Got error: " + e.message);
    });

  });

  /*
   * Start the ExpressJS server
   * ---------------------------------------------------------------------------
   */
  app.listen(port, function() {
    console.log('Instance '+instanceId+' listening at port '+port+' ...');
  });

}
