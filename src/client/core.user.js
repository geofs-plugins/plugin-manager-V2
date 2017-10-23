// This is the core script of the SkyX engine. It will be served by the extension's main server.
// This architecture will allow us not only to update extensions, but to update the SkyX core remotely.
// Its purposes:
//
// 1. Load all extensions and run them.
// 2. Check for plugin updates from their servers
// 3. Prodive a GeoFS API for adding UI elements and modifying base GeoFS methods.
// 4. Add a UI to manage extensions (add, remove, update, etc.)
//
// This is the release version of the file.
// (Add if I missed something, Ron)
//

(function() {
	var CORE_VERSION = "0.1.0";
	SkyXDebug.log("Core has been loaded");
});

// Adding some lines to trigger WebHook
