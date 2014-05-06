/*
 * Simple reverse proxy for Marve API
 * =============================================================================
 * This file only handles the Node cluster initalization,
 * see marvel-proxy.js for the real thing
 */


/*
 * Intialization
 * -----------------------------------------------------------------------------
 * - Set port (either by command line argument or default to 3004)
 * - get number of CPUs
 */
var port = parseInt(process.argv[2], 10) || 3004;
var numCPUs = require('os').cpus().length;

/*
 * Require modules
 * -----------------------------------------------------------------------------
 */
var cluster = require('cluster');
var http = require('http');
var marvelProxy = require('./marvel-proxy.js');

/*
 * Manage cluster
 * -----------------------------------------------------------------------------
 */
if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart workers if they die
  cluster.on('exit', function(worker, code, signal) {
    console.log('worker %d died (%s). restarting...',
      worker.process.pid, signal || code);
    cluster.fork();
  });

} else {
  // start service instances
  marvelProxy(port, cluster.worker.id);
}


