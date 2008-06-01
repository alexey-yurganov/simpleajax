/* Copyright (c) 2008

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var SimpleAjax = window.SimpleAjax || (function(S) {

var handlers = {};  //event handlers stored here

/*
* Optimized function to convert a string to lowercase.
*/
var toLowerCase = (function() {
    var c = {};
    return function(s) {
        return !s ? "" : c[s] || (c[s] = s.toLowerCase());
    };
})();

/*
* Creates a DOM tree from an HTML string.
*/
var make = function(s) {
    var n = document.createElement("div");
    n.innerHTML = s;
    return n.firstChild;
};

S = {

    /*
    * Registers an event handler against a type of element.
    */
    register: function(/*String*/event, /*String*/tag, /*Object*/attrs,
                        /*Function|String*/func, /*Object*/ctx) {
        if(!handlers[event]) {
            handlers[event] = {};

            var b = document;
            b = b.documentElement || b.body;
            if(b.addEventListener) {
                b.addEventListener(event.replace(/^on/, ""), S.onEvent, false);
            } else {
                b.attachEvent(event, S.onEvent);
            }
        }

        if(!handlers[event][tag]) {
            handlers[event][tag] = [];
        }

        //if no event handler is supplied, we'll use our default one
        if(!func) {
            func = S.handleEvent;
            ctx = S;
            attrs = attrs || {};
            //if we're using the default handler, it requires a falsy "rel" attribute
            attrs.rel = attrs.rel || 0;

        } else if(func in ctx) {
            func = ctx[func];
        }

        handlers[event][tag].push({attrs: attrs, tag: tag, func: func, ctx: ctx});
    },

    /*
    * A single function, called by the native event dispatcher, that processes 
    * the event and re-delegates it to our event handlers.
    */
    onEvent: (function() {

        var hasAllAttributes = function(/*Element*/node, /*Object*/attrs) {
            if(!attrs) return 1;
            for(var n in attrs) {
                var val = node.getAttribute(n);
                if(!val ||
                   (attrs[n] && attrs[n].test && !attrs[n].test(val)) ||
                   (attrs[n] && attrs[n] != val)) {
                    return 0;
                }
            }
            return 1;
        };

        return function(/*Event*/e) {
            e = e || window.event;

            //make IE events more W3C-like
            if(!e.preventDefault) {
                e.preventDefault = function() {e.returnValue = false;};
                e.stopPropagation = function() {e.cancelBubble = true;};
                e.target = e.srcElement;
                e.relatedTarget = (e.type == "mouseout") ? e.toElement : e.fromElement;
            }

            var tags = handlers[e.type] || handlers["on" + e.type];
            var node = e.target;
            var list, o;
            do {

                //first call the handlers registered against specific types of elements
                list = tags[toLowerCase(node.tagName)] || [];
                for(var i = 0; i < list.length; i++) {
                    if(hasAllAttributes(node, list[i].attrs)) {
                        o = list[i];
                        if(o.func.call(o.ctx, e, o) == true) return;
                    }
                }

                //then call the handlers registered against all types of elements
                list = tags["*"];
                if(list && e.type != "mouseover" && e.type != "mouseout") {
                    for(var i = 0; i < list.length; i++) {
                        if(hasAllAttributes(node, list[i].attrs)) {
                            o = list[i];
                            if(o.func.call(o.ctx, e, o) == true) return;
                        }
                    }
                }

            } while((node = node.parentNode));
        };
    })(),

    /*
    * The default event handler that is used if register() is called without
    * specifying a custom event handler.
    */
    handleEvent: function(/*Event*/e) {
        //we store our parameters in the "rel" attribute
        var p = (e.target.getAttribute("rel") || "").split(" ");

        var method = toLowerCase(p[0]);

        //check first param is an HTTP method
        if(!/^(get|get-nocache|post|put|delet[e])$/.test(method)) return;

        var url = S.guessURL(e.target) || "";
        var formData = S.guessForm(e.target);
        var toNode = e.target;
        var busyNode;

        switch(p.length) {
            case 1:
                break;

            case 2:  //method, node
                toNode = p[1];
                break;

            case 3:  //method, url, node
                if(p[1] != "#") url = S.mergeURLs(url, p[1]);
                toNode = p[2];
                break;

            case 4:  //method, url, node, loading
                if(p[1] != "#") url = S.mergeURLs(url, p[1]);
                toNode = p[2];
                busyNode = [3];
                break;
        }

        if(url) {
            e.preventDefault();
            S.doAction(e, method, url, formData, toNode, busyNode);
        }
    },

    /*
    * Retrieves data from the specified URL and places it inside toNode,
    * showing busyNode while the data is loading.
    */
    doAction: function(/*Event*/e, /*String*/method, /*String*/url,
                        /*Object*/data, /*Node|String*/toNode, /*String*/busyNode) {

        //only show busy if action was intentional
        var showBusy = busyNode || (e && /click|mousedown|mouseup|submit/.test(e.type));

        S.getURL(method, url, data, function(/*String*/str, /*boolean*/ok, /*XMLHttpRequest*/xhr) {
            if(showBusy) S.setBusy(0, busyNode);

            if(ok) {  //if HTTP 200, etc.
                S.flash(toNode, 240, function() {
                    S.setNodeValue(toNode, str);
                });

            } else if(xhr) {
                alert("Server Error: " + xhr.status + " " + xhr.statusText);
            }
        });

        if(showBusy) S.setBusy(1, busyNode);
    },

    /*
    * Guesses the implied URL from the given element. If it is an anchor, the 
    * href is returned. If is a form, the form action is returned.
    */
    guessURL: function(/*Node*/n) {
        var tag = toLowerCase(n.tagName);
        if(tag == "a") {
            return n.href;

        } else if(/input|textarea|button|select|form/.test(tag)) {
            if(tag != "form") n = n.form;
            return n.attributes["action"].value;
        }
    },

    /*
    * Modifies the first URL based on properties found in the second URL.
    * The second URL can only be (1) an absolute URL without the protocol and 
    * domain with a leading "/", (2) the filename and query part of a URL, 
    * (3) the query part of a URL including the leading "?".
    */
    mergeURLs: (function() {

        // splits the query part of a URL into its parameters
        var split = function(/*String*/str, /*Object?*/hash) {
            hash = hash || {};
            str = str.split("?")[1];  //only keep the query part
            if(str) {
                var p = str.split("&"), q;
                for(var i = 0; i < p.length; i++) {
                    q = p[i].split("=");
                    hash[q[0]] = q[1] || "";
                }
            }
            return hash;
        };

        // joins properties into a URL query
        var join = function(/*Object*/obj) {
            var str = [];
            for(var i in obj) str.push(i + "=" + obj[i]);
            return str.join("&");
        };

        return function(/*String*/orig, /*String*/extra) {
            var n0 = extra.charAt(0);
            if(n0 == "\/") {
                return extra;

            } else if(n0 == "?") {
                //combine all query parameters together
                var params = join(split(extra, split(orig)));
                return orig.split("?")[0] + "?" + params;

            } else {
                var params = join(split(extra, split(orig)));
                //strip filename out of original URL and use second filename
                orig = orig.substr(0,
                    orig.split("?")[0].lastIndexOf("\/") + 1 || orig.length
                );
                return orig + extra.split("?")[0] + "?" + params;
            }
        };
    })(),

    guessForm: function(/*Node*/n) {
        var tag = toLowerCase(n.tagName);
        if(!n || !/input|button|textarea|form/.test(tag)) return;

        var o = {};

        if(n.name) {
            if(tag == "button" ||
               (tag == "input" && /button|submit/i.test(n.type))) {
                o[n.name] = true;
            }
        }

        var form = n.form || n;
        for(var i = 0; i < form.elements.length; i++) {
            var node = form.elements[i];
            if(node.disabled || !node.name) return;

            if(/select/i.test(node.tagName)) {
                o[node.name] = [];
                for(var j = 0; j < node.options.length; j++) {
                    var opt = node.options[j];
                    if(opt.selected) o[node.name].push(opt.value || opt.text);
                }

            } else if(!/button|submit|reset|image/i.test(node.type)) {
                o[node.name] = node.value;
            }
        }
        return o;
    },

    /*
    * Shortcut for getElementById.
    */
    byId: function(/*String|Node*/s) {
        var d = document;
        return s.nodeType ? s : d.getElementById ? d.getElementById(s) : d.all(s);
    },

    /*
    * Retrieves the computed style object of a node.
    */
    css: function(/*Node*/n) {
        var w = window.defaultView;

        S.css = (w && w.getComputedStyle) ? 
            function(n) {
                return w.getComputedStyle(n, null);
            } : function(n) {
                return n.currentStyle || n.style;
            };

        return S.css(n);
    },

    /*
    * Set a node's content to the specified string. What content is set depends
    * on the node. If it's an input, its value is set. If it's an image, its
    * src is set. Anything else, its innerHTML is set.
    */
    setNodeValue: function(/*Node*/node, /*String*/value) {
        node = S.byId(node);

        var tag = toLowerCase(node.tagName);

        if(/input|textarea/.test(tag)) {
            node.value = value;

        } else {
            var js = "";
            var links = [];

            value = value
                //remove any <html> tags
                .replace(/^<html[^>]*>|<\/html>$/g, "")

                //remove any scripts
                .replace(/<[s]cript([^>]*)>(.*?)<\/[s]cript>/ig,
                    function(str, attr, inline) {

                        //search for external scripts marked "defer"
                        attr = /\bdefer\b/i.test(attr) ?
                            (/src=['"]?([^>'"\s]+)/i.exec(attr)||{})[1] : 0;

                        if(attr) {
                            links.push(attr);
                        } else {
                            js += inline + ";";
                        }
                        return "";
                    }
                );

            //empties the contents of a node
            var empty = function(n) {
                while(n.firstChild) n.removeChild(n.firstChild);
            };

            //copies nodes from "n" to "c"
            var copy = function(n, c) {
                while(n.firstChild) c.appendChild(n.firstChild);
            };

            if(!value) {
                //ignore

            } else if(tag == "img") {
                node.src = value;

            } else if(tag == "select") {
                empty(node);
                if(!/<option/i.test(value)) value = "<option>" + value + "<\/option>";
                var n = make("<select>" + value + "<\/select>");
                copy(n, node);

            } else if(tag == "table") {
                empty(node);
                var n = make("<table>" + value + "<\/table>");
                copy(n, node);

            } else if(tag == "tr") {
                empty(node);
                var n = make("<table><tr>" + value + "<\/tr><\/table>").rows[0];
                copy(n, node);

            } else {
                node.innerHTML = value;
            }

            //execute inline scripts
            if(js) setTimeout(js, 0);

            //load external scripts. Note that since scripts were
            //marked defer, they can be loaded in any order.
            for(var i = 0; i < links.length; i++) {
                document.body.appendChild(make("<script><\/scri"+"pt>")).src = links[i];
            }
        }
    },

    /*
    * A cache of progress indicators that are currently being shown.
    */
    busyCache: {},

    /*
    * Sets the visibility of a node, that is presumed to be a progress 
    * indicator. This function also accounts for when a progress indicator is
    * used by 2 separate processes. If the node doesn't exist, a default
    * progress indicator is created and used.
    */
    setBusy: function(/*boolean*/busy, /*String*/node) {
        node = S.byId(node);

        if(!node) {
            node = S.byId("simpleajax-busy");

            if(!node) {
                var d = document;
                var loading = d.body.getAttribute("loading") || "Loading&hellip;";
                node = make("<div id='simpleajax-busy' style='position:fixed;top:0%;" + 
                "left:50%;margin-left:-80px;padding:3px;background:#fd0;color:#000;" +
                "font-weight:bold;display:none;opacity:0.8;filter:alpha(opacity=80)'>" + 
                loading + "<\/div>");
                d.body.appendChild(node);

                var style = node.style;
                //if IE < 7, use scripting to mimic position=fixed
                if(style.setExpression && (!window.XMLHttpRequest || d.compatMode == "BackCompat")) {
                    var db = function(s) {
                        return "(document.body." + s + "||(document.documentElement||{})." + s + ")";
                    }
                    style.setExpression("left", db("scrollLeft") + "+(" + db("clientWidth") + "-this.offsetWidth)/2");
                    style.setExpression("top", db("scrollTop"));
                    style.margin = "0";
                    style.position = "absolute";
                }
            }
        }

        var cache = S.busyCache;
        var id = node.id || "*";

        //keep track of how many processes are using this indicator
        cache[id] = (cache[id] || 0) + (busy ? 1 : -1);

        var _update = function() {
            node.style.display = (cache[id] > 0) ? "" : "none";
        };

        //show the indicator after 300ms incase the process finishes quickly
        if(cache[id] == 1) setTimeout(_update, 300); else _update();

        //if the same indicator is used again, flash it once to indicate activity
        if(cache[id] > 1) S.flash(node, 200);
    },

    /*
    * Flashes a node from visible to invisible to visible.
    */
    flash: function(/*Node*/node, /*int*/duration, callback) {
        node = S.byId(node);

        //get the current opacity
        var v = S.css(node);
        v = parseFloat((/alpha\(opacity=(\d+)\)/i.exec(v.filter)||{})[1]/100 || v.opacity || 1);

        var step = function(/*Node*/n, /*int*/v) {
            n.style.opacity = v;
            n.style.filter = "alpha(opacity=" + Math.round(v * 100) + ")";
            n.style.zoom = 1;
        };

        S.anim(node, v, 0, duration, step, function() {
            S.anim(node, v, v, 0, step, callback);
        });
    },

    /*
    * Animates a node for "duration" length of time from values "from" to "to".
    * Actual CSS manipulation is done by "step".
    */
    anim: function(/*Node*/node, /*int*/from, /*int*/to, /*int*/duration, /*Function*/step, /*Function*/callback) {
        var start = new Date().getTime();
        var P = Math.PI/2;
        var func = function() {
            step(node, from);
            if(from != to) {
                var elapse = new Date().getTime() - start;
                from = (elapse - duration >= 40) ? to : from + Math.sin(elapse/duration*P)*(to - from);
                setTimeout(func, 40);

            } else if(callback) {
                callback(node);
            }
        };
        func();
    },

    /*
    * A cache of GET responses that is returned again if the same GET 
    * request is sent twice.
    */
    xhrCache: {},

    /*
    * Loads a URL and returns the data as a string. Note that the URL must
    * be from the same domain as the page due to the "same origin security 
    * policy". If the URL is a data URL, the contents will return immediately.
    * If the URL is a fragment identifier, the innerHTML of the element with
    * that id is returned immediately.
    */
    getURL: function(/*String*/method, /*String*/url, /*String*/data, /*Function*/func) {
        method = toLowerCase(method);

        if(/^data:/.test(url)) {  //data URL
            return func(unescape(url.replace(/^data:,?/, "")), 1, null);

        } else if(/^#./.test(url)) {  //fragment identifier
            var node = S.byId(url.substr(1));
            return node ? func(node.innerHTML, 1, null) : alert("Tag with id '" + url + "' not found.");

        } else if(method == "get" && S.xhrCache[url]) {  //cached data
            return func(S.xhrCache[url], 1, null);
        }

        //disable caching of GETs by adding a random variable
        if(method == "get-nocache") {
            url += (/\?/.test(url) ? "&" : "?") + ".r=" + Math.random();
        }

        //convert data object to URL string
        if(typeof data != "string" && !(data instanceof String)) {
            var s = [];
            for(var i in data) s.push(escape(i) + "=" + escape(data[i]));
            data = s.join("&");
        }

        if(method == "post") {
            if(!data) {
                //usurp form data from params in URL
                data = url.substr(url.indexOf("?") + 1, url.length);
                url = url.split("?")[0];

            } else {
                //copy params from URL into form data and avoid duplicates
                var params = (url.split("?")[1] || "").split("&");
                var d = "&" + data;
                for(var i = 0; i < params.length; i++) {
                    if(d.indexOf("&" + param[i].split("=")[0] + "=") == -1) {
                        data += "&" + param[i];
                    } 
                }
            }
        }

        var xhr = S.getXHR();

        xhr.open(method == "get-nocache" ? "GET" : method.toUpperCase(), url, true);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        if(method == "post") {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }

        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                var ok = 0, v;
                try {
                    ok = ((xhr.status >= 200 && xhr.status < 300) ||
                           xhr.status == 0 ||
                           xhr.status == 304 || xhr.status == 1223);

                    v = xhr.responseText;

                    if(method == "get") S.xhrCache[url] = v;
                } catch(e) {}

                func(v, ok, xhr);
            }
        };
        xhr.send(data);
    },

    getXHR: function() {
        var xhr = [
            function() {return new XMLHttpRequest();},
            function() {return new ActiveXObject("Msxml2.XMLHTTP");},
            function() {return new ActiveXObject("Microsoft.XMLHTTP");}
        ];

        for(var i = 0; i < xhr.length; i++) {
            try {
                var x = xhr[i]();
                this._getXHR = xhr[i];
                return x;

            } catch(e) {}
        }
    }
};

//Here are the actual elements that we respond to:
S.register("onclick", "a", {href:null});
S.register("onclick", "input", {type:"submit"});
S.register("onclick", "input", {type:"button"});
S.register("onclick", "button", {type:"submit"});
S.register("onclick", "button", {type:"button"});
S.register("onchange", "input", {type:"text"});
S.register("onchange", "select");
S.register("onchange", "textarea");
S.register("obnsubmit", "form");

return S;
})();