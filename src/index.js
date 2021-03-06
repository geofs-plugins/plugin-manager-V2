
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

const OptionsView = function(title, addto = ".geofs-preference-list", action="append", containerType="div") {
    this.rootElement = $("<li></li>", {
        class: "geofs-list-collapsible-item geofs-preference-controls",
        text: title
    });

    this.container = $("<%s></%s>".replace(/\%s/g, containerType), {
        class: "geofs-collapsible"
    });

    this.rootElement.append(this.container);
    $(addto)[action](this.rootElement); // Appending ourselves into the options panel.

    return this;
}

const FullscreenModal = function(icon, title, body, footer) {

    this.uniqueId = "_modal" +  new Date().valueOf();

    this.rootElement = $("<div></div>", {
        class: "ui basic modal",
        id: this.uniqueId,
        css: { fontSize: "1.4rem" }
    });

    this.iconHeader = $("<div></div>", {
        class: "ui icon header",
        text: title
    });

    this.iconI = $("<i></i>", {
        class: icon + " icon"
    });

    this.container = $("<div></div>", {
        class: "content",
        html: body
    });

    this.footer = $("<div></div>", {
        class: "actions",
        html: footer
    });

    this.iconHeader.prepend(this.iconI);
    this.rootElement.append(this.iconHeader);
    this.rootElement.append(this.container);
    this.rootElement.append(this.footer);
    
    $("body").append(this.rootElement);

    this.open = function(resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;

        $("#" + this.uniqueId).modal({
            closable: false,
            onApprove: resolve,
            onDeny: reject
        });
        $(".dimmer").css({backgroundColor: "rgba(0,0,0,0.6)"})

        $("#" + this.uniqueId).modal("show");
    }

    return this;
};

