var db = require('./iddb');
var uuid = require('uuid');

function getGatewayId(){
  return db.findOne({name: 'gatewayId'})
  .then(function(storedId){
    if(storedId){
      console.log('using stored gateway uuid', storedId);
      return storedId;
    }

    var gatewayId = uuid.v4();
    console.log('storing new gateway uuid',  gatewayId);
    return db.insert({name: 'gatewayId', value: gatewayId})
    .then(function(){
      return db.findOne({name: 'gatewayId'});
    });

  });
}

module.exports = getGatewayId;
