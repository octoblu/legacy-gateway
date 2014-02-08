var ip = require('ip');

function sendLanIp(gatewayId, token, port, skynet){
  var myIp = ip.address();

  // Update device
  skynet.update({
    uuid: gatewayId,
    token: token,
    port: port,
    localhost: myIp
  }, function (data) {
    console.log('updated lan ip', data);
  });

}

module.exports = sendLanIp;
