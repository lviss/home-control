let config = require('./config');

var mqtt = require('mqtt');
var mqttclient  = mqtt.connect(config.mqtt_server);

let timers = {};

mqttclient.on('connect', function () {
  mqttclient.subscribe('devices/garage_door_sensor2');
  mqttclient.subscribe('devices/garage_door_sensor1');
})

mqttclient.on('message', function (topic, message) {
  var data = JSON.parse(message.toString());
  if (data.open) {
    console.log('detected door opening, waiting...');
    // clear any existing timer for this door
    clearTimeout(timers[topic]);
    // set the timer
    timers[topic] = setTimeout(notify_me, 1000 * 60 * 10);
  } else {
    // clear the timer
    clearTimeout(timers[topic]);
    console.log('detected door closing, cancelling timer...');
  }
});

function notify_me() {
  let message = `Warning: The garage has been open for 10 minutes.`;
  mqttclient.publish('notify/me', JSON.stringify({ message: message }));
}
