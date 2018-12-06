// ==UserScript==
// @name            SkyX V2
// @author          Yotam Salmon & Ron Popov
// @namespace       GeoFS-plugins
// @version         0.1
// @description     Adds additional content to Geo-FS
// @match           https://geo-fs.com/geofs.php*
// @match           https://www.geo-fs.com/geofs.php*
// @grant       none
// ==/UserScript==

// This is the raw script that will be included in the Monkey user-script.
// Its purposes:
//
// 1. In the first run of the plugin, download the main.user.js from the server, store it into the localStorage
// 2. Wait for jQuery and GeoFS objects to load in the page, then load the main.user.js from the localStorage and run it

// TODO - Fix mistakes and change the method Base auto-updates

// Affects what method this will query the version and update from.
var isDebug = true;

(function() {
	var on_download_latest_version_success = function(req) {
		var el = document.createElement("script");
		el.innerHTML = req.responseText;
		document.head.appendChild(el);
		localStorage.setItem("SkyX/Core/core.user.js", el.innerText);
	};

	var download_latest_version = function() {
		var req = new XMLHttpRequest();
		req.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				on_download_latest_version_success(req);
			}
		};

		if (isDebug)
		{
			req.open("GET", "https://cdn.jsdelivr.net/gh/geofs-plugins/plugin-manager-V2@dev/src/core.user.js", "true");
			req.send();
		}
		else
		{
			req.open("GET", "https://cdn.jsdelivr.net/gh/geofs-plugins/plugin-manager-V2@release/src/core.user.js", "true");
			req.send();
		}
	};
	
	console.log("SkyX base loader has been loaded");
	
	if (!window["localStorage"]) {
		consolw.log("SkyX could not locate the localStorage object. Seems like this browser is not supported");
	}
	
	var core_exists = localStorage.getItem("SkyX/Core/core.user.js") !== null;
	
	if (core_exists) {
		console.log("SkyX base, loading the existing core.user.js file locally.");
		var el = document.createElement("script");
		el.innerHTML = localStorage.getItem("SkyX/Core/core.user.js");
		document.head.appendChild(el);
	}
	else {
		console.log("SkyX base making the first download query to our GitHub servers.");
		download_latest_version();
	}
})();
