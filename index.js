var express = require('express')
  , passport = require('passport')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var JwtStrategy = require('passport-jwt').Strategy
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
var cookieparser = require('cookieparser');
var bodyParser = require('body-parser');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// load config from file
var fs = require('fs');
var config = require('./config.js');

// an object to keep track of what we know about the garage door
var garage_door_states = {
  door1: {
    open: false,
    unknown: true
  },
  door2: {
    open: false,
    unknown: true
  }
};

// an object to keep track of what we know about the thermostat
var thermostat_state = {};

var mqtt = require('mqtt');
var mqttclient = mqtt.connect(config.mqtt_server);
 
mqttclient.on('connect', function () {
  // subscribe to all the devices that we want to show information
  // about on the webpage.
  mqttclient.subscribe('devices/garage_door_sensor1');
  mqttclient.subscribe('devices/garage_door_sensor2');
  mqttclient.subscribe('devices/thermostat/get');
  mqttclient.subscribe('devices/master_bedroom_fan/stat/POWER');
  mqttclient.subscribe('devices/family_room_fan/stat/POWER');
  mqttclient.subscribe('devices/garage_light/stat/POWER');
  mqttclient.subscribe('devices/driveway_lights/stat/POWER');
  mqttclient.subscribe('devices/tv_receiver/power');
  mqttclient.subscribe('devices/tv_receiver/volume');
})
 
mqttclient.on('message', function (topic, message) {
  // generally when a message comes in from MQTT we can just
  // rebroadcast it to socketio so the info can be shown on
  // the browser. In some cases we'll want to process the data
  // a little bit.

  // TODO: this could probably be simplified

  // message is a Buffer 
  //console.log(message.toString());
  if (topic == 'devices/garage_door_sensor1') {
    var data = JSON.parse(message.toString());
    garage_door_states.door1.open = data.open;
    garage_door_states.door1.unknown = false;
    io.emit(topic, garage_door_states.door1);
  } else if (topic == 'devices/garage_door_sensor2') {
    var data = JSON.parse(message.toString());
    garage_door_states.door2.open = data.open;
    garage_door_states.door2.unknown = false;
    io.emit(topic, garage_door_states.door2);
  } else if (topic == 'devices/thermostat/get') {
    thermostat_state = JSON.parse(message.toString());
    io.emit(topic, thermostat_state);
  } else if (topic == 'devices/master_bedroom_fan/stat/POWER') {
    io.emit('devices/master_bedroom_fan', message.toString());
  } else if (topic == 'devices/family_room_fan/stat/POWER') {
    io.emit('devices/family_room_fan', message.toString());
  } else if (topic == 'devices/garage_light/stat/POWER') {
    io.emit('devices/garage_light', message.toString());
  } else if (topic == 'devices/driveway_lights/stat/POWER') {
    io.emit('devices/driveway_lights', message.toString());
  } else if (topic == 'devices/tv_receiver/power') {
    io.emit(topic, message.toString());
  } else if (topic == 'devices/tv_receiver/volume') {
    io.emit(topic, message.toString());
  }
});

