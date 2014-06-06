var when = require('when');
var getToken = require('./lib/getToken');
var webserver = require('./webserver');
var sendLanIp = require('./lib/sendLanIp');
var subdevices = require('./lib/subdevices');
var getGatewayId = require('./lib/getGatewayId');
var connectSkynet = require('./lib/connectSkynet');


function launch(){


  var gatewayIdPromise = getGatewayId();
  var tokenPromise = getToken();
  var firstTimePromise = subdevices.firstTime();

  var connectionPromise = when.join(gatewayIdPromise, tokenPromise, firstTimePromise)
    .spread(connectSkynet)

    .then(function(skynetConnection){
      // updateIp();
      console.log('initializing subdevice instances...');
      var subdevicesMessenger = subdevices.initializeMessenger(skynetConnection);
      return subdevices.initializeInstances(subdevicesMessenger).yield(skynetConnection);
    })
    .then()
    .catch(function(err){
      console.log('error initializing this gateway', err);
      process.exit(1);
    });

  when.join(gatewayIdPromise, tokenPromise, connectionPromise)
    .spread(webserver);


}

module.exports = launch;
