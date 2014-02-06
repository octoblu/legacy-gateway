var rest = require('rest');

var errorCodeInterceptor = require('rest/interceptor/errorCode');
var pathPrefixInterceptor = require('rest/interceptor/pathPrefix');
var entityInterceptor = require('rest/interceptor/entity');

var restCall = rest
  .chain(pathPrefixInterceptor, { prefix: 'http://skynet.im/'})
  .chain(entityInterceptor)
  .chain(errorCodeInterceptor);

module.exports = function(restConfig){
  return restCall(restConfig);
};
