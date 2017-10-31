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


let remoteContentUrl = "https://rawgit.com/geofs-plugins/plugin-manager-V2/release/src/";

function waitForJquery(method) {
	if (window.jQuery) {
		method();
	} else {
		setTimeout(function() {
			waitForJquery(method);
		}, 50);
	}
}

// tells the user a message
function notify(msg) {
	// TODO : Implement
	alert("Notifications : " + msg);
}

// debug messages
function debug(msg) {
	console.log(msg);
}

// TODO : Fix this, see github issue
// loads the ui from local storage
// and inserts it into the page
function loadUi() {
		// loading the ui
		var uiData = localStorage.getItem("SkyX/ui.user.html");
		if (uiData === null) {
			notify("Downloading ui, please wait");
		} else {
			// load the ui
			$(".geofs-preference-list").append($("li")
				.addClass("geofs-list-collapsible-item")
				.html(uiData));
		}
}

// TODO : Implement this
// loads the plugins from memory
function loadPlugins() {

}

// TODO : Implement this
// updates the plugins
function updatePlugin() {

}

// TODO : Handle download failure better, see github issue
// updates core.user.js and saves it into localStorage
function updateSelf() {

	// updating files
	$.ajax({
		url: "https://api.github.com/repos/geofs-plugins/plugin-manager-V2/commits/release",
		success: function(data) {
			debug("Succesfuly got latest commit hash");
			let latestRemoteCommitHash = data["sha"];

			if (latestRemoteCommitHash != localStorage.getItem("SkyX/version")) {

				let filesToUpdate = ["core.user.js", "ui.user.html"];

				// if one of the updates failed then delete everything
				// and hope for the best
				let hasFailed = false;
				let filesFinished = 0;


				// wait for the files to finish update and notify
				// the user accordingly
				function waitForUpdate() {
					console.log("Testing stuff out");
					if (filesFinished == filesToUpdate.length) {
						if (hasFailed) {
							notify("One of the files failed to download");

							// deleting all of the files
							for (var file in filesToUpdate) {
								localStorage.setItem("SkyX/" + filesToUpdate[file], null);
							}
						} else {
							localStorage.setItem("SkyX/version", latestRemoteCommitHash);
							notify("Succesfuly updated SkyX V2, please refresh GeoFS for the changes to take affect");
						}
					} else {
						setTimeout(function() {
							waitForUpdate();
						}, 50);
					}
				}

				waitForUpdate();

				// go over all of the files and update them all
				for (let file in filesToUpdate) {
					$.ajax({
						url: remoteContentUrl + "src/" + filesToUpdate[file],
						success: function(data) {
							debug("got " + filesToUpdate[file]);
							if ((!("SkyX/ui.user.html" in localStorage)) && filesToUpdate[file] == "ui.user.html") {
								$(".geofs-list").append($("li")
									.addClass("geofs-list-collapsible-item")
									.html(uiData));
							}

							localStorage.setItem("SkyX/" + filesToUpdate[file], data);
							filesFinished++;
						},

						error: function() {
							debug("failed to download" + filesToUpdate[file]);
							hasFailed = true;
							filesFinished++;
						}
					});
				}
			} else {
				debug("Everything is up to date");
			}
		},
		error: function() {
			debug("Getting latest commit hash failed");
		}
	});
}

// main function
// incharge of updating and loading the appropriate files
function main() {

	//if this browser suppoprt Local Storage
	if (typeof(Storage) !== "undefined") {

		loadUi();

		loadPlugins();

		updatePlugin();

		updateSelf();

	} else {
		notify("ERROR , your browser doesn't support Local Storage");
	}
}

// waits for jQuery to load and then calls
waitForJquery(main);
