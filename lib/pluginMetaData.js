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
      var loaded = require(plugin.name);
      plugin.optionsSchema = loaded.optionsSchema;
      plugin.messageSchema = loaded.messageSchema;
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

function getMetaData(name){
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

function getPlugin(type){
  return getMetaData(type)
  .then(function(meta){
    var plugin = require(type);
    if(plugin.Plugin){
      return plugin;
    }
    return when.reject('Invalid skynet gateway plugin: ' + type);
  });
}

function getDefaultOptions(type){
  return getPlugin(type)
  .then(function(plugin){
    if(plugin.getDefaultOptions){
      //dyanmic default options
      return nodefn.call(plugin.getDefaultOptions);
    }else if(plugin.defaultOptions){
      //static default options
      return plugin.defaultOptions;
    }
    else{
      return {};
    }
  });
}

function install(name){
  return npmLoader()
  .then(function(loaded){
    return nodefn.call(npm.commands.install, [name]);
  })
  .then(function(installed){
      installed.restart = true;
      return installed;
  });
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
    return nodefn.call(npm.commands.update, [name]);
  })
  .then(function(updated){
    updated.restart = true;
    return updated;
  });

}

module.exports = {
  getAll: getAll,
  getMetaData: getMetaData,
  install: install,
  uninstall: uninstall,
  update: update,
  getPlugin: getPlugin,
  getDefaultOptions: getDefaultOptions
};
