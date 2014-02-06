var db = require('./level');
var uuid = require('uuid');


function getGatewayId(){
  return db.get('gatewayId')
  .then(function(storedId){
    console.log('using stored gateway uuid', storedId);
    return storedId;
  },function(err){
    var gatewayId = uuid.v4();
    console.log('storing new gateway uuid',  gatewayId);
    db.put('gatewayId', gatewayId)
      .then(function(){
        return db.get('gatewayId');
      });
  });
}

module.exports = getGatewayId;
