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
  });
}

module.exports = register;
