var when = require('when');
var http = require('http');
var path = require('path');
var express = require('express');

var routes = require('./routes');
var pluginRoute = require('./routes/plugins');

function launch(gatewayId, token, port, conn){

  function gatewayMiddleware(req, res, next){
    res.locals({
      token: token,
      uuid: gatewayId,
      conn: conn
    });
    next();
  }

  var app = express();
  var parser = express.json();

  // all environments
  app.set('port', port);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  //app.use(express.json());
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
  app.post('/subdevices', parser, pluginRoute.createSubdevice);
  app.put('/subdevices', parser, pluginRoute.updateSubdevice);
  app.delete('/subdevices/:name', pluginRoute.deleteSubdevice);
  app.post('/plugins/:name', pluginRoute.installPlugin);
  app.delete('/plugins/:name', pluginRoute.uninstallPlugin);
  app.put('/plugins/:name', pluginRoute.updatePlugin);

  var server = http.createServer(app);
  server.on('error', function(err){
    console.log('error launching webser...', err);
    process.exit(1);
  });
  server.listen(app.get('port'), function(){
    console.log('Skyent Gateway webserver listening at http://localhost:' + app.get('port'));
  });


}


module.exports = launch;
