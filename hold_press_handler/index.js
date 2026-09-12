let config = require('./config');

var mqtt = require('mqtt');
var mqttclient  = mqtt.connect(config.mqtt_server);

// this mimics the shape of the "user" object the web app's activity log expects,
// so a held button press shows up there the same way a manual click would.
let garage_door_payload = JSON.stringify({
	"action":"push_button",
	"user":{
		"name": "Hold Press Handler",
		"id": "123",
		"photos": [ { "value": ""} ]
	}
});

mqttclient.on('connect', function () {
  mqttclient.subscribe('devices/driveway_lights/cmnd/POWER');
  mqttclient.subscribe('devices/garage_light/cmnd/POWER');
})

mqttclient.on('message', function (topic, messageBuf) {
  let message = messageBuf.toString();
  switch (topic) {
    case 'devices/driveway_lights/cmnd/POWER':
      // when someone holds the button for the outside lights, open the garage door.
      if (message == 'HOLD')
        mqttclient.publish('devices/garage_door_opener2/command', garage_door_payload);
      break;
    case 'devices/garage_light/cmnd/POWER':
      // when someone holds the button for the outside lights, open the garage door.
      if (message == 'HOLD')
        mqttclient.publish('devices/garage_door_opener1/command', garage_door_payload);
      break;
    default:
      break;
  }
});
