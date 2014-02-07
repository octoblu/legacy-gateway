var npm = require('npm');
var _ = require('lodash');
var getPluginsMetaData = require('../lib/getPluginsMetaData');
var subdevices = require('../lib/subdevices');

exports.plugins = function(req, res){
  getPluginsMetaData()
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
    res.render('subdevices', { title: 'Skynet Gateway Plugins', subdevices: instances });
  })
  .otherwise(function(err){
    res.send(500, err);
  });
};
