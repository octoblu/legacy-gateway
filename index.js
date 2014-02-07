var when = require('when');
var http = require('http');
var path = require('path');
var express = require('express');
var npm = require('npm');

var routes = require('./routes');
var pluginRoute = require('./routes/plugins');

var db = require('./lib/level');
var register = require('./lib/register');
var getToken = require('./lib/getToken');
var sendLanIp = require('./lib/sendLanIp');
var subdevices = require('./lib/subdevices');
var getGatewayId = require('./lib/getGatewayId');
var connectSkynet = require('./lib/connectSkynet');



var gatewayId;
var token;
var port = process.env.PORT || 8888;
var conn;
var subdevicesMessenger;


getGatewayId()
.then(function(storedId){
  gatewayId = storedId;
  return getToken();
})
.then(function(storedToken){
  token = storedToken;
  console.log('registering...');
  return register(gatewayId, token);
})
.then(subdevices.firstTime)
.then(function(){
  console.log('connecting to skynet...');
  return connectSkynet(gatewayId, token);
})
.then(function(skynetConnection){
  conn = skynetConnection;
  return conn;
})
.then(function(){
  subdevicesMessenger = {
    conn: conn,
    send: function(message){
      //TODO local dispatch if message is for local plugin instance
      this.conn.message(message);
    }
  };
  return subdevices.initializeInstances(subdevicesMessenger);
})
.then(function(instances){
  console.log('subdevice instances', instances);
  createWebserver();
})
.otherwise(function(err){
  console.log('error initializing this gateway', err);
  process.exit(1);
});

function gatewayMiddleware(req, res, next){
  console.log('my middleware');
  res.locals({
    token: token,
    uuid: gatewayId,
    conn: conn
  });
  next();
}

function createWebserver(){
  var app = express();

  // all environments
  app.set('port', port);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(gatewayMiddleware);
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));


  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  app.get('/', routes.index);
  app.get('/plugins', pluginRoute.plugins);
  app.get('/subdevices', pluginRoute.subdevices);

  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}


function updateIp(){
  sendLanIp(gatewayId, token, port);
  setTimeout(updateIp, 1000 * 3600);
}




