var awsIot = require('aws-iot-device-sdk');

var sampleData = {
    "uuid": "abc123",
    "temperature": 38.4,
    "unit": "C",
    "type": "DS18B20"
};

var device = awsIot.device({
  "host": "A1QEDJ0GREHM1R.iot.us-west-2.amazonaws.com",
  "port": 8883,
  "clientId": "node-emitter",
  "thingName": "node-emitter",
  "caCert": "./awsCerts/rootCA.pem",
  "clientCert": "./awsCerts/0fb3df1bdf-certificate.pem.crt",
  "privateKey": "./awsCerts/0fb3df1bdf-private.pem.key"
});

var timeout;
var count=0;

//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
device
  .on('connect', function() {
    publisher.publish('aws-iot', 'connected to aws iot!');
    //console.log('connected to aws iot!');
    //device.subscribe('sensors');
    });
device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });
device 
  .on('close', function() {
    console.log('close');
    clearInterval( timeout );
    count=0;
  });
device 
  .on('reconnect', function() {
    console.log('reconnect');
  });
device 
  .on('offline', function() {
    console.log('offline');
    clearInterval( timeout );
    count=0;
  });
device
  .on('error', function(error) {
    console.log('error', error);
    clearInterval( timeout );
    count=0;
  });

function api_send(data) {
  // publish a message to a topic
  device.publish('sensors', JSON.stringify(data));
}

module.exports = {
  APIsend: api_send
};