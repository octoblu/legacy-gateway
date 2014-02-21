var _ = require('lodash');
var npm = require('npm');
var when = require('when');
var nodefn = require('when/node/function');

function npmLoader(){
  return nodefn.call(npm.load, {depth:0, silent: true});
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
    _.forEach(plugins, function(plugin){
      try{
        var Constructor = require(plugin.name);
        if(Constructor){
          if(Constructor.getOptionsSchema){
            plugin.optionsSchema = Constructor.getOptionsSchema();
          }
          if(Constructor.getMessageSchema){
            plugin.messageSchema = Constructor.getMessageSchema();
          }
        }

      }catch(exp){
        console.log('error loading pluin', plugin.name, exp);
      }
    });
    return plugins;
  });
}

function checkExistsInNpm(name){
  return npmLoader()
  .then(function(loaded){
    return nodefn.call(npm.commands.search, [name]);
  })
  .then(function(results){
    _.forEach(results, function(r){
      if(r.name == name){
        console.log('found', r, name);
        return results[r];
      }
      return when.reject('Does not exist in npm');
    });
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

    return when.reject('Plugin not found');
  });
}

function getConstructor(type){
  return getPlugin(type)
  .then(function(plugin){
    return require(type);
  });
}

function install(name){
  return nodefn.call(npm.commands.install, [name]);
}

function uninstall(name){
  return npmLoader()
  .then(function(loaded){
    return nodefn.call(npm.commands.uninstall, [name]);
  });

}

function update(name){
  return npmLoader()
  .then(function(loaded){
    console.log(loaded);
    return nodefn.call(npm.commands.update, [name]);
  });

}

module.exports = {
  getAll: getAll,
  getPlugin: getPlugin,
  install: install,
  uninstall: uninstall,
  update: update,
  getConstructor: getConstructor
};
