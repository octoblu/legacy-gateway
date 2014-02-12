var db = require('./level');
var _ = require('lodash');
var when = require('when');
var validate = require('json-schema').validate;
var pluginMetaData = require('./pluginMetaData');

var domain = require('domain');

var instances = {};

var messengerInstance;

function Messenger(conn){
  this.skynet = conn;
  return this;
}

Messenger.prototype.send = function(message){
  this.skynet.message(message);
};

function initializeMessenger(conn){
  messengerInstance = new Messenger(conn);
  return messengerInstance;
}


function getRecords(){
  return db.get('subdevices', {valueEncoding : 'json'});
}

function saveRecords(subdevices){
  return db.put('subdevices', subdevices, {valueEncoding : 'json'});
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
  var PluginConstructor;
  return pluginMetaData.getConstructor(body.type)
  .then(function(loaded){
    PluginConstructor = loaded;
    if(PluginConstructor.getOptionsSchema){
      var schema = PluginConstructor.getOptionsSchema();
      var validation = validate(body.options, schema);
      //console.log('attemting validate', body.options, schema, validation);

      if(!validation.valid){
        console.log('invalid record: ', validation);
        return when.reject(validation.errors);
      }
    }
    return getRecords();
  })
  .then(function(records){
    var existing = _.filter(records,{ name: body.name});
    if(existing.length){
      return when.reject(new Error('Record already exists!'));
    }
    record = {
      name: body.name, type: body.type, options: body.options
    };
    records.push(record);
    console.log('saving records with new one');
    return saveRecords(records);

  })
  .then(function(saved){
    //console.log('instantiating',record.name, PluginConstructor, record.type, record.options);
    instances[body.name] = new PluginConstructor(messengerInstance, body.options);
    return record;
  });

}


function updateRecord(body){
  var PluginConstructor;
  return pluginMetaData.getConstructor(body.type)
  .then(function(loaded){
    PluginConstructor = loaded;
    if(PluginConstructor.getOptionsSchema){
      var schema = PluginConstructor.getOptionsSchema();
      var validation = validate(body.options, schema);

      if(!validation.valid){
        console.log('invalid record: ', validation);
        return when.reject(validation.errors);
      }
    }
    return getRecords();
  })
  .then(function(records){
    var others = _.filter(records,function(val){ return val.type != body.type; });

    records.push({
      name: body.name, type: body.type, options: body.options
    });
    console.log('saving records with new updated one');
    return saveRecords(records);

  })
  .then(function(saved){
    killInstance(body.name);
    instances[body.name] = new PluginConstructor(messengerInstance, body.options);
    return 'ok';
  });

}


function uninstallPlugin(type){
  return pluginMetaData.uninstall(type)
  .then(function(uninstalled){
    console.log('uninstalled',uninstalled);
    return getRecords();
  })
  .then(function(records){
    console.log('records',records.length);
    var toKill = _.filter(records,function(val){ return val.type == type; });
    toKill.forEach(function(k){
      killInstance(k.name);
    });
    var remaining = _.filter(records,function(val){ return val.type != type; });
    console.log('remaining',remaining);
    return saveRecords(remaining);
  });
}

function deleteRecord(name){
  return getRecords()
  .then(function(records){
    console.log('starting delete', name, records);
    var origLen = records.length;
    var remaining = _.filter(records,function(val){ return val.name != name; });
    if(remaining.length == origLen){
      return when.reject('Record does not exist');
    }
    console.log('save remaining', remaining);
    return saveRecords(remaining);
  })
  .then(function(saved){
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
            var PluginConstructor = require(record.type);
            //console.log('instantiating',record.name, PluginConstructor, record.type, record.options);
            tempMap[record.name] = new PluginConstructor(messenger, record.options);
          });
        }catch(exp){
          console.log('err', exp);
        }
      });
      _.assign(instances, tempMap);
      return instances;
    });
}

function firstTime(){
  return getRecords()
  .otherwise(function(err){
    console.log('creating first subdevice record');
    return saveRecords(
      [{name: 'greeting', type: 'skynet-greeting', options: {greetingPrefix: 'holla'} }]
    );
  });
}

function reload(name){
  var instance = instances[name];
  var record;
  if(instance){
    return getRecords()
    .then(function(records){
      var running = _.filter(records, {name: name});
      if(running.length){
        killInstance(running[0].name);
        record = running[0];
        return pluginMetaData.getConstructor(record.type);
      }
      return when.reject('invalid subdevice name');
    })
    .then(function(Constructor){
      instances[name] = new Constructor(messengerInstance, record.options);
      return record;
    });
  }

  return when.reject('subdevice not running');
}

module.exports = {
  getRecords : getRecords,
  saveRecords : saveRecords,
  initializeInstances : initializeInstances,
  instances : instances,
  firstTime : firstTime,
  Messenger: Messenger,
  initializeMessenger: initializeMessenger,
  createSubdevice: createRecord,
  updateSubdevice: updateRecord,
  deleteSubdevice: deleteRecord,
  uninstallPlugin: uninstallPlugin,
  reload: reload
};
