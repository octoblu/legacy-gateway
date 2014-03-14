var nodefn  = require('when/node/function');
var _ = require('lodash');
var path = require('path');
var Datastore = require('nedb');

var db = new Datastore({
  filename: path.join(__dirname, '/../subdevices.db'),
  autoload: true }
);
// You can issue commands right away


module.exports = {
  find: nodefn.lift(_.bind(db.find, db)),
  findOne: nodefn.lift(_.bind(db.findOne, db)),
  remove: nodefn.lift(_.bind(db.remove, db)),
  insert: nodefn.lift(_.bind(db.insert, db)),
  update: nodefn.lift(_.bind(db.update, db))
};
