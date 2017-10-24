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
	
	/*
	Description:
		Sets global window tag functions like __DEPRECATED__ or __UNTESTED__ or __NOT_WORKING__
		Put these tags only inside functions - in the first line so they are clearly visible.
	*/
	this.set_window_tags = function() {
		let warn = this.warn;
		
		window.__DEPRECATED__ = function() {
			warn("__DEPRECATED__ alert for `" + arguments.callee.caller.name + "`");
		};
		window.__UNTESTED__ = function() {
			warn("__UNTESTED__ alert for `" + arguments.callee.caller.name + "`");
		};
		window.__NOT_WORKING__ = function() {
			warn("__NOT_WORKING__ alert for `" + arguments.callee.caller.name + "`");
		};
		window.__BAD__ = function() {
			warn("__BAD__ alert for `" + arguments.callee.caller.name + "`");
		};
		
	};
	
	this.set_window_tags();
	
};

/*
Description:
	The main class of base.user.js - the SkyXBase is responsible for the tasks listed in the top of the file.
*/
SkyX.SkyXBase = function() {
	
	var DEFAULT_UPDATE_URL = "http://localhost:8080/download.php";
	
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
		updates the core version number
	*/
	this.update_version = function(ver) {
		localStorage.setItem("skyx_version", ver);
	}
	
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
		__UNTESTED__();
		
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

	this.first_update = function() {
		if (this.query_version() == null) {

			var src = localStorage.getItem("skyx_default_url") || DEFAULT_UPDATE_URL;

			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					localStorage.setItem("skyx_core", this.responseText);
					eval(this.responseText)();
				}
			};
			xhttp.open("GET", src, true);
			xhttp.send();
			return true;
		}
		else {
			// TODO load presaved version
			return false;
		}
	};
	
};

/*
Description:
	Main code of base.user.js
*/
(function() {
	
	window.SkyXBase = new SkyX.SkyXBase();
	window.SkyXDebug = new SkyX.Debugger();
	
	SkyXBase.wait_geofs(function(fs) {
		SkyXBase.first_update();
	});
	
})();