# Just another IOT home control app

This is a collection of apps that I use to control devices in my home. It is pretty tailored to my specific setup and devices so it might be hard for someone else to implement it in their own home.

The app is made up of these parts:

* web server
  * how users interact with the system
  * Google Oauth authentication
  * socketio web interface
* onkyo_control
  * an app for interfacing with an onkyo tv receiver
* scheduler
  * an app for running scheduled/cron-like actions against devices
* hold_press_handler
  * an app that watches for "hold" button presses on sonoff devices and triggers other actions (e.g. opening the garage door)

Each of the app components and all the devices in the house communicate using MQTT. In the future it might be cool to make the MQTT server included in the docker-compose build.

`/config.js` reads two secrets from the environment instead of storing them in the file:

* `GOOGLE_CLIENT_SECRET` - the OAuth client secret from Google's Developer Console
* `JWT_SECRET` - a random string used to sign JWT tokens

In production these are populated by NixOS from an agenix-managed secret file (see the `laneos` repo); for local/manual runs, export them yourself before starting the app.

All the components can easily be brought up together using docker-compose:

    // update /config.js (google_auth.clientID, allowed_user_ids)
    // export GOOGLE_CLIENT_SECRET and JWT_SECRET in the environment
    // update /onkyo_control/config.js
    // update /scheduler/config.js
    // update /hold_press_handler/config.js
    // update /web/src/environments/environment.prod.ts
    // update /docker-compose.yaml (especially ports and hostnames)
    docker-compose build
    docker-compose up -d

To restart the app after making changes:

    docker-compose build && docker-compose down && docker-compose up -d
