var db = require('./iddb');
var uuid = require('uuid');

function getGatewayId(){
  return db.findOne({name: 'gatewayId'})
  .then(function(storedId){
    if(storedId){
      console.log('using stored gateway uuid', storedId);
      return storedId.value;
    }

    var gatewayId = uuid.v4();
    console.log('storing new gateway uuid',  gatewayId);
    return db.insert({name: 'gatewayId', value: gatewayId}).yield(gatewayId);

  });
}

module.exports = getGatewayId;
