// This is the core script of the SkyX engine. It will be served by the extension's main server.
// This architecture will allow us not only to update extensions, but to update the SkyX core remotely.
// Its purposes:
//
// 1. Load all extensions and run them - TODO
// 2. Check for plugin updates from their servers - TODO
// 3. Prodive a GeoFS API for adding UI elements and modifying base GeoFS methods - TODO
// 4. Add a UI to manage extensions (add, remove, update, etc.) - WIP
// 5. Update itself - CHECK

// Affects what branch to pull from, dev or release.
var isDebug = false;

// The name of the branch to pull from
let remoteBranch = (isDebug ? "dev" : "release");

// A link to the directory that contains all of the remote content
let remoteContentUrl = "https://cdn.rawgit.com/geofs-plugins/plugin-manager-V2/" + remoteBranch + "/src/";


// waits for jQuery to load and then
// calls the callback function, passed as a parameter
function waitForJquery(method) {
	console.log("waiting for jQuery");
	if (window.jQuery) {
		console.log("jQuery found");
		clearTimeout();
		method();
	} else {
		console.log("jQuery not found trying again");
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
		insertUi(uiData);
	}
}

// Takes the content given and adds that to the game
// in the right spot
function insertUi(content) {
	$(".geofs-preference-list").
		append("<li class='geofs-list-collapsible-item'>SkyX" + 
			"<ul class='geofs-list'>"+ content +"</ul></li>");
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
	console.log("Enter updateSelf()");

	// updating files
	$.ajax({
		url: "https://api.github.com/repos/geofs-plugins/plugin-manager-V2/commits/" + remoteBranch,

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
						url: remoteContentUrl + filesToUpdate[file],
						success: function(data) {
							debug("got " + filesToUpdate[file]);
							// if the ui hasn't been loaded yet, and the current file is the ui file
							// the load the content you just fetched.
							if ((!("SkyX/ui.user.html" in localStorage)) && filesToUpdate[file] == "ui.user.html") {
								insertUi(data);
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

// main code
(function() {
	// waits for jQuery to load and then calls
	waitForJquery(main);
})();