function ModifyAircraft() {
    geofs.aircraft.Aircraft.prototype.load = function(a, b, c) {
        var isExternal = a.toString().indexOf("skyx") == 0;
        var loadUrl = geofs.url + "/models/aircraft/load.php";
        if (geofs.aircraftList[a] && geofs.aircraftList[a].local) {
            loadUrl = geofs.aircraftList[a].path + "aircraft.json";
        }
        if (isExternal) {
            loadUrl = "https://aircraft-loader.appspot.com/aircraft";
            a = a.substr(4);
        }
        $.ajax(loadUrl, {
            data: {
                id: a
            },
            dataType: "text",
            success: function(d, e, f) {
                if ("error" != e) {
                    if (geofs.aircraftList[a] && geofs.aircraftList[a].local && (d = JSON.stringify({
                        id: a,
                        name: geofs.aircraftList[a].name,
                        fullPath: geofs.aircraftList[a].path,
                        isPremium: !1,
                        isCommunity: !1,
                        definition: btoa(d)
                    })),
                    d = geofs.aircraft.instance.parseRecord(d)) {
                        if (!geofs.aircraftList[a] || !geofs.aircraftList[a].local) {
                            if (isExternal) {
                                geofs.aircraft.instance.aircraftRecord.fullPath = geofs.aircraft.instance.aircraftRecord.fullPath;
                            }
                            else {
                                geofs.aircraft.instance.aircraftRecord.fullPath = geofs.url + geofs.aircraft.instance.aircraftRecord.fullPath;
                            }
                        }
                        // Hotfix! Maybe too hot?
                        for (var inst in d.instruments) if (d.instruments.hasOwnProperty(inst)) {
                            if (d.instruments[inst].constructor.name === "Object" && !d.instruments[inst].position && inst === "pfd") {         
                                console.log(inst, d.instruments[inst]);                    
                                d.instruments[inst].overlay = {
                                    ...{"url":"https://www.geo-fs.com/images/instruments/a380pfd/a380pfd.png","size":{"x":200,"y":200},"anchor":{"x":256,"y":256},"position":{"x":0,"y":0},"drawOrder":1,"rescale":true,"rescalePosition":true,"overlays":[{"animations":[{"type":"rotate","value":"aroll","ratio":-1,"min":-180,"max":180},{"type":"translateY","value":"atilt","ratio":-2,"offset":330,"min":-90,"max":90}],"url":"https://www.geo-fs.com/images/instruments/attitude-jet-hand.png","anchor":{"x":100,"y":70},"size":{"x":180,"y":null},"position":{"x":-16,"y":8},"drawOrder":0,"iconFrame":{"x":200,"y":140}},{"animations":[{"type":"translateY","value":"kias","ratio":2.1,"offset":0,"min":0,"max":1200}],"url":"https://www.geo-fs.com/images/instruments/a380pfd/kias.png","anchor":{"x":0,"y":100},"size":{"x":30,"y":100},"position":{"x":-98,"y":14},"iconFrame":{"x":40,"y":170},"drawOrder":1},{"animations":[{"type":"translateY","ratio":0.2385,"offset":260,"min":0,"max":100000}],"url":"https://www.geo-fs.com/images/instruments/a380pfd/altitude.png","anchor":{"x":0,"y":0},"size":{"x":15,"y":null},"position":{"x":51,"y":-44},"iconFrame":{"x":32,"y":220},"drawOrder":1},{"animations":[{"type":"translateY","value":"altThousands","ratio":0.238,"offset":75,"min":0,"max":100000},{"type":"translateX","ratio":-22.7,"min":0,"max":100000}],"name":"altten","url":"https://www.geo-fs.com/images/instruments/a380pfd/altitudetens.png","anchor":{"x":0,"y":0},"size":{"x":100,"y":null},"position":{"x":47,"y":-44},"iconFrame":{"x":10,"y":220},"drawOrder":1},{"animations":[{"type":"rotate","ratio":-8.6,"offset":0,"min":-8.7,"max":8.7},{"type":"scaleX","value":"climbrateABS","ratio":0.005,"offset":0,"min":1500,"max":5000},{"type":"moveY","value":"climbrateLog","ratio":3.8,"offset":0,"min":-8.7,"max":8.7}],"url":"https://www.geo-fs.com/images/instruments/a380pfd/vario.png","anchor":{"x":50,"y":2},"size":{"x":10,"y":2},"position":{"x":90,"y":7},"drawOrder":1},{"url":"https://www.geo-fs.com/images/instruments/a380pfd/altitude-mask.png","anchor":{"x":0,"y":0},"size":{"x":30,"y":null},"position":{"x":43,"y":-1},"drawOrder":1},{"animations":[{"type":"translateY","ratio":0.83,"offset":0}],"url":"https://www.geo-fs.com/images/instruments/a380pfd/tenfeet.png","anchor":{"x":0,"y":0},"size":{"x":9,"y":null},"position":{"x":62,"y":1},"iconFrame":{"x":20,"y":35},"drawOrder":2},{"animations":[{"type":"translateY","ratio":23,"offset":5}],"url":"https://www.geo-fs.com/images/instruments/a380pfd/digits.png","anchor":{"x":0,"y":0},"size":{"x":6,"y":null},"position":{"x":55,"y":2},"iconFrame":{"x":11,"y":23},"drawOrder":2},{"animations":[{"type":"translateY","ratio":23,"offset":5}],"url":"https://www.geo-fs.com/images/instruments/a380pfd/digits.png","anchor":{"x":0,"y":0},"size":{"x":6,"y":null},"position":{"x":50,"y":2},"iconFrame":{"x":11,"y":23},"drawOrder":2},{"animations":[{"type":"translateY","ratio":23,"offset":5}],"url":"https://www.geo-fs.com/images/instruments/a380pfd/digits.png","anchor":{"x":0,"y":0},"size":{"x":6,"y":null},"position":{"x":45,"y":2},"iconFrame":{"x":11,"y":23},"drawOrder":2},{"animations":[{"type":"translateX","value":"heading360","ratio":-2.64,"offset":0}],"url":"https://www.geo-fs.com/images/instruments/a380pfd/compass.png","anchor":{"x":0,"y":0},"size":{"x":600,"y":null},"position":{"x":-60,"y":-87},"iconFrame":{"x":160,"y":25},"drawOrder":1}]},
                                    ...d.instruments[inst].overlay
                                }
                            }
                        }
                        geofs.aircraft.instance.id = a;
                        geofs.aircraft.instance.raw = d;
                        geofs.aircraft.instance.init(d, b, c);

                        if (isExternal) {
                            if (geofs.aircraftList[geofs.aircraft.instance.aircraftRecord.altId])
                                geofs.preferences.aircraft = geofs.aircraft.instance.aircraftRecord.altId;
                            else
                                geofs.preferences.aircraft = 1;

                            geofs.preferences.real_aircraft = geofs.aircraft.instance.aircraftRecord.id;
                        }
                        else {
                            geofs.preferences.real_aircraft = "";
                        }
                    }
                } else
                    geofs.aircraft.instance.loadDefault("Could not load aircraft file")
            },
            error: function(b, c, f) {
                a != geofs.aircraft.default && geofs.aircraft.instance.loadDefault("Could not load aircraft file" + f)
            }
        });
    };

    geofs.aircraft.Aircraft.prototype.addParts = function(a, b, c) {
        c = c || 1;
        for (var d = 0; d < a.length; d++) {
            var e = a[d];
            if (e.include) {
                var f = geofs.includes[e.include];
                e = $.extend(e, f[0]);
                for (var g = 1; g < f.length; g++) {
                    var h = $.extend({}, f[g], {
                        parent: e.name
                    });
                    h.name = e.name + h.name;
                    a.push(h)
                }
            }
        }
        for (d = 0; d < a.length; d++) {
            e = a[d];
            e.points = e.points || {};
            e.type = e.type || !1;
            e.brakesController = e.brakesController || !1;
            e.animations = e.animations || [];
            geofs.aircraft.instance.parts[e.name] = e;
            geofs.aircraft.instance.addOffsets(e, c);
            e.forceDirection && (e.forceDirection = AXIS_TO_INDEX[e.forceDirection]);
            e.rotation && (e.rotation = V3.toRadians(e.rotation));
            e.scale = e.scale || [1, 1, 1];
            e.scale = V3.scale(e.scale, c);
            e.originalScale = e.scale;
            if (e.model) {
                f = e.model;
                if (e.model[0] != "/" && e.model.indexOf("http") != 0) {
                    f = b + e.model;
                }
                e["3dmodel"] = geofs.loadModel(f, {
                    castShadows: e.noCastShadows ? !1 : !0,
                    receiveShadows: e.noReceiveShadows ? !1 : !0
                });
            }
            "GlassPanel" == e.type && (f = new geofs.GlassPanel(e),
            e.entity = f.entity,
            instruments.add(f, e.name));
            e.light && (e.lightBillboard = new geofs.light(null,e.light,{
                scale: .2
            }),
            geofs.aircraft.instance.lights.push(e));
            e.object3d = new Object3D(e);
            e.suspension && (e.suspension.length ? (e.suspension.origin = [e.collisionPoints[0][0], e.collisionPoints[0][1], e.collisionPoints[0][2] + e.suspension.length],
            f = e.suspension.length) : (e.suspension.origin = [e.collisionPoints[0][0], e.collisionPoints[0][1], 0],
            f = -e.collisionPoints[0][2]),
            e.suspension.restLength = f,
            "rotation" == e.suspension.motion ? (f = V3.length(e.collisionPoints[0]),
            f = Math.atan2(e.collisionPoints[0][0] / f, e.collisionPoints[0][2] / f),
            f = {
                type: "rotate",
                axis: e.suspension.axis || "Y",
                value: e.name + "Suspension",
                ratio: (0 > f ? f + HALF_PI : f - HALF_PI) * RAD_TO_DEGREES * (e.suspension.ratio || 1)
            }) : f = {
                type: "translate",
                axis: e.suspension.axis || "Z",
                value: e.name + "Suspension",
                ratio: e.suspension.ratio || 1
            },
            e.animations.push(f),
            e.suspension.hardPoint = e.suspension.hardPoint || .5,
            e.points.suspensionOrigin = V3.dup(e.suspension.origin));
            for (g = 0; g < e.animations.length; g++)
                f = e.animations[g],
                f.ratio = f.ratio || 1,
                f.offset = f.offset || 0,
                f.currentValue = null,
                f.delay && (f.ratio /= 1 - Math.abs(f.delay)),
                "rotate" == f.type && (h = f.method || "rotate",
                "parent" == f.frame && (h = "rotateParentFrame"),
                f.rotationMethod = e.object3d[h + f.axis]),
                "translate" == f.type && (geofs.isArray(f.axis) || (f.axis = AXIS_TO_VECTOR[f.axis]));
            "wheel" == e.type && (e.radius = e.radius || 1,
            e.arcDegree = e.radius * TWO_PI / 360,
            e.angularVelocity = 0,
            geofs.aircraft.instance.wheels.push(e));
            "airfoil" == e.type && (geofs.aircraft.instance.airfoils.push(e),
            e.stalls = e.stalls || !1,
            e.stallIncidence = e.stallIncidence || 12,
            e.zeroLiftIncidence = e.zeroLiftIncidence || 16,
            e.aspectRatio = e.aspectRatio || DEFAULT_AIRFOIL_ASPECT_RATIO,
            e.aspectRatioCoefficient = e.aspectRatio / e.aspectRatio + 2);
            "engine" == e.type && (e.rpm = 0,
            geofs.aircraft.instance.setup.originalInertia = geofs.aircraft.instance.setup.engineInertia,
            geofs.aircraft.instance.engines.push(e));
            "balloon" == e.type && (e.temperature = e.initialTemperature || 0,
            e.coolingSpeed = e.coolingSpeed || 0,
            geofs.aircraft.instance.balloons.push(e));
            if (e.collisionPoints)
                for (f = e.collisionPoints,
                g = geofs.aircraft.instance.setup.contactProperties[e.type],
                h = 0; h < f.length; h++)
                    f[h].part = e,
                    f[h].contactProperties = g,
                    geofs.aircraft.instance.collisionPoints.push(f[h]);
            e.controller && (geofs.aircraft.instance.controllers[e.controller.name] = e.controller)
        }
        for (d = 0; d < a.length; d++)
            e = a[d],
            "root" != e.name && (e.parent || (e.parent = "root"),
            geofs.aircraft.instance.parts[e.parent].object3d.addChild(e.object3d)),
            e.node && e.object3d.setModel(e.object3d.findModelInAncestry())
    };

    geofs.aircraft.Aircraft.prototype.loadCockpit = function() {
        if (!this._cockpitLoaded)
            if (geofs.aircraft.instance.setup.cockpitModel) {
                var a = geofs.aircraft.instance.aircraftRecord.id;
                var isExternal = geofs.aircraft.instance.aircraftRecord.altId
                var url = geofs.url + "/models/aircraft/load.php";
                if (geofs.aircraftList[a] && geofs.aircraftList[a].local) {
                    url = geofs.aircraftList[a].path + "cockpit/cockpit.json";
                }
                else if (isExternal) {
                    url = "https://aircraft-loader.appspot.com/aircraft";
                }
                $.ajax(url, {
                    data: {
                        id: a,
                        cockpit: !0
                    },
                    dataType: "text",
                    success: function(b, c) {
                        geofs.aircraftList[a] && geofs.aircraftList[a].local && (b = JSON.stringify({
                            id: a,
                            name: geofs.aircraftList[a].name,
                            fullPath: geofs.aircraftList[a].path,
                            isPremium: !1,
                            isCommunity: !1,
                            definition: btoa(b)
                        }));
                        if (b = geofs.aircraft.instance.parseRecord(b)) {
                            geofs.aircraft.instance.cockpitSetup = b;
                            geofs.aircraft.instance._cockpitLoaded = !0;
                            if (!geofs.aircraftList[a] || !geofs.aircraftList[a].local) {
                                if (isExternal) {
                                    geofs.aircraft.instance.aircraftRecord.fullPath = geofs.aircraft.instance.aircraftRecord.fullPath;
                                }
                                else {
                                    geofs.aircraft.instance.aircraftRecord.fullPath = geofs.url + geofs.aircraft.instance.aircraftRecord.fullPath;
                                }
                            }
                            geofs.aircraft.instance.addParts(b.parts, geofs.aircraft.instance.aircraftRecord.fullPath + "cockpit/", geofs.aircraft.instance.cockpitSetup.scale);
                            instruments.rescale();
                            geofs.aircraft.instance.setup.cockpitScaleFix && geofs.aircraft.instance.fixCockpitScale(geofs.aircraft.instance.setup.cockpitScaleFix);
                            geofs.aircraft.instance.object3d.compute(geofs.aircraft.instance.llaLocation);
                            geofs.aircraft.instance.placeParts();
                            geofs.aircraft.instance.render()
                        }
                    }
                })
            } else
                geofs.aircraft.instance._cockpitLoaded = !0
    };

    geofs.aircraft.Aircraft.prototype.change = function(a, b) {
        a = a || this.aircraftRecord.id;
        geofs.doPause(!0);
        this.load(a, this.getCurrentCoordinates(), b);
        geofs.api.analytics.event("aircraft", (geofs.aircraftList[a] || {name: "SkyX Aircraft"}).name) // For google analytics, Xavier. Consider this line an expression of politeness.
    };

    // Initialization
    if (geofs.preferences.real_aircraft)
        geofs.aircraft.instance.change("skyx" + geofs.preferences.real_aircraft);
}

