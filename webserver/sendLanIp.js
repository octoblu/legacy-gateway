var ip = require('ip');
var rest = require('../lib/restCall');

function sendLanIp(gatewayId, token, port, skynet){
  rest({
      path: 'ipaddress',
      method: 'GET'
  })
  .then(function(resp){
    resp = JSON.parse(resp);
    var myIp = ip.address();
    var updateInfo = {
      uuid: gatewayId,
      token: token,
      port: port,
      localhost: myIp,
      ipAddress: resp.ipAddress,
      type: 'gateway',
      online: 'true'
    };

    console.log('updating ip', updateInfo);

    // Update device
    skynet.update(updateInfo, function (data) {
      console.log('updated lan ip', data);
    });
  }, function(err){
    console.log('error updating ip', err);
  });


}

module.exports = sendLanIp;
