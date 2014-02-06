var ip = require('ip');

function sendLanIp(gatewayId, token){
  var myIp = ip.address();
  console.log('sending my ip', myIp);
  return rest({
    path: 'ip',
    params: {
      token: token,
      uuid: gatewayId,
      ip: myIp
    },
    method: 'POST'
  });


}

module.exports = sendLanIp;
