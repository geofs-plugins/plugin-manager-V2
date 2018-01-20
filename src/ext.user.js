// This is an extension file. It can do basically everything! (Add planes, make the multiplayer better, change the skin of the menus, whatever...)
// It is served dynamically and auto-updated by the extension server(s) and will be saved in localStorage.

// Format: (add/remove fields if needed)

(function(ext) {
	
	ext.name = "My Awesome First Extension!";
	ext.version = "0.1";
	ext.author = "Yotam Salmon";

	// A list of local files (in the same github repo) that the extension requires
	ext.localDependencies = ["core.user.js", "data/ui.user.html"];
	
	// A list of remote extensions that the extension requires
	ext.remoteDependencies = ["geofs-plugins/plugin-manager", "geofs-plugins/voice-atc"];

	// Can we use the github username and repo as an id ?
	//ext.id = "yotam.salmon@gmail.com/myfirstextension"; // You may just set up another id convention
	
	// We know where we need to update from, from the github repo.
	//ext.update_from = "https://skyx-extension.com/update.php?id=yotam.salmon@gmail.com/myfirstextension"; // Just a fake sample url
	
	ext.load = function(geofs, skyx) {
		// For loading the extension
	};

	ext.loop = function(geofs, skyx) {
		// For performing a repetitive task 
	};

	ext.dispose = function(geofs, skyx) {
		// For folding the extension
	};
	
	return ext;
	
})({});
