var _ = require('lodash');
var npm = require('npm');
var when = require('when');
var nodefn = require('when/node/function');

var npmLoader = nodefn.lift(_.bind(npm.load, npm));

function npmLoad(){
  return npmLoad({depth:0, silent: true});
}

function getAll(){
  return npmLoader()
  .then(function(loaded){
    return nodefn.call(npm.commands.ls);
  })
  .then(function(data){

    var plugins = _.filter(data[0].dependencies, function(dep){
      return _.contains(dep.keywords, 'skynet-plugin');
    });
    return plugins;
  });
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

function install(name){
  return npmLoader()
  .then(function(loaded){
    return nodefn.call(npm.commands.install, [name]);
  });

}

function uninstall(name){
  return npmLoader()
  .then(function(loaded){
    return nodefn.call(npm.commands.uninstall, [name]);
  });

}

module.exports = {
  getAll: getAll,
  getPlugin: getPlugin,
  install: install,
  uninstall: uninstall
};