const Aircraft = [
    {
        title: "Bombardier CRJ-900",
        items: [
            {id: 301, name: "Hawaiian Airlines", author: "Alta Aviation"},
            {id: 319, name: "Lufthansa Regional", author: "Yotam Salmon"}
        ]
    },
    {
        title: "Bombardier Dash 8 Q-400",
        items: [
            {id: 320, name: "King Solomon Airlines", author: "\"unknown\""}
        ]
    },
    {
        title: "Boeing 777-700 Low Quality",
        items: [
            {id: 334, name: "EL AL Israeli Airlins", author: "Yotam Salmon"},
            {id: 335, name: "Alitalia", author: "Yotam Salmon"},
            {id: 336, name: "ANA", author: "Yotam Salmon"},
            {id: 337, name: "Asiana Airlines", author: "Yotam Salmon"},
        ]
    },
    {
        title: "Airbus A321",
        items: [
            {id: 339, name: "Etihad Airways", author: "Alta Aviation"}
        ]
    },
    {
        title: "Boeing 737-800",
        items: [
            {id: 321, name: "American Airlines", author: "Yotam Salmon"},
            {id: 322, name: "KLM Royal Dutch Airlines", author: "Yotam Salmon"},
            {id: 323, name: "British Airways", author: "Yotam Salmon"},
            {id: 325, name: "Delta Airlines", author: "Yotam Salmon"},
            {id: 324, name: "United Airlines", author: "Yotam Salmon"},
            {id: 338, name: "RyanAir Santa Livery", author: "Yotam Salmon"}
        ]
    },
    {
        title: "Airbus A380-800",
        items: [
            {id: 329, name: "Korean Air", author: "Yotam Salmon"},
            {id: 330, name: "British Airways", author: "Yotam Salmon"},
            {id: 332, name: "Qatar Airways", author: "Yotam Salmon"},
            {id: 328, name: "Emirates", author: "Yotam Salmon"},
            {id: 333, name: "Dubai One", author: "Coolstar"},
            {id: 1002, name: "ANA", author: "Air-Geo Fs"},
            {id: 1005, name: "Etihad Airways", author: "Air-Geo Fs"},
            {id: 1006, name: "HiFly Coral Reefs Livery", author: "Air-Geo Fs"},
            {id: 1007, name: "Lufthansa", author: "Air-Geo Fs"},
        ]
    },
];

