# Just another IOT home control app

This is a collection of apps that I use to control devices in my home. It is pretty tailored to my specific setup and devices so it might be hard for someone else to implement it in their own home.

The app is made up of these parts:

* web server
  * how users interact with the system
  * Google Oauth authentication
  * socketio web interface
* notify_me
  * an app for alerting me of things that happen
* onkyo_control
  * an app for interfacing with an onkyo tv receiver

Each of the app components and all the devices in the house communicate using MQTT. In the future it might be cool to make the MQTT server included in the docker-compose build.

All the components can easily be brought up together using docker-compose:

    // update /config.js
    // update /notify_me/config.js
    // update /onkyo_control/config.js
    // update /scheduler/config.js
    // update /docker-compose.yaml (especially ports and hostnames)
    docker-compose build
    docker-compose up -d

To restart the app after making changes:

    docker-compose build && docker-compose down && docker-compose up -d
