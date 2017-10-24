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

		// loding the ui
		let remoteContentUrl = "https://raw.githubusercontent.com/geofs-plugins/plugin-manager-V2/master/";
		var uiData = localStorage.getItem("ui.user.html");
		if (uiData === null) {
			// ALERT : please wait for the ui file to download
		} else {
			// load the ui
			$(".geofs-list").append($("li")
					.addClass("geofs-list-collapsible-item")
					.html(uiData));
		}

		// updating files
		$.ajax({
			url : "https://api.github.com/repos/geofs-plugins/plugin-manager-V2/commits/release",
			callback : function(data) {
				let latestRemoteCommitHash = data["sha"];

				if(latestRemoteCommitHash != localStorage.getItem("latestRemoteCommitHash")) {

					let filesToUpdate = ["core.user.js", "ui.user.html"];

					// if one of the updates failed then delete everything
					// and hope for the best
					let hasFailed = false;
					let filesFinished = 0;

					// wait for the files to finish update and notify
					// the user accordingly
					function waitForUpdate() {
						if (filesFinished = filesToUpdate.length) {
							if (hasFailed) {
								// ALERT : An error occured

								// deleting all of the files
								for (var file in filesToUpdate) {
									localStorage.setItem(file, null);
								}
							} else {
								localStorage.setItem("latestRemoteCommitHash", latestRemoteCommitHash);
								// ALERT : everything has finished, please refresh
							}
						} else {
							setTimeout(function() {waitForUpdate()} , 500);
						}
					}

					waitForUpdate();

					// go over all of the files and update them all
					for (let file in filesToUpdate) {
						$.ajax({
							url : remoteContentUrl + "src/client/" + file,

							callback : function(data) {
								if((!("ui.user.html" in localStorage)) && file == "ui.user.html") {
									$(".geofs-list").append($("li")
											.addClass("geofs-list-collapsible-item")
											.html(uiData));
								}

								localStorage.setItem(file, data);
								filesFinished++;
							} ,

							error : function(){
								hasFailed = false;
								filesFinished++;
							}
						});
					}
				}
			}
		});


		var CORE_VERSION = "0.1.0";
		SkyXDebug.log("Core has been loaded");
	} else {
		console.log("Sorry, SkyX cannot run at the moment without local storage support");
	}
});

// TODO : Adding some lines to trigger WebHook
