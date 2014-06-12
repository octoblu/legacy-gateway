```
 SSSSS  kk                            tt
SS      kk  kk yy   yy nn nnn    eee  tt
 SSSSS  kkkkk  yy   yy nnn  nn ee   e tttt
     SS kk kk   yyyyyy nn   nn eeeee  tt
 SSSSS  kk  kk      yy nn   nn  eeeee  tttt
                yyyyy
```
======

# Skynet Hub

======

Allows you to connect devices with or *without* IP addresses to SkyNet (i.e. Phillips Hue, Belkin WeMo, Raspberry Pi, etc.).

The SkyNet Hub has an extensible [plugin](./plugins.md) architecture allowing you to create plugins for devices that we have not had a chance to connect yet.  You can search [NPMJS.org](https://www.npmjs.org/search?q=skynet-plugin) for a list of active SkyNet Hub plugins.

For example if you wish to install the SkyNet plugin for the Philips hue, you can simply `npm install skynet-hue` in the directory your hub installed.

--------------------


## Installing

Clone the git repository, then:

```bash
$ npm install
$ node server.js
```

If you would like to connect your SkyNet Hub to a private SkyNet cloud, then:

```bash
$ env SKYNET_SERVER=127.0.0.1 SKYNET_PORT=3000 node server.js
```

--------------------


## Subdevices

A Skynet hub can have subdevices attached to it.  A subdevice is a configured instance of a [plugin](./plugins.md).  It could be anything from a Philips hue lighting system to an arduino to a simple javascript function that just calls a shell script on the skynet hub itself.  

You can have as many subdevices on the hub as you wish, as long as hub has the plugin type installed that you want to use for your subdevice.


If you have direct access to your hub, then a simple way to create an subdevice is with a curl command.  For example if you wish to create a subdevice of type skynet-hue:

```
curl -X POST http://192.168.1.110:8888/subdevices -H "Content-Type: application/json" -d '{"name":"living_Room_Lights", "type":"skynet-hue", "options":{"ipAddress": "192.168.1.115", "apiUsername": "newdeveloper"}}'
```

You can then message subdevices directly from skynet by sending a normal skynet message to the skynet hub and specifing:

```javascript
{
  devices: 'xxxxxx-uuid-of-a-skynet-hub-xxx',
  subdevice: 'living_Room_Lights',
  payload: { setState: {lightNumber: 1, on: true} }
}
```


LICENSE
-------

(MIT License)

Copyright (c) 2014 Octoblu <info@octoblu.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
