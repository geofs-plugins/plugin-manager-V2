// This is the core script of the SkyX engine. It will be served by the extension's main server.
// This architecture will allow us not only to update extensions, but to update the SkyX core remotely.
// Its purposes:
//
// 1. Load all extensions and run them - TODO
// 2. Check for plugin updates from their servers - TODO
// 3. Prodive a GeoFS API for adding UI elements and modifying base GeoFS methods - TODO
// 4. Add a UI to manage extensions (add, remove, update, etc.) - WIP
// 5. Update itself - CHECK

// --------- Variables ---------

// Affects what branch to pull from, dev or release.
var isDebug = true;

// The name of the branch to pull from
let remoteBranch = (isDebug ? "dev" : "release");

// A link to the directory that contains all of the remote content
let remoteContentUrl = "https://rawgit.com/geofs-plugins/plugin-manager-V2/" + remoteBranch + "/src/";

// --------- Utilities ---------

// tells the user a message
function notify(msg) 
{
	// TODO : Implement
	alert("Notifications : " + msg);
}

// debug messages
function debug(msg) 
{
	console.log(msg);
}

// Takes the content given and adds that to the game
// in the right spot
let insertUi = function(content) 
{
	$(".geofs-preference-list").
		append("<li class='geofs-list-collapsible-item'>SkyX" + 
			"<ul class='geofs-list'>"+ content +"</ul></li>");
}

// Checks for newer version and downloads all of the required dependendencies
// Does not handle failures well
let updatePlugin = function(pluginId)
{
	let currentCommitHash = localStorage.getItem("SkyX/Plugins/PluginsTable")[pluginId];

	// I know it's not pretty, but that's all we have got and you are gonna have to deal with it
	// TODO : Add failure handlers
	$.ajax(
		{
			url: "https://api.github.com/repos/geofs-plugins/" + pluginId + "/commits/release",
			success: function(data)
			{
				let remoteCommitHash = data["sha"];

				if(remoteCommitHash !== currentCommitHash)
				{
					//Guys , WE HAVE AN UPDATE !
					
					//Download the main file
					$.ajax(
						{
							url: "https://rawgit.com/pluginId/release/src/main.js",
							success: function(data)
							{
								// Save the data locally
								localStorage.setItem("SkyX/Plugins/" + pluginId + "/main.js", data);

								// Download all of the local dependencies
								var pluginObject = eval(data);
								for (let file in pluginObject.localDependencies)
								{
									$.ajax(
										{
											url : "https://rawgit.com/pluginId/release/src/" + file,
											success : function(data)
											{
												localStorage.setItem("SkyX/Plugins/" + pluginId + "/" + file, data);
											},
											error: function()
											{
												notify("An error occured while updating " + pluginId + ", please contant the plugin developer");
											}
										}
									);
								}

								// Pretty much done with this plugin, going on to other ones
								// Update the plugins table with the new commit hash
								var pluginsTable = localStorage.getItem("SkyX/Plugins/PluginsTable");
								pluginsTable[pluginId] = remoteCommitHash;

								// Download all of the remote dependencies
								for(var dependency in pluginObject.remoteDependencies)
								{
									updatePlugin(dependency);
								}
							},
							error: function()
							{
								notify("An error occured while updating " + pluginId + ", please contant the plugin developer");
							}
						}
					);
				}
			},
			error: function()
			{
				notify("An error occured while updating " + pluginId + ", please contant the plugin developer");
			}
		}
	);
};

// A recursive method that fetches all of the plugin's dependencies
// Returns null if some of the dependencies are missing
var getPluginDependencies = function(pluginId, checkedPlugins)
{
	var pluginContent = localStorage.getItem("SkyX/Plugins/" + pluginId + "/main.js");
	if (pluginContent === undefined)
	{
		return null;
	}
	else
	{
		checkedPlugins.push(pluginId);

		var pluginObject = eval(pluginContent);
		console.log(pluginObject);
		for(var remoteDependency in pluginObject.remoteDependencies)
		{
			var isCheckedAlready = remoteDependency in checkedPlugins;
			var hasValidDependencies = checkPlugin(checkedPlugins);

			if(!isCheckedAlready && !hasValidDependencies)
			{
				return null;
			}

			if(isCheckedAlready)
			{
				// If the plugin already exists in the list than move it to be closer
				// to the end as the last plugin is the first to be loaded
				var index = checkedPlugins.indexOf(remoteDependency);
				isCheckedAlready = checkedPlugins.splice(index, 1);
				checkedPlugins.push(remoteDependency);
			}
			else
			{
				checkedPlugins.push(remoteDependency);
			}
		}
	}

	return checkedPlugins;
}

