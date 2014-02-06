var leveldb = require('level');
var nodefn  = require('when/node/function');
var _ = require('lodash');

var db = leveldb(__dirname + '/../db');


module.exports = {
  get: nodefn.lift(_.bind(db.get, db)),
  put: nodefn.lift(_.bind(db.put, db))
};
