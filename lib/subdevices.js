var db = require('./level');
var _ = require('lodash');

var instances = {};


function getRecords(){
  return db.get('subdevices', {valueEncoding : 'json'});
}

function saveRecords(subdevices){
  return db.put('subdevices', subdevices, {valueEncoding : 'json'});
}

function initializeInstances(messager){
  //TODO potential leak! cleanup/destroy old instances

  return getRecords()
    .then(function(records){
      var tempMap = {};
      records.forEach(function(record){
        try{
          var PluginConstructor = require(record.type);
          //console.log('instantiating',record.name, PluginConstructor, record.type, record.options);
          tempMap[record.name] = new PluginConstructor(messager, record.options);
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

module.exports = {
  getRecords : getRecords,
  saveRecords : saveRecords,
  initializeInstances : initializeInstances,
  instances : instances,
  firstTime : firstTime
};
