let config = require('./config');

var mqtt = require('mqtt');
var mqttclient  = mqtt.connect(config.mqtt_server);

let timers = {};
// as far as i can tell there is no way to see if a timer has
// been cleared or is still scheduled, so we're going to keep 
// track of that separately.
let isTimerScheduled = {};

mqttclient.on('connect', function () {
  mqttclient.subscribe('devices/garage_door_sensor2');
  mqttclient.subscribe('devices/garage_door_sensor1');
})

mqttclient.on('message', function (topic, message) {
  var data = JSON.parse(message.toString());
  if (data.open) {
    console.log('[' + new Date().toUTCString() + '] ', 'detected', topic, 'opening');
    if (!isTimerScheduled[topic]) {
      console.log('[' + new Date().toUTCString() + '] ', 'waiting 10 mins to alert...');
      // set the timer
      timers[topic] = setTimeout(notify_me, 1000 * 60 * 10);
      isTimerScheduled[topic] = true;
    }
  } else {
    // clear the timer
    clearTimeout(timers[topic]);
    isTimerScheduled[topic] = false;
    console.log('[' + new Date().toUTCString() + '] ', 'detected', topic, 'closing, cancelling timer...');
  }
});

function notify_me() {
  let message = `Warning: The garage has been open for 10 minutes.`;
  console.log('[' + new Date().toUTCString() + '] ', 'sending warning:', message);
  mqttclient.publish('notify/me', JSON.stringify({ message: message }));
}
