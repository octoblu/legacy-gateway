var when = require('when');

var skynet = require('skynet');

var subdevices = require('./subdevices');
var remoteConfig = require('./remoteConfig');

var registerRetries = 0;
var retriesMax = 10;

function connect(gatewayId, token){
  console.log('connecting...');
  var defer = when.defer();


  var conn = skynet.createConnection({
    uuid: gatewayId,
    token: token,
    //protocol: "mqtt",
    qos: 0 // MQTT Quality of Service (0=no confirmation, 1=confirmation, 2=not supported)
  });



  conn.on('notReady', function(data){
    console.log('UUID FAILED AUTHENTICATION!', data);
    // Register device
    conn.register({
      uuid: gatewayId,
      token: token
    }, function (data) {
      console.log('registered', data);
      conn.emit('ready', data);
      defer.resolve(conn);
    });
  });

  conn.on('ready', function(data){
    defer.resolve(conn);
    console.log('UUID AUTHENTICATED!', data);

    conn.on('message', function(channel, message){
      console.log('message received channel=', channel, ' message=', message);
      if(channel == gatewayId){
        console.log('message for gateway');

        try{

          if(typeof message == "string"){
            message = JSON.parse(message);
          }

          if(message.subdevice){
            console.log('looking for subdevice',message.subdevice, 'in', subdevices.instances );
            var instance = subdevices.instances[message.subdevice];

            if(instance){
              //console.log('matching subdevice found!', instance);
              instance.onMessage(message);
            }
          }

        }catch(exp){
          console.log('err dispatching message', exp);
        }

      }

    });


    // Event triggered when device loses connection to skynet
    conn.on('disconnect', function(data){
      console.log('disconnected from skynet');
    });

    // handle gateway configuration requests
    conn.on('config', function(data, cb){
      remoteConfig(token, data, cb);
    });


    //WhoAmI?
    conn.whoami({uuid:gatewayId}, function (data) {
      console.log('whoami', data);
    });




  });

  return defer.promise;


}

module.exports = connect;
