function resolve(promise, res){
  promise
  .then(
  function(val){
    res.send(200, val);
  },
  function(err){
    console.log('error resolving call', err);
    res.send(500, err);
  });
}

module.exports = resolve;
