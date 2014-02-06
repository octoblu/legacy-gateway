var when = require('when');

var skynet = require('skynet');


function connect(gatewayId, token){
  console.log('connecting...');
  var defer = when.defer;


  var conn = skynet.createConnection({
    uuid: gatewayId,
    token: token,
    //"protocol": "mqtt",
    qos: 0 // MQTT Quality of Service (0=no confirmation, 1=confirmation, 2=not supported)
  });


  conn.on('notReady', function(data){
    console.log('UUID FAILED AUTHENTICATION!', data);
    when.reject(data);
  });

  conn.on('ready', function(data){
    when.resolve(conn);
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

  return defer.promise;


}

module.exports = connect;
