
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
                        // Hotfix!
                        for (var inst in d.instruments) if (d.instruments.hasOwnProperty(inst)) {
                            if (d.instruments[inst].constructor.name === "Object" && !d.instruments[inst].position) {
                                delete d.instruments[inst];
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
            {id: 1002, name: "ANA", author: "Dylan Cleary"},
            {id: 1005, name: "Etihad Airways", author: "Dylan Cleary"},
            {id: 1006, name: "HiFly Coral Reefs Livery", author: "Dylan Cleary"},
            {id: 1007, name: "Lufthansa", author: "Dylan Cleary"},
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
                text: ac.name + " (by " + ac.author + ")",
                class: "ui button",
                css: {width: "100%", marginTop: "5px"},
                click: function() { geofs.aircraft.instance.change("skyx" + ac.id); }
            }));
        })(ac);
    }
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
    options.container.html(
        `
        <div class="ui cards">
            <div class="card" style="background-color: royalblue">
                <div class="content">
                    <strong>Hey there!</strong><br/><br/>
                    SkyX  doesn't have a proper settings page yet. However, you're invited to press F to pay respects to the authors.<br/><br/>
                    Have a nice day,<br/>SkyX Team.
                </div>
            </div>
        </div>
        <br/>
        `
    )
}

function ShowWelcome() {
    const WELCOME_VERSION = "0.1"; // TODO: Write code to show welcome only once

    if (true) {
        new FullscreenModal(
            "star", "Welcome to SkyX 2.0!",
            `Welcome aboard the new SkyX for GeoFS! We hope you're just excited as we are. Let us introduce you to some of our new features here...
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
                    `Just like the old SkyX, SkyX 2.0 also has a flat terrain option. If a bumpy runway bothers you too much, simply press Ctrl+Y to toggle flat terrain.<br/><br/>
                    Do not confuse with flat Earth, which we (like science) do not support.`,
                    `<div class="ui green ok inverted button">
                    <i class="checkmark icon"></i>
                    Cool!
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
                    })
                })
            });
        });
    }
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
        "https://cdn.jsdelivr.net/npm/alertifyjs@1.11.2/build/css/themes/semantic.min.css"
    ).then(() => {
        main();
    })
});
