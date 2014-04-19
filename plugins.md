
# Writing plugins for Skynet Hub

================================

Skynet plugins are just [npm modules](https://www.npmjs.org/doc/misc/npm-developers.html) with a keyword of 'skynet-plugin' in their package.json file.  They also need to return an object with at least a Plugin constructor function.


-------------------

## Exports

Here's an example of what a skynet plugin module would export:

```javascript
module.exports = {
  Plugin : MyPlugin, //required
  messageSchema : messageSchema, //optional
  optionsSchema : optionsSchema, //optional
  getDefaultOptions : getDefaultOptions //optional
};
```


-------------

## Plugin

Your constructor function will receive a messenger object and a options object.
The messenger is used to send and receive messages from skynet, and the options object is used to save

```javascript
function MyPlugin(messenger, options){
  this.messenger = messenger;
  this.options = options;
  //do more initialization things...
```

### messenger

The messenger object has a send() method that you can use to send messages to other users or devices on skynet

```javascript
this.messenger.send({
  devices: 'xxxx---some-uuid---xxx', 
  payload: 'hello world.'
});
```

You can optionally add a callback if you expect the device you're sending to will give you an immediate repsonse:

```javascript
this.messenger.send({
  devices: 'xxxx---some-uuid---xxx', 
  payload: 'hello world.'
}, function(data){
    console.log('response data', data);
});
```

### options

Options is an object containing the data that you want to initialize your plugin with when the Skynet Hub boots up or first loads an instance of your plugin.


### Plugin onMessage()

Your plugin can implement an onMessage function to handle the receiving of messages from skynet.

If a callback is passed in to this function, the person or device that sent the message is expecting a reply.

```javascript
Plugin.prototype.onMessage = function(data, callback){
  //my awesome plugin adds two numbers together!
  callback(data.payload.num1 + data.payload.num2);
}
```


### Plugin destroy()

Your plugin can implement a destroy function to handle any cleanup you wish to do when shutting down or restarting.

```javascript
Plugin.prototype.destroy = function(){
  //do cleanup things...
};
```

----------------

## messageSchema

This is an optional [json-schema](http://json-schema.org/) object that describes the type of message you want other devices to send to your plugin.

For example, if you want devices to send an object with a text property to your plugin:

```javascript
var messageSchema = {
  type: 'object',
  properties: {
    text: {
      type: 'string',
      required: true
    }
  }
};
```

---------------------


## optionsSchema

This is an optional [json-schema](http://json-schema.org/) object that describes the type of message you want other devices to send to your plugin.

For example, if you need your plugin to know which serial device (/dev/tty.usbmodem1411 or COM1, etc.) to forward data to:

```javascript
var optionsSchema = {
  type: 'object',
  properties: {
    serialDeviceName: {
      type: 'string',
      required: true
    }
  }
};
```


--------------------


## getDefaultOptions ()

This is a stand alone function you can optionally export that can give default options to a user that they can use when setting up an instance of a plugin.

Its receives a node style callback function that expects to be called with an error or value.

For example, if you wish to see what serial devices are available to use:

```javascript
function getDefaultOptions(callback){
    //do some querying of the hardware...
    ...
    callback(null, anAvailableSerialDeviceId);
    ...
    //handle errors:
    callback('something bad happend', null);
}
```

