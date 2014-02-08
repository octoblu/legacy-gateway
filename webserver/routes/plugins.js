var npm = require('npm');
var _ = require('lodash');
var pluginMetaData = require('../../lib/pluginMetaData');
var subdevices = require('../../lib/subdevices');
var resolve = require('./simpleResolver');


exports.plugins = function(req, res){
  pluginMetaData.getAll()
  .then(function(plugins){
    res.render('plugins', { title: 'Skynet Gateway Plugins', plugins: plugins });
  })
  .otherwise(function(err){
    res.send(500, err);
  });
};

exports.subdevices = function(req, res){
  subdevices.getRecords()
  .then(function(instances){
    res.render('subdevices', { title: 'Skynet Gateway Sub-devices', subdevices: instances });
  })
  .otherwise(function(err){
    res.send(500, err);
  });
};

exports.createSubdevice = function(req, res){
  resolve(subdevices.createSubdevice(req.body), res);
};

exports.deleteSubdevice = function(req, res){
  resolve(subdevices.deleteSubdevice(req.params.name), res);
};
