var rest = require('./restCall');

function register(gatewayId, token){
  return rest({
    path: 'devices',
    params: {
      token: token,
      uuid: gatewayId,
      type: 'gateway'
    },
    method: 'POST'
  })
  .then(function(regData){
    console.log('reg resp', regData);
    return regData;
  });
}

module.exports = register;
