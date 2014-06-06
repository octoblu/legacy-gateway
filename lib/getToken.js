var db = require('./iddb');
var uuid = require('uuid');

function getToken(){
  return db.findOne({name: 'token'})
  .then(function(storedToken){
    if(storedToken){
      console.log('using stored token', storedToken);
      return storedToken.value;
    }

    var token = uuid.v4().replace(/-/g, '').substring(0,31);
    console.log('storing new token',  token);
    return db.insert({name: 'token', value: token}).yield(token);

  });
}
module.exports = getToken;
