const ResourceLoader = function() {

    const _makescript = function(url) {
        var el = document.createElement("script");
        el.type = "text/javascript";
        el.src = url;
        return el;
    };

    var _makestyle = function(url) {
        var el = document.createElement("link");
        el.rel = "stylesheet";
        el.type = "text/css";
        el.href = url;
        return el;
    }

    const _require = function(url) {
        return new Promise((resolve, reject) => {
            var el = url.endsWith(".js") ? _makescript(url) : _makestyle(url);
            el.onload = function() {
                resolve(url);
            };
            (document.head || document.documentElement).appendChild(el);
        });
    };

    this.require = function() {
        return new Promise((resolve, reject) => {
            tasks = [...arguments];
            for (var task of tasks) {
                _require(task)
                    .then((url) => {
                        var index = tasks.indexOf(url);
                        if (index != -1)
                            tasks[index] = null;
                        
                        if (tasks.join().replace(/,/g,'').length === 0)
                            resolve();
                    });
            }
        });
    };

    this.waitfor = function() {
        return new Promise((resolve, reject) => {
            var tasks = [...arguments];
            var x = setInterval(() => {
                for (var a of tasks) {
                    if (!eval("window." + a))
                        return;
                }

                clearInterval(x);
                resolve();
            }, 10);
        });
    }

    return this;

};

const VoiceChannel = function() {
    var webrtc;

    var audioDOM = $("<div></div>", {
        css: {display: "none"},
        class: "audio-dom"
    });

    var self_audio_id = "audioDom_" + new Date().valueOf();
    audioDOM.append($("<audio></audio>").attr({
        controls: true,
        oncontextmenu: "return false;",
        volume: 0,
        disabled: true,
        id: self_audio_id
    }));
    
    var remote_audio_id = "audioDom_" + new Date().valueOf();
    audioDOM.append($("<div></div>", {
        id: remote_audio_id
    }));

    $("body").append(audioDOM);

    this.webrtc = () => {
        return webrtc;
    };

    this.connect = () => {
        webrtc = new SimpleWebRTC({
            localVideoEl: self_audio_id,
            remoteVideosEl: remote_audio_id,
            autoRequestMedia: true,
            enableDataChannels: true,
            media: {
                audio: true,
                video: false
            }
        });

        webrtc.on("readyToCall", function() {
            webrtc.joinRoom("geofs-voice-chat", function(err, res) {
                if (err) {
                    console.log("WebRTC Error");
                    return;
                }
                webrtc.mute();
                console.log("WebRTC connected");
            });
        });
    };
}

window.skyx = {};
window.skyx.loader = new ResourceLoader();
window.require = window.skyx.loader.require;
window.waitfor = window.skyx.loader.waitfor;

require(
	"https://drive.google.com/uc?export=view&id=1j1cZTuChJLGiwsbbpzorjfF6aIYnAFk3#.js"
).then(() => []);