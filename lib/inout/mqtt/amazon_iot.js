var awsIot = require('aws-iot-device-sdk');


var device = awsIot.device({
//  "host": "A1QEDJ0GREHM1R.iot.us-west-2.amazonaws.com",
  "host": "A35VX1CGSD4U40.iot.us-west-2.amazonaws.com",
  "port": 8883,
  "clientId": "thing1",
  "thingName": "thing1",
//  "clientId": "node-emitter",
//  "thingName": "node-emitter",
  "caCert": "./awsCerts/rootCA.pem",
//  "clientCert": "./awsCerts/0fb3df1bdf-certificate.pem.crt",
//  "privateKey": "./awsCerts/0fb3df1bdf-private.pem.key"
  "clientCert": "./awsCerts/da8f6f18d7-certificate.pem.crt",
  "privateKey": "./awsCerts/da8f6f18d7-private.pem.key"
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
  console.log(data.topic);
  console.log(data.message);
  device.publish(data.topic, data.message);
}

module.exports = {
  APIsend: api_send
};