const AircraftMenu = function(obj) {
    var aircraftMenu = new OptionsView(obj.title, ".geofs-aircraft-list", "prepend");
    aircraftMenu.rootElement.css({
        backgroundColor: "royalblue",
        color: "white",
        fontWeight: "bold"
    });

    for (var ac of obj.items) {
        (function(aircraft) {
            aircraftMenu.container.append($("<button></button>", {
                text: aircraft.name + " (by " + aircraft.author + ")",
                class: "ui button",
                css: {width: "100%", marginTop: "5px"},
                click: function() { geofs.aircraft.instance.change("skyx" + aircraft.id); }
            }));
        })(ac);
    }
}

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

    this.connected = false;
    this.muted = true;
    this.talkie = $("<div></div>").html(`
    <div style="position: fixed; z-index: 1000; background-color: whitesmoke; opacity: 0.75; top: 0; left: 0; margin: 20px; padding: 7px; border-radius: 5px;">
        <div style="line-height: 100%; width: 15px; height: 15px; background-color: #c00; border-radius: 10px; display: inline-block; margin-right: 10px;">
            &nbsp;
        </div>
        Talking
    </div>
    `).hide();
    $("body").append(this.talkie);

    this.webrtc = () => {
        return webrtc;
    };

    this.connect = () => {

        if (webrtc) {
            this.joinroom();
        }

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

        webrtc.on("readyToCall", () => {
            this.joinroom();
        });
    };

    this.joinroom = () => {
        webrtc.joinRoom("geofs-voice-chat", (err, res) => {
            if (err) {
                console.log("WebRTC Error");
                return;
            }
            webrtc.mute();
            this.muted = true;
            console.log("WebRTC connected");
            alertify.notify("Connected to in-game voice chat");
            this.connected = true;
        });
    };

    this.disconnect = () => {
        if (webrtc) {
            webrtc.leaveRoom();
            this.connected = false;
            alertify.notify("Disconnected from voice chat");
        }
    }

    $("body").keydown((e) => {
        if (e.which == 81 && this.connected) {
            if (this.muted) {
                webrtc.unmute();
                this.muted = false;
                this.talkie.show();
            }
        }
    }).keyup((e) => {
        if (e.which == 81 && this.connected) {
            if (!this.muted) {
                webrtc.mute();
                this.muted = true;
                this.talkie.hide();
            }
        }
    });;
}

