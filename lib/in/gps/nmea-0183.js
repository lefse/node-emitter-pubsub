var mock_flow = true;

var com = require("serialport");
var nmea = require("nmea");
var _ = require('underscore');

var gpsDevice = {
    port: "/dev/ttyUSB3",
    baudrate: 4800,
	dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false	   
}

if (mock_flow == false ) {
var gpsSerialPort = new com.SerialPort(gpsDevice.port, {
    baudrate: gpsDevice.baudrate,
	dataBits: gpsDevice.dataBits,
    parity: gpsDevice.parity,
    stopBits: gpsDevice.stopBits,
    flowControl: gpsDevice.flowControl,	    
    parser: com.parsers.readline('\r\n')
});	
var gpsObject = nmea.parse("$GPGGA,164518.881,,,,,0,00,,,M,0.0,M,,0000*58");
} else {
var gpsHeader = {
	id: "abc1234",
	type: "gps",
	units: "nmea"
}
var gpsObject = nmea.parse("$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47");
}

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

function check(data, callback) {

	if (mock_flow == false ) {
		gpsSerialPort.open(function (error) {
			if ( error ) {			
				console.log('failed to open: '+error);
				try {
					gpsObject = nmea.parse(gpsData);		
				} catch(ex) {
					//Do something??
				}			
				data.gps = JSON.stringify(nmeaFilter(gpsObject));	
				publisher.publish('gps', data.gps);
				callback(data);										
			} else {
				//console.log('GPS Port is open');
				gpsSerialPort.on('data', function(gpsData) {			
					if(gpsData.toString().substring(0,6) === "$GPGGA") {
						try {
							gpsObject = nmea.parse(gpsData);	
						} catch(ex) {
							//Do something??
						}		
							gpsSerialPort.close(function (error) {
								if(error)
									console.log('gps port closed', err);
							});					
							data.gps = JSON.stringify(nmeaFilter(gpsObject));
							publisher.publish('gps', data.gps);
							callback(data);										
						}
				});
			}
		});
	} else { // fake some data
		try {
			//data.gps = JSON.stringify(nmeaFilter(gpsObject));
			publisher.publish('gps', JSON.stringify(extend(gpsHeader, nmeaFilter(gpsObject))));	
		} catch(ex) {
			//Do something??	
			console.log("Error GPS");
		}			
		callback(data);											
	}

	if (mock_flow == false ) {
		gpsSerialPort.on('close', function(){
			//console.log('GPS PORT CLOSED');
			callback(data);		
		});

		gpsSerialPort.on('error', function (err) {
			console.error("GPS PORT ERROR", err);  
			callback(data);	
		});
	}
}

function nmeaFilter(data) {
	// GPGGA message contains these values.
	// Omit uncommented members.
	return (_.omit(data, 
		//"sentence",
		"type",
		//"timestamp",
		//"lat",
		//"latPole",
		//"lon",
		//"lonPole",
		"fixType",
		"numSat",
		"horDilution",
		//"alt",
		//"altUnit",
		"geoidalSep",
		"geoidalSepUnit",
		"differentialAge",
		"differentialRefStn",
		"talker_id"
	));
}

module.exports = {
   check: check
};
