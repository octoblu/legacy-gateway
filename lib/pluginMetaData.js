var _ = require('lodash');
var npm = require('npm');
var when = require('when');

function getAll(){
  var defer = when.defer();

  npm.load({depth:0, silent: true}, function(err, blah){
    if(err){
      defer.reject(err);
    }else{
      npm.commands.ls(function(err, data, lite){
        if(err){
          defer.reject(err);
        }
        else{
          var plugins = _.filter(data.dependencies, function(dep){
            return _.contains(dep.keywords, 'skynet-plugin');
          });
          defer.resolve(plugins);
        }

      });
    }


  });

  return defer.promise;
}

function getPlugin(name){
  return getAll()
  .then(function(plugins){
    var plugin;
    _.forEach(plugins, function(p){
      if(p.name == name){
        plugin = p;
      }
    });
    if(plugin){
      return plugin;
    }

    return when.reject(new Error('Plugin not found'));
  });
}

module.exports = {
  getAll: getAll,
  getPlugin: getPlugin
};
