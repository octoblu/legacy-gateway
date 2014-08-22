var db = require('./subdb');
var _ = require('lodash');
var when = require('when');
var validate = require('json-schema').validate;
var pluginMetaData = require('./pluginMetaData');
var uuid = require('uuid');
var domain = require('domain');

var instances = {};

var messengerInstance;

function Messenger(conn){
  this.skynet = conn;
  return this;
}

Messenger.prototype.send = function(data, cb){
  console.log('messenger send', data, cb);
  if(data.devices == this.gatewayId && data.subdevice && data.payload){

    if(instances[data.subdevice] && instances[data.subdevice].onMessage){
      data.fromUuid = this.gatewayId;
      instances[data.subdevice].onMessage(data, cb);
    }

  }else{
    this.skynet.message(data, cb);
  }
};

Messenger.prototype.data = function(data, cb){
  console.log('messenger send', data, cb);
  if(data){
    data.uuid = this.gatewayId;
    this.skynet.data(data, cb);
  }
};

function initializeMessenger(conn, gatewayId){
  messengerInstance = new Messenger(conn);
  messengerInstance.gatewayId = gatewayId;
  return messengerInstance;
}


function getRecords(query){
  query = query || {};
  return db.find({});
}

function killInstance(name){
  var runningInstance = instances[name];
  if(runningInstance){
    delete instances[name];
    if(runningInstance.destroy){
      runningInstance.destroy();
    }
  }
}

function createRecord(body){
  var record;
  var plugin;
  var subdeviceId = uuid.v4();

  return pluginMetaData.getPlugin(body.type)
  .then(function(loaded){
    plugin = loaded;
    console.log('plugin metadata loaded', plugin);
    if(plugin.optionsSchema){
      var validation = validate(body.options, plugin.optionsSchema);
      //console.log('attemting validate', body.options, schema, validation);

      if(!validation.valid){
        console.log('invalid record: ', validation);
        return when.reject(validation.errors);
      }
    }
    return db.insert({
      uuid: subdeviceId, name: body.name, type: body.type, options: body.options
    });
  })
  .then(function(saved){
    //console.log('instantiating',record.name, PluginConstructor, record.type, record.options);
    var sub = new plugin.Plugin(messengerInstance, body.options);
    instances[body.name] = sub;
    return saved;
  });

}


function updateRecord(body){
  var plugin;
  // var originalUuid;
  return pluginMetaData.getPlugin(body.type)
  .then(function(loaded){
    console.log('update plugin: ', loaded);
    plugin = loaded;
    if(plugin.optionsSchema){
      var validation = validate(body.options, plugin.optionsSchema);

      if(!validation.valid){
        console.log('invalid record: ', validation);
        throw new Error(validation.errors);
      }
    }
    return db.findOne({ $or: [{ uuid: body.uuid }, { name: body.name }] });
  })
  .then(function(record){
    console.log('original', record);
    if(!record.hasOwnProperty("uuid")){
      body.uuid = uuid.v4();
      _.extend(record, { uuid: body.uuid, name: body.name, type: body.type, options: body.options });
    } else {
      // originalUuid = record.uuid;
      _.extend(record, { name: body.name, type: body.type, options: body.options });
    }
    console.log('updating record', record);
    // if(originalUuid){
      // return db.update({uuid: body.uuid}, {$set: record}, {});
    // } else {
      // return db.update({name: body.name}, {$set: record}, {});
    // }
    return db.update({ $or: [{ uuid: body.uuid }, { name: body.name }] }, {$set: record}, {});

  })
  .then(function(saved){
    console.log('saved', saved);
    if(body.uuid){
      killInstance(body.uuid);
      instances[body.uuid] = new plugin.Plugin(messengerInstance, body.options);
    } else {
      killInstance(body.name);
      instances[body.name] = new plugin.Plugin(messengerInstance, body.options);
    }
    return 'ok';
  });

}


function uninstallPlugin(type){
  return pluginMetaData.uninstall(type)
  .then(function(uninstalled){
    console.log('uninstalled',uninstalled);
    return getRecords({type: type});
  })
  .then(function(records){
    console.log('records',records.length);
    var kills = [];
    records.forEach(function(k){
      // if(k.uuid){
        // killInstance(k.uuid);
      // } else {
        // killInstance(k.name);
      // }
      try{
        killInstance(k.uuid);
      } catch(e){
        killInstance(k.name);
      }
    });

    return db.remove({type: type});
  });
}

function deleteRecord(name){
  return db.findOne({ $or: [{ uuid: name }, { name: name }] })
  .then(function(record){
    console.log('starting delete', name, record);
    // if(record.hasOwnProperty("uuid")){
      // return db.remove({uuid: name});
    // } else {
      // return db.remove({name: name});
    // }
    return db.remove({ $or: [{ uuid: name }, { name: name }] });
  })
  .then(function(removed){
    killInstance(name);
    return 'ok';
  });
}




function initializeInstances(messenger){
  //TODO potential leak! cleanup/destroy old instances

  return getRecords()
    .then(function(records){
      var tempMap = {};
      records.forEach(function(record){
        try{
          var d = domain.create();
          d.on('error', function(er) {
            console.log('plugin err', er);
          });
          //TODO very bad - FIX this!
          process.on('uncaughtException', function(er) {
            console.log('plugin err', er);
          });
          d.run(function() {
            var plugin = require(record.type);
            //console.log('instantiating',record.name, PluginConstructor, record.type, record.options);
            tempMap[record.name] = new plugin.Plugin(messenger, record.options);

          });
        }catch(exp){
          console.log('err', exp, record);
        }
      });
      _.assign(instances, tempMap);
      return instances;
    });
}

function firstTime(){
  var subdeviceId = uuid.v4();
  return getRecords()
    .then(function(records){
      if(!records.length){
        console.log('creating first subdevice record');
        return db.insert({
          uuid: subdeviceId,
          name: 'greeting',
          type: 'skynet-greeting',
          options: {greetingPrefix: 'holla'}
        });
      }
    });
}

function reload(name){
  var instance = instances[name];
  var record;
  if(instance){
    return db.findOne({ $or: [{ uuid: name }, { name: name }] })
    .then(function(sub){
      record = sub;
      killInstance(name);
      return pluginMetaData.getPlugin(record.type);
    })
    .then(function(plugin){
        instances[name] = new plugin.Plugin(messengerInstance, record.options);
        return record;
    });
  }

  return when.reject('subdevice not running');
}

function getConfigDetails(){
  var details = {};
  return pluginMetaData.getAll()
    .then(function(plugins){
      details.plugins = plugins;
      return getRecords();
    })
    .then(function(records){
      details.subdevices = records;
      return details;
    });
}

module.exports = {
  getRecords : getRecords,
  initializeInstances : initializeInstances,
  instances : instances,
  firstTime : firstTime,
  Messenger: Messenger,
  initializeMessenger: initializeMessenger,
  createSubdevice: createRecord,
  updateSubdevice: updateRecord,
  deleteSubdevice: deleteRecord,
  uninstallPlugin: uninstallPlugin,
  reload: reload,
  configurationDetails: getConfigDetails
};
