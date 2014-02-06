var db = require('./level');
var uuid = require('uuid');

"use strict";

function getToken(){
  return db.get('token')
  .then(function(storedToken){
    console.log('using stored token', storedToken);
    return storedToken;
  }, function(err){
    var token = uuid.v4().replace(/-/g, '').substring(0,31);
    console.log('storing new token',  token);
    return db.put('token', token)
      .then(function(){
        return db.get('token');
      });
  });
}
module.exports = getToken;
