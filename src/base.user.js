// This is the raw script that will be included in the Monkey user-script.
// Its purposes:
//
// 1. In the first run of the plugin, download the main.user.js from the server, store it into the localStorage
// 2. Wait for jQuery and GeoFS objects to load in the page, then load the main.user.js from the localStorage and run it

// TODO - make the file

/*
Description:
	The SkyX namespace contains everything related to SkyX's base and core.
*/
window.SkyX = {};

/*
Description:
	A class to signal that something went wrong.
	Will usually be used like: 
		throw new SkyX.Exception(<error message>);
*/
SkyX.Exception = function(message) {
	this.message = message;
	this.type = "Exception";
};

/*
Description:
	An exception that signals that LocalStorage is not supported.
	
Base class:
	SkyX.Exception
*/
SkyX.LocalStorageException = function(message) {
	SkyX.Exception.call(this, message || "Local Storage is not supported on this browser");
	this.type = "LocalStorageException";
};

/*
Description:
	The main class of base.user.js - the SkyXBase is responsible for the tasks listed in the top of the file.
*/
SkyX.SkyXBase = function() {
	
	
	/*
	Description:
		Queries the version number of the currently installed SkyXCore object
	
	Parameters:
		none.
	
	Return values:
		string - the version number in (%d.%d.%d) format
		null - no version of SkyXCore is installed
		undefined - localStorage is not supported (problem!)
	*/
	this.query_version = function() {
		return window["localStorage"] && (localStorage.getItem("skyx_version") || null);
	};
	
	/*
	Description:
		Queries the SkyXCore object source code of the currently installed version of SkyX from the local storage.
		
	Parameters:
		none.
		
	Return values:
		string - the source code.
		null - no version of SkyXCore is installed.
	
	Exceptions:
		Will throw a SkyX.LocalStorageException if localStorage is not supported.
	*/
	this.query_core = function() {
		// Checking if localStorage is supported
		if (!window["localStorage"]) {
			throw new SkyX.LocalStorageException();
		}
		
		// Retrieving the core code
		return localStorage.getItem("skyx_core") || null;
	};
	
};

(function() {
	
	
	
})();