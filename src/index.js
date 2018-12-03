
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
            console.log(tasks);

            for (var task of tasks) {
                _require(task)
                    .then((url) => {
                        var index = tasks.indexOf(url);
                        console.log(index);
                        if (index != -1)
                            tasks[index] = null;
                        
                        if (tasks.join().replace(/,/g,'').length === 0)
                            resolve();
                    });
            }
        });
    };

};