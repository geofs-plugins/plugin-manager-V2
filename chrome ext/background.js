chrome.webNavigation.onCompleted.addListener(function(details) {

	function exec(func, params) {
		chrome.tabs.executeScript(details.tabId, {code: "(" + (function(e) {
			var scr = "(" + e.func.toString() + ")(" + JSON.stringify(e.params) + ");";
			var el = document.createElement("script");
			el.innerText = scr;
			(document.head || document.documentElement).appendChild(el);
		}).toString() + ")(" + JSON.stringify({func: func.toString(), params: params}) + ");"});
	}
	
	if (~details.url.indexOf("geo-fs.com/geofs.php")) { // Checking if we're in GeoFS
		exec(function() {

			var DEBUG_URL = "http://localhost:8000/index.js";
			var PRODUCTION_URL = "https://drive.google.com/uc?export=view&id=1Rslzcmi-EoOQB8Hzq43zUz34RjhNfnW4";
 
			var url = window.localStorage.getItem("skyx_2_debugmode") ? DEBUG_URL : PRODUCTION_URL;

			var el = document.createElement("script");
			el.src = url;
			(document.head || document.documentElement).appendChild(el);
		});
	}
});
