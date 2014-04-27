var pluginMetaData = require('./pluginMetaData');
var subdevices = require('./subdevices');

var handlers = {
  getPlugins: pluginMetaData.getAll,
  getSubdevices: subdevices.getRecords,
  createSubdevice: subdevices.createSubdevice,
  updateSubdevice: subdevices.updateSubdevice,
  configurationDetails: subdevices.configurationDetails,
  deleteSubdevice: function(data){
    return subdevices.deleteSubdevice(data.name);
  },
  reloadSubdevice: function(data){
    return subdevices.reloadSubdevice(data.name);
  },
  installPlugin: function(data){
    return pluginMetaData.install(data.name);
  },
  uninstallPlugin: function(data){
    return subdevices.uninstallPlugin(data.name);
  },
  updatePlugin: function(data){
    return pluginMetaData.update(data.name);
  },
  getDefaultOptions: function(data){
    return pluginMetaData.getDefaultOptions(data.name);
  }
};

function config(myToken, data, cb){
  if(data.token == myToken && handlers[data.method]){
    console.log('calling handler', data.method);
    handlers[data.method](data)
    .then(function(resp){
      console.log('config success', resp);
      cb({result: resp});
      if(resp.restart){
        process.exit(42);
      }
    },
    function(err){
      console.log('config error', err);
      cb({error: err});

    });
  }
  else{
    cb({error: 'method not found'});
  }
}

module.exports = config;
