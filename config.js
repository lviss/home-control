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
  // clientSecret is loaded from the GOOGLE_CLIENT_SECRET environment variable rather than
  // hardcoded here. In production, NixOS populates that env var from an agenix-managed
  // secret (see the laneos repo) - this repo only needs to read it from the environment.
  "google_auth": {
    "clientID": "1234123412341234.apps.googleusercontent.com",
    "clientSecret": process.env.GOOGLE_CLIENT_SECRET || "<set via GOOGLE_CLIENT_SECRET env var>",
    "callbackURL": "https://example.com/auth/google/callback"
  },
  // used to sign the JWT tokens. Loaded from the JWT_SECRET environment variable rather
  // than hardcoded here - see the note on clientSecret above.
  "jwt_secret": process.env.JWT_SECRET || "<set via JWT_SECRET env var>",
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
