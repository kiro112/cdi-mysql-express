const cluster  = require('cluster');
const cpuCount = require('os').cpus().length;
const winston  = require('winston').cli();

let i = cpuCount;

// Listen for dying workers
cluster.on('exit', function(worker, code, signal) {
    winston.log('Worker ' + worker.process.pid + ' died with cpu_number: ' + worker.cpu_number);
    winston.log('Starting a new worker');
    cluster.fork({cpu_number: worker.cpu_number});
});

if (cluster.isMaster) {

    try {
        if (!process.argv[2]) {
            winston.error('Usage: node cluster.js server.js');
            process.exit();
        }
       require.resolve(__dirname + '/' + process.argv[2]);
    } catch (e) {
        winston.error('Script to server is missing');
        process.exit();
    }

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
    require(__dirname + '/' + process.argv[2]);
} 

