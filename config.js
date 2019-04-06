module.exports = {
  // the port the webserver will listen on. This shouldn't be exposed directly to the 
  // internet because it doesn't have SSL. We'll implement an NGINX reverse proxy in
  // a docker container to solve that. Check the docker-compose.yaml file for that.
  "web_port": 8080, 
  // the address of the mqtt server
  "mqtt_server": 'mqtt://192.168.1.100',
  // were going to use google's OAuth api for authentication.
  // clientID, clientSecret you get from Google's Developer Console 
  // (https://console.developers.google.com/), and callbackURL is the url that google
  // will redirect users to after they have authenticated. (ex. https://example.com/auth/google/callback)
  "google_auth": {
    "clientID": "1234123412341234.apps.googleusercontent.com",
    "clientSecret": "abcdabcdabcdabcd",
    "callbackURL": "https://example.com/auth/google/callback"
  },
  // generate a random string for this, it'll be used to sign the JWT tokens.
  "jwt_secret": "put some _RANDOM_ data here",
  // each string in this array maps to a user's ID (assigned by google) that is allowed
  // to log in to this site. If a user tries to log in that doesn't appear in this array,
  // an email is generated and sent to the administrator. That email contains the ID that
  // should be listed below, if you want to grant a user access.
  "allowed_user_ids": [ 
    "123456789012345678901", // user 1
    "123456789012345678902", // user 2
    "123456789012345678903", // user 3
    "123456789012345678904", // user 4
    "123456789012345678905"  // user 5
  ]
}