function GenerateAircraftMenu() {
    for (var family of Aircraft) {
        new AircraftMenu(family);
    }
}


function ModifyMultiplayer() {
    multiplayer.sendUpdate = function() {
        var isExternal = geofs.aircraft.instance.aircraftRecord.altId;
        try {
            if (!multiplayer.lastRequest && !flight.recorder.playing) {
                var a = geofs.aircraft.instance
                  , b = Date.now();
                multiplayer.lastRequestTime = b;
                var c = $.merge($.merge([], a.llaLocation), a.htr);
                if (c.join() != multiplayer.lastJoinedCoordinates) {
                    multiplayer.lastJoinedCoordinates = c.join();
                    var d = V3.scale(xyz2lla(a.rigidBody.getLinearVelocity(), a.llaLocation), .001)
                      , e = $.merge(d, a.htrAngularSpeed)
                      , f = {
                        acid: geofs.userRecord.id,
                        sid: geofs.userRecord.sessionId,
                        id: multiplayer.myId,
                        ac: isExternal ? a.aircraftRecord.altId : a.aircraftRecord.id, // If the aircraft is external, we'll send the alternative aircraft on the "ac" property so no phantom aircraft are created
                        co: c,
                        ve: e,
                        st: { // All the rest are validated. The "st" property is a free to sync object, so we can send info over this channel.
                            gr: a.groundContact,
                            skyx: isExternal ? a.aircraftRecord.id : null // And we'll use the "skyx" property for determining the URL of the aircraft. This will be the base path that was returned from the server.
                        },
                        ti: multiplayer.getServerTime(),
                        m: multiplayer.chatMessage,
                        ci: multiplayer.chatMessageId,
                        v: 115
                    };
                    multiplayer.chatMessage = "";
                    multiplayer.lastRequest = geofs.ajax.post(geofs.multiplayerHost + "/update", f, multiplayer.updateCallback, multiplayer.errorCallback)
                }
            }
        } catch (g) {
            geofs.debug.error(g, "multiplayer.sendUpdate")
        }
    };

    multiplayer.User.prototype.updateModel= function(a) {
        var b = this.getLOD(a);
        (!this.models || 0 == this.models.length) && 0 < b && b < multiplayer.numberOfLOD && (this.models = multiplayer.loadModels(a)); // Instead of giving the loadModels just the aircraft id, we'll give the player object so it can determine what kind of aircraft it is.
        if (b != this.lod) {
            this.removeModel();
            var c = b - 1;
            this.models.length > c && 0 <= c ? (this.model = this.models[c],
            geofs.api.addModelToWorld(this.model),
            multiplayer.visibleUsers[this.id] = this) : b == multiplayer.numberOfLOD && (multiplayer.visibleUsers[this.id] = this);
            this.lod = b
        }
        if (this.premium != a.p || this.callsign != a.cs)
            this.premium = a.p,
            this.callsign = a.cs,
            this.removeCallsign();
        this.label || (a = a.p ? "premium" : "default",
        a = this.isTraffic ? "traffic" : a,
        this.addCallsign(this.callsign, a))
    };

    multiplayer.loadModels = function(p) {
        var isExternal = p.st["skyx"]; // Are we using an external aircraft?
        var a = p.ac;
        var b = [];
        if (geofs.aircraftList[a]) {
            var c = isExternal ? ("https://aircraft-loader.appspot.com/" + p.st["skyx"] + "/multiplayer.glb") : (PAGE_PATH + geofs.aircraftList[a].path + "/multiplayer.glb"); // Determining where to take the stuff from
            a = isExternal ? ("https://aircraft-loader.appspot.com/"  + p.st["skyx"] + "/multiplayer-low.glb") : (PAGE_PATH + geofs.aircraftList[a].path + "/multiplayer-low.glb"); // Also for low res model.
            b.push(geofs.loadModel(c, {
                justLoad: !0
            }));
            b.push(geofs.loadModel(a, {
                justLoad: !0
            }))
        }
        return b
    };

    multiplayer.User.prototype.updateAircraftName= function(a) {
        ((this.aircraft == a.ac && this.aircraftName) && (!a.st["skyx"] || a.st["skyx"] == this["skyx"])) || (this.aircraft = a.ac, // Checking for changes of "st:rac" in parallel to those of "ac"
        this.aircraftName = geofs.aircraftList[this.aircraft] ? geofs.aircraftList[this.aircraft].name : "unknown",
        this.lod = null,
        this.rac = a.st ? (a.st["rac"] || null) : null,
        this.models = [])
    }
}

