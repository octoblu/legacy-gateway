var when = require('when');
var _ = require('lodash');
var skynet = require('skynet');

var subdevices = require('./subdevices');
var remoteConfig = require('./remoteConfig');

var registerRetries = 0;
var retriesMax = 10;


function connect(gatewayId, token){
  var defer = when.defer();


  
  var  skynetConfig = {
    uuid: process.env.GW_UUID || gatewayId,
    token: process.env.GW_TOKEN || token,
    server: process.env.SKYNET_SERVER,
    port: process.env.SKYNET_PORT
  };
  
   
    
    
  console.log('connecting to skynet with', skynetConfig);

  var conn = skynet.createConnection(skynetConfig);
  conn.uuid = gatewayId;
  conn.token = token;

  var handlersRegistered = false;



  conn.on('notReady', function(data){
    console.log('UUID FAILED AUTHENTICATION!', data);
    // Register device
    conn.register({
      uuid: gatewayId,
      token: token,
      type: 'gateway'
    }, function (data) {
      console.log('registered', data);
      conn.emit('ready', data);
      defer.resolve(conn);
    });
  });

  conn.on('ready', function(data){
    defer.resolve(conn);
    console.log('UUID AUTHENTICATED!', data);

    if(!handlersRegistered){
      conn.on('message', function(data, fn){
        console.log('\nmessage received from:', data.fromUuid, data);
        if(data.devices){

          var subdevice;
          if(data.devices === gatewayId){
            subdevice = data.subdevice;
          }else if(data.devices !== '*' && data.devices !== 'all'){
            //was messaged as hub_uuid/subdevice_id
            subdevice = data.devices;
          }

          try{
            //console.log(data);
            if(typeof data == "string"){
              data = JSON.parse(data);
            }

            if(subdevice){

              var instance = subdevices.instances[subdevice];
              if(!instance){
                _.forEach(_.values(subdevices.instances), function(sub){
                  if(sub.uuid === subdevice){
                    instance = sub;
                  }
                });
              }

              if(instance && instance.onMessage){
                console.log('matching subdevice found:', subdevice);
                instance.onMessage(data, fn);
              }else{
                console.log('no matching subdevice:', subdevice);
              }
            }else{
              if(fn){
                console.log('responding');
                fn('hello back at you');
              }
            }

          }catch(exp){
            console.log('err dispatching message', exp);
          }

        }

      });

      // handle gateway configuration requests
      conn.on('config', function(data, cb){
        console.log('config api call received:', data, cb);
        remoteConfig(token, data, cb);
      });

      handlersRegistered = true;

    }else{
      console.log('hanlders already registered, just reconnected to skynet');
    }



    // Event triggered when device loses connection to skynet
    conn.on('disconnect', function(data){
      console.log('disconnected from skynet');
    });



    //WhoAmI?
    conn.whoami({uuid:gatewayId}, function (data) {
      console.log('whoami', data);
    });



  });

  return defer.promise;


}

module.exports = connect;
