// ==UserScript==
// @name            SkyX V2
// @author          Yotam Salmon & Ron Popov
// @namespace       GeoFS-plugins
// @version         0.0.1
// @description     Adds additional content to Geo-FS
// @match           http://geo-fs.com/geofs.php*
// @match           http://www.geo-fs.com/geofs.php*
// @grant       none
// ==/UserScript==

// This is the raw script that will be included in the Monkey user-script.
// Its purposes:
//
// 1. In the first run of the plugin, download the main.user.js from the server, store it into the localStorage
// 2. Wait for jQuery and GeoFS objects to load in the page, then load the main.user.js from the localStorage and run it

// TODO - Fix mistakes and change the method Base auto-updates

// Affects what branch to pull from, dev or release.
var isDebug = false;

// The name of the branch to pull from
let remoteBranch = (isDebug ? "dev" : "release");

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

SkyX.Debugger = function() {

	/*
	Description:
		Will output a console warning and optionally state what extension it came from.

	Parameters:
		string - message - the message of the warning.
		object -  module - the extension object (usually just passing `this` would be enough)

	Return value:
		none
	*/
	this.warn = function(message, module) {
		if (module) {
			console.warn("[" + module.name + "] SkyX Debugger: " + message);
		}
		else {
			console.warn("SkyX Debugger: " + message);
		}
	};

	/*
	Description:
		Will output a console log and optionally state what extension it came from.
	
	Parameters:
		string - message - the message of the log.
		object -  module - the extension object (usually just passing `this` would be enough)
		
	Return value:
		none
	*/
	this.log = function(message, module) {
		if (module) {
			console.log("[" + module.name + "] SkyX Debugger: " + message);
		}
		else {
			console.log("SkyX Debugger: " + message);
		}
	};
	
};

/*
Description:
	The main class of base.user.js - the SkyXBase is responsible for the tasks listed in the top of the file.
*/
SkyX.SkyXBase = function() {

	var DEFAULT_UPDATE_URL = "https://cdn.rawgit.com/geofs-plugins/plugin-manager-V2/"
		+ remoteBranch + "/src/core.user.js";
	
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
		return window["localStorage"] && (localStorage.getItem("SkyX/version") || null);
	};

	/*
	Description:
		updates the core version number
	*/
	this.update_version = function(ver) {
		localStorage.setItem("SkyX/version", ver);
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
		return localStorage.getItem("SkyX/core.user.js") || null;
	};
	
	/*
	Description:
		returns the global `geofs` object.
		Please do not use the global `geofs`. Call this method or use a parameter-given `geofs` (in order not to break CI 'builds' if there will be any)
		
	Return values:
		object - the `geofs` object.
		null - if the global `geofs` object is undefined or null.
	*/
	this.query_geofs = function() {
		return window["geofs"] || null;
	};
	
	/*
	Description:
		Waits asynchronously for the `geofs` object to load, then calls a callback.
	
	Parameters:
		invocable - callback - the callback to be invoked once GeoFS is loaded.
			Invokes the callback with the geofs parameter.
	
	Return values:
		none
	*/
	this.wait_geofs = function(callback) {
		
		let query_geofs = this.query_geofs;

		let a = function() {
			setTimeout(function() {
				if (query_geofs()) {
					callback(query_geofs());
				}
				else {
					// This is **not** recursive. Just invokes itself in a timeout (No traces are left on the stack). Should not create any problems.
					a(callback); 
				}
			}, 2);
		};
		a();
	};


	/*
	Description:
		downloads core.user.js if not saved in local storage, and loads it.

	Parameters:
		none
	
	Return values:
		none
	*/
	this.first_update = function() {
		if (this.query_version() === null) {

			var src = localStorage.getItem("SkyX/defaultUpdateUrl") || DEFAULT_UPDATE_URL;

			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {

                    let coreContent = this.responseText;
					
                    eval(this.responseText);

					// fetches the latest commit hash and saved it in memory as SkyX/version
					// it id done inside of the callback function to handle the rare case that
					// fetching core.user.js will succed, but fetching the commit hash won't
					var commitHistoryUrl = 
						"https://api.github.com/repos/geofs-plugins/plugin-manager-V2/commits/" +
						remoteBranch;
					var xhttp2 = new XMLHttpRequest();
					xhttp2.onreadystatehange = function() {
						if(this.readyState == 4 && this.status == 200) {
							var commitHash = this.responseText["sha"];
							localStorage.setItem("SkyX/core.user.js", coreContent);
							localStorage.setItem("SkyX/version", commitHash);
						} else {
							// TODO : Alert that an error occured
						}
					};

                    xhttp2.open("GET", commitHistoryUrl, true);
                    xhttp2.send();
				} else {
					// TODO : Alert that an error occured
				}
			};
			xhttp.open("GET", src, true);
			xhttp.send();
			return true;
		}
		else {
            var localContent = localStorage.getItem("SkyX/core.user.js");
            if(localContent !== null) {
                eval(localContent);
            }
			
            return false;
		}
	};

};

/*
Description:
	Main code of base.user.js
*/
(function() {

	'use strict';

	window.SkyXBase = new SkyX.SkyXBase();
	window.SkyXDebug = new SkyX.Debugger();

	SkyXBase.wait_geofs(function(fs) {
		SkyXBase.first_update();
	});

})();
