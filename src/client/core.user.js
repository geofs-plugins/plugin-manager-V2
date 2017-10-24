// This is the core script of the SkyX engine. It will be served by the extension's main server.
// This architecture will allow us not only to update extensions, but to update the SkyX core remotely.
// Its purposes:
//
// 1. Load all extensions and run them.
// 2. Check for plugin updates from their servers
// 3. Prodive a GeoFS API for adding UI elements and modifying base GeoFS methods.
// 4. Add a UI to manage extensions (add, remove, update, etc.)
//
// (Add if I missed something, Ron)
//

// waits for jquery to load then call method
function waitForJquery(method) {
	if(window.jQuery) {
		method();
	} else {
		setTimeout(function() {waitForJquery(method)} , 50);
	}
}

// main function
function main() {

	//if this browser suppoprt Local Storage
	if(typeof(Storage) !== "undefined") {

		// load ui.user.html into a settings collapsable item
		var baseContentUrl = "https://raw.githubusercontent.com/geofs-plugins/plugin-manager-V2/master/";

		$.ajax({
			url : baseContentUrl + "src/client/ui.base.html",
			callback : function(data) {
				$(".geofs-list").append($("li").addClass("geofs-list-collapsible-item").html(data));
			}
		});

		var CORE_VERSION = "0.1.0";
		SkyXDebug.log("Core has been loaded");
	} else {
		console.log("Sorry, SkyX cannot run without local storage support");
	}



	// TODO : Update core.user.js
	// TODO : Update ui.user.html

});

// TODO : Adding some lines to trigger WebHook
