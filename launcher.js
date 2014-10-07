var when = require('when');
var getToken = require('./lib/getToken');
var webserver = require('./webserver');
var subdevices = require('./lib/subdevices');
var getGatewayId = require('./lib/getGatewayId');
var connectSkynet = require('./lib/connectSkynet');


function launch(options){
    options = options || {};

    return when.join(getGatewayId(), getToken(), subdevices.firstTime())
    .spread(connectSkynet)
    .then(function(skynetConnection){
      console.log('initializing subdevice instances...');
      var subdevicesMessenger = subdevices.initializeMessenger(skynetConnection);
      return subdevices.initializeInstances(subdevicesMessenger).yield(skynetConnection);
    })
    .then(function(conn){
      if(options.skipWebserver){
        return conn;
      }
      return webserver(conn);
    })
    .catch(function(err){
      console.log('error initializing this gateway', err);
      process.exit(1);
    });

}

module.exports = launch;
