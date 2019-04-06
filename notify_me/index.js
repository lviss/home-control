let config = require('./config');

var mqtt = require('mqtt');
var mqttclient  = mqtt.connect(config.mqtt_server);

var requestify = require('requestify'); 

mqttclient.on('connect', function () {
  mqttclient.subscribe('notify/me');
  mqttclient.subscribe('notify/me/camera');
})

mqttclient.on('message', function (topic, message) {
  if (topic == 'notify/me') {
    var data = JSON.parse(message.toString());
    requestify.post(config.http_message_endpoint, {
      subject: 'notify me',
      body: data.message
    })
    .then(function(response) {
      var res = response.getBody();
      console.log("success");
    })
    .fail(function(response) {
      console.log("error");
      console.log(response.getCode()); // Some error code such as, for example, 404
      console.log(response);
    });
  }
  if (topic == 'notify/me/camera') {
    var data = JSON.parse(message.toString());
    let emailhtml = '<html><body>Motion detected: ' + config.internal_camera_path + data.pathToVideo + ' or if you are tunnelling, ' + config.tunnelling_camera_path + data.pathToVideo + '</body></html>';
    requestify.post(config.http_message_endpoint, {
      subject: 'notify me camera',
      body: emailhtml
    })
    .then(function(response) {
      var res = response.getBody();
      console.log("success");
    })
    .fail(function(response) {
      console.log("error");
      console.log(response.getCode()); // Some error code such as, for example, 404
      console.log(response);
    });
  }
});
