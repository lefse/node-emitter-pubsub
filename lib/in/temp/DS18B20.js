// Description: Checks for Dallas DS18B20 1-wire devices in /sys/bus/w1/devices.
// Reads each device found and adds id and data to the
// temp_sensors object array.  Requires the 1-wire Linux kernel module.  The sensor data pin must be
// connected to the raspberry pi GPIO4 pin as this is hardcoded in the 1-wire kernel module.
//
// 1-Wire Install instructions:
// https://www.modmypi.com/blog/loading-i2c-spi-and-1-wire-drivers-on-the-raspberry-pi-under-raspbian-wheezy
//
// Test:
// mock_temp true will check for mock devices in the ../test directory.  It will read all device filenames that start with
// "28-"

var fs = require('fs');

var path = require('path');
var mock_temp = false;

if(mock_temp) {
    var devicesDir = './test/';
    var w1_slave = '';
    var sampleData = {
        id: "28-0000065c5301", // This is the device ID
        device: "DS18B20",            // This is the temperature sensor part number
	location: "Basement",
        temp: 38.4,
        units: "Celsius"
    };
} else {
    var devicesDir = '/sys/bus/w1/devices/';
    var w1_slave = '/w1_slave'
}

function check(data, callback) {
    devices(devicesDir, function(err, list) {
        if (err) {
            return console.error("There was an error when reading temp devices.");
        }
            checkAllDevices(list, function(states){
                try {
                    states.forEach(function(item) {
                        publisher.publish('temp', JSON.stringify(item));
                    })
                    callback(states);
                } 
                catch(ex){
                    console.log("ERROR: Tempsensor.");
                }
                callback(data, publisher);
            });
    })
}

function devices(dir, callback) {
    fs.readdir(dir, function (err, list) {
        if (err) {
            console.log("ERROR: Temperature read directory.");
            throw err;
        }
        list = list.filter(function (file) {
            return path.basename(file).toString().substring(0,3) === "28-";
        })
        callback(null, list);
    });
};

function checkAllDevices(list, callback){
    var states = [];
    list.forEach(function (file) {
        checkDevice(devicesDir, file, function (state) {
            states.push(state);
            if( list.indexOf(file) === (list.length-1) ) {
                callback(states);
            }
        });
    });
}

function checkDevice(dir, device, callback) {
    fs.readFile((dir+device+w1_slave), 'utf8', function(err, fdata) {
        if (err) {
            throw err;
            console.log("ERROR: Temperature read file.");
        } else {
            matches = fdata.match(/t=([0-9]+)/);
            celsius = parseInt(matches[1]) / 1000;
            //fahrenheit = ((celsius * 1.8) + 32).toFixed(3);
            callback({
                id: path.basename(device),
                type: "DS18B20",
		location: "Basement",
                temperature: celsius,
                unit: "Celsius"
            });
        }
    });
};

module.exports = {
   check: check
};
