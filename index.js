var skynet = require('skynet');
var uuid = require('uuid');
var db = require('./lib/level');
var when = require('when');
var rest = require('./lib/restCalls');



var gatewayId;
var token;

function register(){
  return rest({
    path: 'devices',
    params: {
      token: token,
      uuid: gatewayId,
      type: 'gateway'
    },
    method: 'POST'
  });
}

function getGatewayId(){
  return db.get('gatewayId')
  .then(function(storedId){
    gatewayId = storedId;
    console.log('using stored gateway uuid', gatewayId);
    return gatewayId;
  },function(err){
    gatewayId = uuid.v4();
    console.log('storing new gateway uuid',  gatewayId);
    db.put('gatewayId', gatewayId)
      .then(function(){
        return db.get('gatewayId');
      });
  });
}

function getToken(){
  return db.get('token')
  .then(function(storedToken){
    token = storedToken;
    console.log('using stored token', token);
    return storedToken;
  }, function(err){
    token = uuid.v4().replace(/-/g, '').substring(0,31);
    console.log('storing new token',  token);
    return db.put('token', token)
      .then(function(){
        return db.get('token');
      });
  });
}






function connect(blah){
  console.log('connecting...');


  var conn = skynet.createConnection({
    uuid: gatewayId,
    token: token,
    //"protocol": "mqtt",
    qos: 0 // MQTT Quality of Service (0=no confirmation, 1=confirmation, 2=not supported)
  });


  conn.on('notReady', function(data){
    console.log('UUID FAILED AUTHENTICATION!', data);
  });

  conn.on('ready', function(data){
    console.log('UUID AUTHENTICATED!', data);

   // Subscribe and unsubscribe to a red lights from heroku app
    conn.subscribe( {
      "uuid": "0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc",
      "token": "qirqglm6yb1vpldixflopnux4phtcsor"
    }, function (data) {
      console.log(data);
    });

    conn.on('message', function(channel, message){
      console.log('message received', channel, message);
    });

    conn.emit('message', {
        "devices": "all",
        "message": {
        "skynet":"gateway online"
      }}, function(data){
        console.log(data);
      });

    // Event triggered when device loses connection to skynet
    conn.on('disconnect', function(data){
      console.log('disconnected from skynet');
    });



    // WhoAmI?
    conn.whoami({uuid:gatewayId}, function (data) {
      console.log('whoami', data);
    });


    // Skynet status
    conn.status(function (data) {
      console.log('status', data);
    });



  });



}

getGatewayId()
.then(getToken)
.then(register)
.then(connect)
.otherwise(function(err){
  console.log('error initializing this gateway', err);
});



