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


// tells the user a message
function notify(msg) {
	// TODO : Implement
	alert("Notifications : " + msg);
}

function debug(msg) {
	console.log(msg);
}

// main function
function main() {

	//if this browser suppoprt Local Storage
	if(typeof(Storage) !== "undefined") {

		// loding the ui
		let remoteContentUrl = "https://raw.githubusercontent.com/geofs-plugins/plugin-manager-V2/master/";
		var uiData = localStorage.getItem("ui.user.html");
		if (uiData === null) {
			notify("Downloading ui, please wait");
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
				debug("Succesfuly got latest commit hash");
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
								notify("One of the files failed to download");

								// deleting all of the files
								for (var file in filesToUpdate) {
									localStorage.setItem(file, null);
								}
							} else {
								localStorage.setItem("latestRemoteCommitHash", latestRemoteCommitHash);
								notify("Succesfuly updated SkyX V2, please refresh GeoFS for the changes to take affect");
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
								debug("got " + file);
								if((!("ui.user.html" in localStorage)) && file == "ui.user.html") {
									$(".geofs-list").append($("li")
											.addClass("geofs-list-collapsible-item")
											.html(uiData));
								}

								localStorage.setItem(file, data);
								filesFinished++;
							} ,

							error : function(){
								debug("failed " + file);
								hasFailed = false;
								filesFinished++;
							}
						});
					}
				}
			} ,
			error : function() {
				debug("Getting latest commit hash failed");
			}
		});
	} else {
		notify("ERROR , your browser doesn't support Local Storage");
	}
}

waitForJquery(main);
