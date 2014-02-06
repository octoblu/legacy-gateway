var when = require('when');

var db = require('./lib/level');
var register = require('./lib/register');
var getToken = require('./lib/getToken');
var sendLanIp = require('./lib/sendLanIp');
var getGatewayId = require('./lib/getGatewayId');
var connectSkynet = require('./lib/connectSkynet')



var gatewayId;
var token;



getGatewayId()
.then(function(storedId){
  gatewayId = storedId;
  return getToken();
})
.then(function(storedToken){
  token = storedToken;
  return register(gatewayId, token);
})
.then(function(){
  return connectSkynet(gatewayId, token);
})
.then(function(conn){
  //do skynet things
})
.otherwise(function(err){
  console.log('error initializing this gateway', err);
});


function updateIp(){
  sendLanIp(gatewayId,token);
  setTimeout(updateIp, 1000 * 3600);
}