function FlatEarth() {
    if (!window["control"]) {
        window["control"] = true;
        document.addEventListener("keydown", function(e) {
            if (e.keyCode == 17 || e.keyCode == 87) {
                window.ctrl = true;
            }
        });
    }
    document.addEventListener("keydown", function(e) {
        if (!window["terrainc"]) {
            window.tps = [geofs.api.viewer.terrainProvider, new Cesium.EllipsoidTerrainProvider()];
            window.tpi = 0;
            console.log("First terrain update");
        }
        window.terrainc = true;
        window["tpi"] = window["tpi"] || 0;
        if (e.keyCode == 89 && window.ctrl) {
            geofs.api.viewer.terrainProvider = window.tps[++window.tpi % 2];
            window.ctrl = false;
        }
    }, false);
}

function InitOptions() {
    var options = new OptionsView("SkyX");
    options.rootElement.css({
        backgroundColor: "royalblue",
        color: "white"
    });
    // options.container.html(
    //     `
    //     <div class="ui cards">
    //         <div class="card" style="background-color: royalblue">
    //             <div class="content">
    //                 <strong>Hey there!</strong><br/><br/>
    //                 SkyX  doesn't have a proper settings page yet. However, you're invited to press F to pay respects to the authors.<br/><br/>
    //                 Have a nice day,<br/>SkyX Team.
    //             </div>
    //         </div>
    //     </div>
    //     <br/>
    //     `
    // )

    options.container.append(
        $("<div></div>").html(
            `
            <div class="ui cards">
                <div class="card" style="background-color: whitesmoke">
                    <div class="content">
                        <div class="header">
                            Voice Chat
                        </div>
                        <br/>
                        <div class="ui toggle checkbox">
                            <input type="checkbox" name="public" id="voicechat-toggler">
                            <label>Enable in-game voice chat</label>
                        </div>
                    </div>
                </div>
            </div>
            <br/>
            `
        )
    );

    $("#voicechat-toggler").change(function() {
        if (this.checked) {
			if (localStorage.getItem("skyx_2_13_yrs") != "accepted") {
				new FullscreenModal(
					"hand paper", "Wait a minute!",
					`Before enabling the voice chat, please confirm that you are at least 13 years old.<br/><br/>
					Using the voice chat is not allowed for players under 13.`,
					`<div class="ui red cancel inverted button">
					<i class="checkmark icon"></i>
					No, Take me back
					</div>
					<div class="ui green ok inverted button">
					<i class="checkmark icon"></i>
					I am at least 13 years old. Go ahead!
					</div>`
				).open(() => {
					localStorage.setItem("skyx_2_13_yrs", "accepted");
					window.voice.connect();
				}, () => {
					this.checked = false;
				});
			}
			else {
				window.voice.connect();
			}
        }
        else {
            window.voice.disconnect();
        }
    });
}

