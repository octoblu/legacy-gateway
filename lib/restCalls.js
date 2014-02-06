var rest = require('rest');

var errorCodeInterceptor = require('rest/interceptor/errorCode');
var pathPrefixInterceptor = require('rest/interceptor/pathPrefix');
var entityInterceptor = require('rest/interceptor/entity');
var mimeInterceptor = require('rest/interceptor/mime');

var restCall = rest
  .chain(pathPrefixInterceptor, { prefix: 'http://skynet.im/'})
  //.chain(mimeInterceptor, {mime:'applicaiton/json', accept: 'applicaiton/json'})
  //.chain(interceptor)
  .chain(entityInterceptor)
  .chain(errorCodeInterceptor);

module.exports = function(restConfig){
  return restCall(restConfig);
};
