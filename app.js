var utils  = require('./lib/utils');

pubsub = require('node-internal-pubsub');
publisher  = pubsub.createPublisher();

var polling_period = 5000;

var in_wifi = require('./lib/in/wifi/wifi_sensor'),
    in_gps = require('./lib/in/gps/nmea-0183.js'),
    in_temp = require('./lib/in/temp/DS18B20.js'),
    inout_aws_iot = require('./lib/inout/mqtt/amazon_iot.js'),
    out_local_json = require('./lib/out/log/local_json'),
    out_relay = require('./lib/out/relay/gpio_relay.js');    

var sub_wifi = pubsub.createSubscriber(),
    sub_gps = pubsub.createSubscriber(),
    sub_aws_iot = pubsub.createSubscriber(),
    sub_temp = pubsub.createSubscriber();

sub_wifi.subscribe('wifi');
sub_gps.subscribe('gps');
sub_temp.subscribe('temp');
sub_aws_iot.subscribe('aws-iot');

// Message events from each subscriber channel.
sub_wifi.on('message', function(channel, message) {
  //console.log("Do something with :" + channel, message);
});

sub_temp.on('message', function(channel, message) {
  console.log("Do something with :" + channel, message);
  inout_aws_iot.APIsend(message);
});

sub_aws_iot.on('message', function(channel, message) {
  console.log("Do something with :" + channel, message);
  // if(message.topic == "relay/set") {
  //     console.log(message.msg)
  //     if(message.msg == "true")   {
  //         console.log("Relay ON");
  //         out_relay.on();
  //     } else {
  //         console.log("Relay OFF");
  //         out_relay.off();
  //     }
  // }
});

sub_gps.on('message', function(channel, message) {
  console.log("Do something with :" + channel, message);
  //console.log(message);
});

// Check data from each sensor and publish to the channel if required.
function checkState(data){

  //in_wifi.check(data, function(data) {});
  in_gps.check(data, function(data) {});
  in_temp.check(data, function(data) {});
  //inout_aws_iot.APIsend(data, function(data) {});

  // polling rate for check state. 5 second timeout.
  setTimeout(checkState, 10000);
}

checkState({});