// --------- Main Code Structure ---------

// loads the ui from local storage
// and inserts it into the page
function loadUi() 
{
	// loading the ui
	var uiData = localStorage.getItem("SkyX/Core/ui.user.html");
	if (uiData === null) {
		notify("Downloading ui, please wait");
	} else {
		insertUi(uiData);
	}
}

// Loads the saved plugins and their dependencies
function loadPlugins() 
{
	var pluginsTable = localStorage.getItem("SkyX/Plugins/PluginsTable");
	for (var pluginId in pluginsTable)
	{
		// A list of plugins to load for this specified plugin
		var toLoad = getPluginDependencies(pluginId, []);
		if (toLoad !== null)
		{
			// A list of plugins to load, dependencies first
			toLoad = toLoad.reverse();

			for (loadingPluginId in toLoad)
			{
				var loadingPluginObject = eval(localStorage.getItem("SkyX/Plugins/" + loadingPluginId + "/main.js"));

				// Eval each one of the plugin's files
				for (var file in loadingPluginObject.localDependencies)
				{
					var fileContent = localStorage.getItem("SkyX/Plugins/" + loadingPluginId + "/" + file);
					if(fileContent === undefined)
					{
						debug("Failed to load " + file);
					}
					else
					{
						eval(fileContent);
					}
				}

				loadingPluginObject.load(undefined, undefined);
			}
		}
		else
		{
			debug("Failed to load " + pluginId + " due to missing files");
		}
	}
}

// Updates/Downloads each on the plugins if necessery
function updatePlugins() 
{
	for (let pluginId in localStorage.getItem("SkyX/Plugins/PluginsTable"))
	{
		UpdatePlugin(pluginId);
	}
}

// TODO : Handle download failure better, see github issue
// updates core.user.js and saves it into localStorage
function updateSelf() 
{
	console.log("Enter updateSelf()");

	// updating files
	$.ajax({
		url: "https://api.github.com/repos/geofs-plugins/plugin-manager-V2/commits/" + remoteBranch,

		success: function(data) {
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
							notify("One of the core files failed to download");

							// deleting all of the files
							for (var file in filesToUpdate) {
								localStorage.setItem("SkyX/Core/" + filesToUpdate[file], null);
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
							// if the ui hasn't been loaded yet, and the current file is the ui file
							// the load the content you just fetched.
							if ((!("SkyX/Core/ui.user.html" in localStorage)) && filesToUpdate[file] == "ui.user.html") {
								insertUi(data);
							}

							localStorage.setItem("SkyX/Core/" + filesToUpdate[file], data);
							filesFinished++;
						},

						error: function() {
							notify("failed to update " + filesToUpdate[file]);
							hasFailed = true;
							filesFinished++;
						}
					});
				}
			} else {
				debug("SkyX V2 is up to date");
			}
		},
		error: function() {
			notify("Getting latest commit hash failed");
		}
	});
}

// --------- Handling all of the main code ---------

// main function
// incharge of updating and loading the appropriate files
function main() {
	// Checking if this browser suppoprt Local Storage
	if (typeof(Storage) !== "undefined") {
		loadUi();

		loadPlugins();

		updatePlugins();

		updateSelf();
	} else {
		notify("ERROR , your browser doesn't support Local Storage");
	}
}

// main code
(function() {
	// waits for jQuery to load and then calls
	var nTimer = setInterval(function() {
		if (window.jQuery) {
			clearInterval(nTimer);
			main();
		}
	}, 100);
})();
