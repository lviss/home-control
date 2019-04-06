let config = require('./config');

let mqtt = require('mqtt');
let mqttclient  = mqtt.connect(config.mqtt_server);

let tvreceiver = require('eiscp');
let log = function(data) { console.log(data); };
let mqtt_topic_root = 'devices/tv_receiver';
let volume_command_topic = mqtt_topic_root + '/command/volume';
let power_command_topic = mqtt_topic_root + '/command/power';

// Prints debugging info to the terminal
//tvreceiver.on("debug", log);
// Prints errors to the terminal
tvreceiver.on("error", log);

mqttclient.on('connect', function () {
  mqttclient.subscribe(volume_command_topic);
  mqttclient.subscribe(power_command_topic);
  tvreceiver.connect({host: config.onkyo_receiver, verify_commands: false});
})

mqttclient.on('message', function (topic, message) {
  let commandMap = {};
  commandMap[volume_command_topic] = 'volume';
  commandMap[power_command_topic] = 'system-power';
  // message is Buffer
  let argument = message.toString();
  let command = commandMap[topic] + '=' + argument;
  tvreceiver.command(command);
});

// receive actions like the volume changing and rebroadcast to mqtt
tvreceiver.on('data', function(result) {
  //console.log(result);
  if (result.command == 'system-power')
    mqttclient.publish(mqtt_topic_root + '/power', result.argument);
  if (Array.isArray(result.command) && result.command.includes('master-volume'))
    mqttclient.publish(mqtt_topic_root + '/volume', result.argument + "");
});

// This will output a list of available commands
/*tvreceiver.get_commands('main', function (err, cmds) {
  console.log(cmds);
  cmds.forEach(function (cmd) {
    console.log(cmd);
    tvreceiver.get_command(cmd, function (err, values) {
      console.log(values);
    });
  });
});
*/
