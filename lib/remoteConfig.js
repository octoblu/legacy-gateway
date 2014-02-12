var pluginMetaData = require('./pluginMetaData');
var subdevices = require('./subdevices');

var handlers = {
  getPlugins: pluginMetaData.getAll,
  getSubdevices: subdevices.getRecords,
  createSubdevice: subdevices.createSubdevice,
  updateSubdevice: subdevices.updateSubdevice,
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
  }
};

function config(myToken, data, cb){
  if(data.token == myToken && handlers[data.method]){
    handlers[data.method](data)
    .then(function(resp){
      cb({result: resp});
    },
    function(err){
      cb({error: err});
    });
  }
  else{
    cb({error: 'method not found'});
  }
}

module.exports = config;