function ShowWelcome() {
    const WELCOME_VERSION = "2.0";

    if (localStorage.getItem("skyx__welcome_version") == WELCOME_VERSION) {
        return;
    }

    localStorage.setItem("skyx__welcome_version", WELCOME_VERSION);

    if (true) {
        new FullscreenModal(
            "star", "Welcome to SkyX 2.0!",
            `Welcome aboard the new SkyX for GeoFS! We hope you're just excited as we are.
            <br/>Let us introduce you to some of our new features here...
            <br/><br/>Don't worry, we still don't have that many.`,
            `<div class="ui green ok inverted button">
            <i class="checkmark icon"></i>
            Let's do that!
            </div>`
        ).open(function() {
            setTimeout(() => ui.panel.toggle(".geofs-aircraft-list"), 1000);
            new FullscreenModal(
                "plane", "Aircraft Warehouse",
                `We have re-designed our Aircraft tab, adding more planes and more liveries (thanks to our contributors!)<br/>
                You can now enjoy much more planes in an organized and clean menu.<br/><br/>`,
                `<div class="ui green ok inverted button">
                <i class="checkmark icon"></i>
                Continue
                </div>`
            ).open(function() {
                ui.panel.toggle(".geofs-aircraft-list");
                new FullscreenModal(
                    "image", "Terrain Flattener",
                    `Just like the old SkyX,&nbsp;&nbsp; SkyX &nbsp;2.0&nbsp; also has a flat terrain option. If a bumpy runway bothers you too much, simply press Ctrl+Y to toggle flat terrain.<br/><br/>
                    Do not confuse with flat Earth, which we (like science) do not support.`,
                    `<div class="ui green ok inverted button">
                    <i class="checkmark icon"></i>
                    Cool!
                    </div>`
                ).open(function() {
					new FullscreenModal(
						"microphone", "Voice ATC Channel",
						`For utmost gameplay experience, we added a simple voice chat <b>in game</b>! You can easily activate it from the Options tab.<br/><br/>
						<span style="font-size: 0.7erm;">
						Please notice that using the voice chat is not allowed under the age of 13. Enabling the voice chat on your own responsibility.<br/>
						</span>`,
						`<div class="ui green ok inverted button">
						<i class="checkmark icon"></i>
						Awesome :)
						</div>`
					).open(function() {
						new FullscreenModal(
							"facebook", "Do you like SkyX?",
							`If you enjoy your time with SkyX, please help us get to more people by posting in-game pictures, 
							videos, etc on your favourite social networks such as Facebook or Discord.<br/><br/>
							Are you ready to play?`,
							`<div class="ui green ok inverted button">
							<i class="checkmark icon"></i>
							I'm ready!
							</div>`
						).open(function() {
							new FullscreenModal(
								"angellist", "Let's play",
								`Ok, we're ready to play. See you again soon!<br/><br/>SkyX Team.`,
								`<div class="ui blue ok inverted button">
								<i class="checkmark icon"></i>
								Finish Tutorial
								</div>`
							).open(function() {
								alertify.notify("You have been equipped with a Lufthansa A380", "success", 5);
								geofs.aircraft.instance.change("skyx1007");
							});
						});
					});
				});
            });
        });
    }
}

function InitVoiceChat() {
    window.voice = new VoiceChannel();
}

window.skyx = {};
window.skyx.loader = new ResourceLoader();
window.require = window.skyx.loader.require;
window.waitfor = window.skyx.loader.waitfor;

function core() {
    console.log("Core features have loaded");

    ModifyAircraft();
    GenerateAircraftMenu();

    ModifyMultiplayer();
    
    FlatEarth();}

function main() {
    console.log("Everything is loaded");

    InitOptions();
    InitVoiceChat();

    ShowWelcome();
}

waitfor(
    "$",
    "geofs",
    "geofs.aircraft"
).then(() => {
    core();
    require(
        "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css",
        "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.js",
        "https://cdn.jsdelivr.net/npm/alertifyjs@1.11.2/build/alertify.min.js",
        "https://cdn.jsdelivr.net/npm/alertifyjs@1.11.2/build/css/alertify.min.css",
        "https://cdn.jsdelivr.net/npm/alertifyjs@1.11.2/build/css/themes/semantic.min.css",
        "https://aircraft-loader.appspot.com/swrtc.js"
    ).then(() => {
        main();
    })
});
