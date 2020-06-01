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

var mqtt = require('mqtt');

var inbound_topics = [
  'devices/garage_door_sensor1',
  'devices/garage_door_sensor2',
  'devices/thermostat1/get',
  'devices/master_bedroom_fan/stat/POWER',
  'devices/family_room_fan/stat/POWER',
  'devices/garage_light/stat/POWER',
  'devices/driveway_lights/stat/POWER',
  'devices/christmas_lights/stat/POWER',
  'devices/christmas_tree/stat/POWER',
  'devices/tv_receiver/power',
  'devices/tv_receiver/volume',
  'devices/kitchen/lights4/level',
  'devices/kitchen/lights3/level',
  'devices/family_room/fanlight/level',
  'devices/master_bedroom/light/level',
  'devices/upstairs_hallway/lights/level'
];
 
var outbound_topics = [
  'devices/upstairs_hallway/lights/level/set',
  'devices/kitchen/lights3/level/set',
  'devices/kitchen/lights4/level/set',
  'devices/family_room/fanlight/level/set',
  'devices/master_bedroom/light/level/set',
  'devices/driveway_lights/cmnd/Power1',
  'devices/christmas_lights/cmnd/Power1',
  'devices/christmas_tree/cmnd/Power1',
  'devices/master_bedroom_fan/cmnd/Power1',
  'devices/family_room_fan/cmnd/Power1',
  'devices/garage_light/cmnd/Power1',
  'devices/garage_door_opener1/command',
  'devices/garage_door_opener2/command',
  'devices/tv_receiver/command/power',
  'devices/tv_receiver/command/volume',
  'devices/thermostat1/mode/set',
  'devices/thermostat1/desired_temperature/inc',
  'devices/thermostat1/desired_temperature/dec',
];

// require sockets to authenticate
io.use((socket, next) => {
  // whenever a web client connects, make sure they present a valid jwt token
  if (!socket.handshake.headers.cookie) 
    return next(new Error('Authentication error'));
  var token = cookieparser.parse(socket.handshake.headers.cookie).jwt;
  if(!token) 
    return next(new Error('Authentication error'));
  jwt.verify(token, opts.secretOrKey, function(err, decoded) {
    if (err) 
      return next(new Error('Authentication error'));
    socket.decoded = decoded;
    next();
  });
});

io.on('connection', function(socket) { 
  // make a mqttclient for this socket
  var mqttclient = mqtt.connect(config.mqtt_server);
  mqttclient.on('connect', function () {
    // subscribe to all the devices that we want to show information about
    for (let i = 0; i < inbound_topics.length; i++)
      mqttclient.subscribe(inbound_topics[i]);
  })

  mqttclient.on('message', function (topic, message) {
    io.emit(topic, message.toString());
  });

  // for devices that we aren't keeping track of their state, send a message
  // to the device via MQTT asking for their current state.
  mqttclient.publish('devices/tv_receiver/command/power', 'query');
  mqttclient.publish('devices/tv_receiver/command/volume', 'query');
  // publishing with no payload means query for the following devices
  mqttclient.publish('devices/master_bedroom_fan/cmnd/POWER'); 
  mqttclient.publish('devices/family_room_fan/cmnd/POWER');
  mqttclient.publish('devices/garage_light/cmnd/POWER');
  mqttclient.publish('devices/driveway_lights/cmnd/POWER');
  mqttclient.publish('devices/christmas_lights/cmnd/POWER');
  mqttclient.publish('devices/christmas_tree/cmnd/POWER');


  // maybe we want to do something with the user object like pass it to the
  // garage door?
  var user = socket.decoded.user;

  for (let i = 0; i < outbound_topics.length; i++)
    socket.on(outbound_topics[i], function(data) {
      if (typeof(data) == "object") {
        data.user = user;
        data = JSON.stringify(data);
      }
      mqttclient.publish(outbound_topics[i], data + "");
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

// serve these files without authentication
app.use( "/manifest.webmanifest", express.static( __dirname + "/public/manifest.webmanifest" ) );
app.use( "/ngsw.json", express.static( __dirname + "/public/ngsw.json" ) );
app.use( "/index.html", express.static( __dirname + "/public/index.html" ) );

// serve the static files from the public folder if we're authenticated
app.use( "/", [ passport.authenticate('jwt', { session: false, failureRedirect: '/auth/google' }), express.static( __dirname + "/public" ) ] );

http.listen(config.web_port);
console.log('listening.');
