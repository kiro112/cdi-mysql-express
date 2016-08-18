const cluster  = require('cluster');
const cpuCount = require('os').cpus().length;
const winston  = require('winston').cli();
const server   = 'server.js';


if (cluster.isMaster) {

    // Fork all the machine's cpus
    for (i = 0; i < cpuCount; i++) {
        cluster.fork({cpu_number: i});
    }

    // Add cpu number to each workers
    Object.keys(cluster.workers).forEach(function (id) {
        let worker = cluster.workers[id];
        worker.cpu_number = --id;
    });
    
} else {
    require(__dirname + '/' + server);
} 

// Listen for dying workers
cluster.on('exit', function(worker, code, signal) {
    let cpu      = worker.cpu_number;

    console.log('Worker ' + worker.process.pid + ' died with cpu_number: ' + cpu);
    console.log('Starting a new worker');
    cluster.fork({cpu_number: cpu}).on('online', () => {

        let workers  = cluster.workers,
        keys         = Object.keys(workers);
        
        // Get the last element of cluster workers 
        // and assign its cpu number
        workers[ keys[ keys.length - 1 ] ].cpu_number = cpu;

    });
});
