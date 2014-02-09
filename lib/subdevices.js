var db = require('./level');
var _ = require('lodash');
var when = require('when');
var validate = require('json-schema').validate;
var pluginMetaData = require('./pluginMetaData');

var instances = {};

var messengerInstance;

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


function createRecord(body){
  var plugin;
  var PluginConstructor;
  return pluginMetaData.getPlugin(body.type)
  .then(function(p){
    plugin = p;
    PluginConstructor = require(body.type);
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

    records.push({
      name: body.name, type: body.type, options: body.options
    });
    console.log('saving records with new one');
    return saveRecords(records);

  })
  .then(function(saved){
    //console.log('instantiating',record.name, PluginConstructor, record.type, record.options);
    instances[body.name] = new PluginConstructor(messengerInstance, body.options);
    return 'ok';
  });

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
          var PluginConstructor = require(record.type);
          //console.log('instantiating',record.name, PluginConstructor, record.type, record.options);
          tempMap[record.name] = new PluginConstructor(messenger, record.options);
        }catch(ex){
          console.log('error initializing subdevice instance:', ex);
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


function Messenger(conn){
  this.skynet = conn;
  return this;
}
Messenger.prototype.send = function(message){
  this.skynet.message(message);
};

module.exports = {
  getRecords : getRecords,
  saveRecords : saveRecords,
  initializeInstances : initializeInstances,
  instances : instances,
  firstTime : firstTime,
  Messenger: Messenger,
  initializeMessenger: initializeMessenger,
  createSubdevice: createRecord,
  deleteSubdevice: deleteRecord
};
