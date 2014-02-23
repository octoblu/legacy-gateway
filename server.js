var db = require('./lib/level');
var getToken = require('./lib/getToken');
var webserver = require('./webserver');
var sendLanIp = require('./lib/sendLanIp');
var subdevices = require('./lib/subdevices');
var getGatewayId = require('./lib/getGatewayId');
var connectSkynet = require('./lib/connectSkynet');



var gatewayId;
var token;
var port = process.env.PORT || 8888;
var conn;
var subdevicesMessenger;

function updateIp(){
  sendLanIp(gatewayId, token, port, conn);
  setTimeout(updateIp, 1000 * 3600);
}

getGatewayId()
.then(function(storedId){
  gatewayId = storedId.value;
  return getToken();
})
.then(function(storedToken){
  token = storedToken.value;
  console.log('connecting to skynet...');
  return subdevices.firstTime();
})
.then(function(){
  return connectSkynet(gatewayId, token);
})
.then(function(skynetConnection){
  conn = skynetConnection;
  console.log('initializing subdevice instances...');
  subdevicesMessenger = subdevices.initializeMessenger(conn);
  return subdevices.initializeInstances(subdevicesMessenger);
})
.then(function(instances){
  console.log('subdevice instances', instances);
  console.log('starting webserver...');
  webserver(gatewayId, token, port, conn);
  console.log('starting ip updater...');
  updateIp();
})
.otherwise(function(err){
  console.log('error initializing this gateway', err);
  process.exit(1);
});

