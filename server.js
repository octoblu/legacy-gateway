var cluster = require('cluster');
var launch = require('./launcher');

if (cluster.isMaster) {
  cluster.fork();

  cluster.on('exit', function(deadWorker, code, signal) {
    console.log('exited code, signal', code, signal);
    if(code == 42){
      // Restart the worker
      var worker = cluster.fork();

      // Note the process IDs
      var newPID = worker.process.pid;
      var oldPID = deadWorker.process.pid;

      // Log the event
      console.log('worker '+oldPID+' died.');
      console.log('worker '+newPID+' born.');
    }

  });
} else {
  launch();
}