io.on('connection', function(socket) { 
  // whenever a web client connects, make sure they present a valid jwt token
  if (!socket.handshake.headers.cookie) 
    return socket.disconnect(); // not authenticated
  var token = cookieparser.parse(socket.handshake.headers.cookie).jwt;
  if(!token) 
    return socket.disconnect(); // not authenticated
  jwt.verify(token, opts.secretOrKey, function(err, decoded) {
    if (err) 
      return socket.disconnect(); // not authenticated

    // we're authenticated.

    // for devices that we aren't keeping track of their state, send a message
    // to the device via MQTT asking for their current state.
    mqttclient.publish('devices/tv_receiver/command/power', 'query');
    mqttclient.publish('devices/tv_receiver/command/volume', 'query');
    // publishing with no payload means query for the following devices
    mqttclient.publish('devices/master_bedroom_fan/cmnd/POWER'); 
    mqttclient.publish('devices/family_room_fan/cmnd/POWER');
    mqttclient.publish('devices/garage_light/cmnd/POWER');
    mqttclient.publish('devices/driveway_lights/cmnd/POWER');

    // for devices that we ARE keeping track of the state, send the state
    // to the web client as soon as it connects.
    socket.emit('devices/garage_door_sensor1', garage_door_states.door1);
    socket.emit('devices/garage_door_sensor2', garage_door_states.door2);
    socket.emit('devices/thermostat/get', thermostat_state);

    // when we receive messages from socketio (the web client), we can generally pass them
    // straight through to MQTT. In some cases we'll have to do some translations.

    // TODO: this could probably by simplified

    var user = decoded.user;
    var open_garage_payload = {"action":"push_button", "user":user};
    socket.on('toggle door1', function(){
      mqttclient.publish('devices/garage_door_opener1/get', JSON.stringify(open_garage_payload));
      io.emit('devices/garage_door_sensor1', garage_door_states.door1);
    });
    socket.on('toggle door2', function(){
      mqttclient.publish('devices/garage_door_opener2/command', JSON.stringify(open_garage_payload));
      io.emit('devices/garage_door_sensor2', garage_door_states.door2);
    });
    socket.on('tv', function(command){
      mqttclient.publish('devices/tv/command', command);
      if (command == 'on') // turn off stereo when turning off the tv, and turn it on with tv.
        mqttclient.publish('cmnd/amp/power', '1');
      else
        mqttclient.publish('cmnd/amp/power', '0');
    });
    socket.on('officetv', function(command){
      mqttclient.publish('devices/office_tv_remote/command', command);
    });
    socket.on('devices/thermostat/desired_temperature/inc', function() {
      mqttclient.publish('devices/thermostat/desired_temperature/inc');
    });
    socket.on('devices/thermostat/desired_temperature/dec', function() {
      mqttclient.publish('devices/thermostat/desired_temperature/dec', 'dec');
    });
    socket.on('devices/thermostat/mode/set', function(mode) {
      mqttclient.publish('devices/thermostat/mode/set', mode);
    });
    socket.on('devices/master_bedroom_fan', function() {
      mqttclient.publish('devices/master_bedroom_fan/cmnd/Power1', 'TOGGLE');
    });
    socket.on('devices/family_room_fan', function() {
      mqttclient.publish('devices/family_room_fan/cmnd/Power1', 'TOGGLE');
    });
    socket.on('devices/garage_light', function() {
      mqttclient.publish('devices/garage_light/cmnd/Power1', 'TOGGLE');
    });
    socket.on('devices/driveway_lights', function() {
      mqttclient.publish('devices/driveway_lights/cmnd/Power1', 'TOGGLE');
    });
    socket.on('devices/tv_receiver/command/power', function(argument) {
      mqttclient.publish('devices/tv_receiver/command/power', argument);
    });
    socket.on('devices/tv_receiver/command/volume', function(argument) {
      mqttclient.publish('devices/tv_receiver/command/volume', argument + '');
    });
  });
});

// set up our authentication methods (google and jwt).
var opts = {
  jwtFromRequest: function(req) {
    var token = null;
    if (req && req.cookies)
      token = req.cookies['jwt'];
    return token;
  },
  secretOrKey: config.jwt_secret
};
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  done(null, jwt_payload);
}));
passport.use(new GoogleStrategy(config.google_auth, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(passport.initialize());

// set up pages handled by webserver
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'], session: false }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/google', session: false }), function(req, res) {
  if (config.allowed_user_ids.indexOf(req.user.id) != -1) { // if this user is whitelisted in the config
    // Successful authentication, redirect home.
    var token = jwt.sign({ user: { name: req.user.displayName, id: req.user.id, photos: req.user.photos }}, opts.secretOrKey, {
      expiresIn: 604800 // 1 week in seconds
    });
    res.cookie('jwt', token, { maxAge: 604800000, httpOnly: true });
    res.redirect('/');
  } else {
    // not in our allowed list
    res.status(402).send('unauthorized.');
    mqttclient.publish('notify/me', JSON.stringify({
      message: 'unauthorized access from: ' + JSON.stringify(req.user)
    }));
  }
});

// serve the static files from the public folder if we're authenticated
app.use( "/", [ passport.authenticate('jwt', { session: false, failureRedirect: '/auth/google' }), express.static( __dirname + "/public" ) ] );

http.listen(config.web_port);
console.log('listening.');
