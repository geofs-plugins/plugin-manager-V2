// This is the raw script that will be included in the Monkey user-script.
// Its purposes:
//
// 1. In the first run of the plugin, download the main.user.js from the server, store it into the localStorage
// 2. Wait for jQuery and GeoFS objects to load in the page, then load the main.user.js from the localStorage and run it

// TODO - make the file