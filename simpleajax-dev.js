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
        return function(/*String*/s) {
            return !s ? "" : c[s] || (c[s] = s.toLowerCase());
        };
    })();

    /*
    * Creates a DOM tree from an HTML string.
    */
    var make = function(/*String*/s) {
        var n = document.createElement("div");
        n.innerHTML = s;
        return n.firstChild;
    };

    /*
    * Shortcut for getElementById.
    */
    var byId = function(/*String|Node*/s) {
        var d = document;
        return !s ? s : s.nodeType ? s : d.getElementById ? d.getElementById(s) : d.all(s);
    };

    /*
    * Retrieves the computed style object of a node.
    */
    S.css = function(/*Node*/n) {
        var w = window.defaultView;

        S.css = (w && w.getComputedStyle) ? 
            function(n) {
                return w.getComputedStyle(n, null);
            } : function(n) {
                return n.currentStyle || n.style;
            };

        return S.css(n);
    };

    /*
    * A single function, called by the native event dispatcher, that processes 
    * the event and re-delegates it to our event handlers.
    */
    var onEvent = function(/*Event*/e) {
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
            list = tags[toLowerCase(node.tagName)] || [];

            for(var i = 0; i < list.length; i++) {
                var attrs = list[i].attrs || {};

                //ensure all required attributes exist on the node
                for(var s in attrs) {
                    var val = node.getAttribute(s);
                    if(!val ||
                       (attrs[s] && attrs[s].test && !attrs[s].test(val)) ||
                       (attrs[s] && attrs[s] != val)) {
                        continue;
                    }
                }

                o = list[i];
                if(o.func.call(o.ctx, e, o) == true) return;
            }

        } while((node = node.parentNode));
    };

    /*
    * Registers an event handler against a type of element.
    */
    S.register = function(/*String*/event, /*String*/tag, /*Object*/attrs,
                        /*Function|String*/func, /*Object*/ctx) {
        if(!handlers[event]) {
            handlers[event] = {};

            var b = document;
            b = b.documentElement || b.body;
            if(b.addEventListener) {
                b.addEventListener(event.replace(/^on/, ""), onEvent, false);
            } else {
                b.attachEvent(event, onEvent);
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
    };

    /*
    * The default event handler that is used if register() is called without
    * specifying a custom event handler.
    */
    S.handleEvent = function(/*Event*/e) {
        //we store our parameters in the "rel" attribute
        var p = (e.target.getAttribute("rel") || "").split(/\s+/);

        var method = toLowerCase(p[0]);

        //check first param is an HTTP method
        if(!/^(get|get-nocache|post|put|delet[e])$/.test(method)) return;

        var toNode = e.target;
        var url = S.guessURL(toNode) || "";
        var formData = S.getForm(toNode);
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
                busyNode = p[3];
                break;
        }

        if(toNode == "null") toNode = 0;

        if(url) {
            e.preventDefault();
            S.doAction(e, method, url, formData, toNode, busyNode);
        }
    };

    /*
    * Retrieves data from the specified URL and places it inside toNode,
    * showing busyNode while the data is loading.
    */
    S.doAction = function(/*Event*/e, /*String*/method, /*String*/url,
                        /*Object*/data, /*Node|String*/toNode, /*String*/busyNode) {

        //only show busy if action was intentional
        var showBusy = busyNode || (e && /click|mousedown|mouseup|submit/.test(e.type));

        S.getURL(method, url, data, function(/*String*/str, /*boolean*/ok, /*XMLHttpRequest*/xhr) {
            if(showBusy) S.setBusy(0, busyNode);

            if(ok) {  //if HTTP 200, etc.
                if(toNode) {
                    if(byId(toNode)) {
                        S.flash(toNode, 240, function() {
                            S.setNodeValue(toNode, str);
                        });
                    } else alert("Tag with id '" + url + "' not found.");
                }

            } else if(xhr) {
                alert("Server Error: " + xhr.status + " " + xhr.statusText +
                      "\nFor: " + url.replace(/^(.{70}).*$/,"$1..."));
            }
        });

        if(showBusy) S.setBusy(1, busyNode);
    };

    /*
    * Guesses the implied URL from the given element. If it is an anchor, the 
    * href is returned. If is a form, the form action is returned.
    */
    S.guessURL = function(/*Node*/n) {
        var tag = toLowerCase(n.tagName);
        if(tag == "a") {
            return n.href;

        } else if(/input|textarea|button|select|form/.test(tag)) {
            if(tag != "form") n = n.form;
            return n.attributes["action"].value;
        }
    };

    /*
    * Modifies the first URL based on properties found in the second URL.
    * The second URL can only be (1) an absolute URL without the protocol and 
    * domain with a leading "/", (2) the filename and query part of a URL, 
    * (3) the query part of a URL including the leading "?".
    */
    S.mergeURLs = (function() {

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
            var s = extra.charAt(0);
            if(s == "\/") {  //absolute path URL
                s = extra;

            } else if(s == "?") {  //query only URL
                //combine all query parameters together
                var params = join(split(extra, split(orig)));
                s = orig.split("?")[0] + "?" + params;

            } else {
                var params = join(split(extra, split(orig)));
                //strip filename out of original URL and use second filename
                orig = orig.substr(0,
                    orig.split("?")[0].lastIndexOf("\/") + 1 || orig.length
                );
                s = orig + extra.split("?")[0] + "?" + params;
            }
            return s;
        };
    })();

    S.getForm = function(/*Node*/n) {
        var tag = toLowerCase(n.tagName);

        if(/input|button|textarea|select|form/.test(tag)) {
            var o = {};
    
            if(n.name && (tag == "button" ||
               (tag == "input" && /button|submit|image/i.test(n.type)))
              ) {
                o[n.name] = true;
            }
    
            var form = n.form || n;
            for(var i = 0; i < form.elements.length; i++) {
                var node = form.elements[i];
                var name = node.name;
                if(node.disabled || !name) return;
    
                if(/select/i.test(node.tagName)) {
                    o[name] = [];
                    for(var j = 0; j < node.options.length; j++) {
                        var opt = node.options[j];
                        if(opt.selected) o[name].push(opt.value || opt.text);
                    }
    
                } else if(!/button|submit|reset|image/i.test(node.type)) {
                    o[name] = node.value;
                }
            }
            return o;
        }
    };

    /*
    * Loads external JS files asynchronously and ensures only loaded once.
    */
    var loadJSURL = (function() {
        var c = {};
        return function(s) {
            if(!c[s]) {
                c[s] = document.body.appendChild(make("<scr"+"ipt><\/scr"+"ipt>")).src = s;
            }
        };
    })();

    /*
    * Set a node's content to the specified string. What content is set depends
    * on the node. If it's an input, its value is set. If it's an image, its
    * src is set. Anything else, its innerHTML is set.
    */
    S.setNodeValue = function(/*Node*/node, /*String*/value) {
        node = byId(node);

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

            //moves nodes from "n" to "c".
            var moveChildren = function(/*Node*/n, /*Node*/c) {
                var fc;
                while((fc = n.firstChild)) {
                    c ? c.appendChild(fc) : n.removeChild(fc);
                }
            };

            if(tag == "img") {
                node.src = value;

            } else if(tag == "select") {
                moveChildren(node);
                moveChildren(make("<select>" + value + "<\/select>"), node);

            } else if(tag == "table") {
                moveChildren(node);
                moveChildren(make("<table>" + value + "<\/table>"), node);

            } else if(tag == "tr") {
                moveChildren(node);
                moveChildren(make("<table><tr>" + value + "<\/tr><\/table>").rows[0], node);

            } else {
                node.innerHTML = value;
            }

            //execute inline scripts
            if(js) setTimeout(js, 0);

            //load external scripts. Note that since scripts were
            //marked defer, they can be loaded in any order.

            for(var i = 0; i < links.length; i++) {
                loadJSURL(links[i]);
            }
        }
    };

    /*
    * A cache of progress indicators that are currently being shown.
    */
    var busyCache = {};

    /*
    * Sets the visibility of a node, that is presumed to be a progress 
    * indicator. This function also accounts for when a progress indicator is
    * used by 2 separate processes. If the node doesn't exist, a default
    * progress indicator is created and used.
    */
    S.setBusy = function(/*boolean*/busy, /*String*/node) {
        if(!node) {
            node = byId("simpleajax-busy");

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
                    };
                    style.setExpression("left", db("scrollLeft") + "+(" + db("clientWidth") + "-this.offsetWidth)/2");
                    style.setExpression("top", db("scrollTop"));
                    style.margin = "0";
                    style.position = "absolute";
                }
            }
        }

        if(!(node = byId(node))) return;

        var id = node.id || "*";

        //keep track of how many processes are using this indicator
        busyCache[id] = (busyCache[id] || 0) + (busy ? 1 : -1);

        var _update = function() {
            node.style.display = (busyCache[id] > 0) ? "" : "none";
        };

        //show the indicator after 300ms incase the process finishes quickly
        if(busyCache[id] == 1) setTimeout(_update, 300); else _update();

        //if the same indicator is used again, flash it once to indicate activity
        if(busyCache[id] > 1) S.flash(node, 200);
    };

    /*
    * Flashes a node from visible to invisible to visible.
    */
    S.flash = function(/*Node*/node, /*int*/duration, /*Function*/callback) {
        node = byId(node);

        //returns the opacity of the element as a number
        var opacity = function(style) {
            return (/alpha\(opacity=(\d+)\)/i.exec(style.filter)||{})[1]/100 || style.opacity/1;
        };

        //an animation step function that is used by the animation handler
        var step = function(/*Node*/n, /*int*/v) {
            n = n.style;
            n.opacity = v;
            n.filter = v ? "alpha(opacity=" + Math.round(v * 100) + ")" : "";
            n.zoom = 1;
        };

        //The original opacity. We need this so that after the animation we
        //can reset the node to have an undefined opacity if it didn't have
        //one before.
        var orig = opacity(node.style) || "";

        //The computed opacity. We need this to know what what state the 
        //animation should begin from.
        var computed = opacity(S.css(node)) || 1;

        var lock = "_animLock";

        if(node[lock]) {  //don't allow concurrent animations on a node
            callback();

        } else {
            node[lock] = 1;
            S.anim(node, computed, 0, duration, step, function() {
                step(node, orig);
                node[lock] = 0;
                callback();
            });
        }
    };

    /*
    * Animates a node for "duration" length of time from values "from" to "to".
    * Actual CSS manipulation is done by "step".
    */
    S.anim = function(/*Node*/node, /*int*/from, /*int*/to, /*int*/duration, /*Function*/step, /*Function*/callback) {
        var start = new Date().getTime();
        var P = Math.PI/2;
        var func = function() {
            step(node, from);
            if(from != to) {
                var elapsed = new Date().getTime() - start;
                from = (elapsed - duration >= 40) ? to : from + Math.sin(elapsed/duration*P)*(to - from);
                setTimeout(func, 40);

            } else if(callback) {
                callback(node);
            }
        };
        func();
    };

    /*
    * A cache of GET responses that is returned again if the same GET 
    * request is sent twice. This can also be used to preload URLs.
    */
    S.xhrCache = {};

    /*
    * Loads a URL and returns the data as a string. Note that the URL must
    * be from the same domain as the page due to the "same origin security 
    * policy". If the URL is a data URL, the contents will return immediately.
    * If the URL is a fragment identifier, the innerHTML of the element with
    * that id is returned immediately.
    */
    S.getURL = function(/*String*/method, /*String*/url, /*String*/data, /*Function*/func) {
        method = toLowerCase(method);

        if(/^data:/.test(url)) {  //if data URL, return inline data
            return func(unescape(url.replace(/^data:,?/, "")), 1, null);

        } else if(/^#./.test(url)) {  //if fragment identifier, return innerHTML
            var node = byId(url.substr(1));
            return node ? func(node.innerHTML, 1, null) : alert("Tag with id '" + url + "' not found.");

        } else if(method == "get" && S.xhrCache[url]) {  //if cached, return cache
            return func(S.xhrCache[url], 1, null);
        }

        //disable caching of GETs by adding a random variable
        if(method == "get-nocache") {
            url += (/\?/.test(url) ? "&" : "?") + ".r=" + Math.random();
        }

        //convert hash object to URL string
        if(typeof data != "string" && !(data instanceof String)) {
            var s = [];
            for(var i in data) s.push(escape(i) + "=" + escape(data[i]));
            data = s.join("&");
        }

        if(method == "post") {
            if(!data) {
                //usurp form data from params in URL
                data = url.substr(url.indexOf("?") + 1);
                url = url.split("?")[0];  //remove query from URL

            } else {
                //copy params from URL into form data and avoid duplicates
                var params = url.substr(url.indexOf("?") + 1).split("&");
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
                    ok = xhr.status;
                    ok = ((ok >= 200 && ok < 300) || ok == 0 || ok == 304 || ok == 1223);

                    v = xhr.responseText;

                    if(method == "get") S.xhrCache[url] = v;
                } catch(e) {}

                func(v, ok, xhr);
            }
        };
        xhr.send(data);
    };

    S.getXHR = function() {
        var xhr = [
            function() {return new XMLHttpRequest();},
            function() {return new ActiveXObject("Msxml2.XMLHTTP");},
            function() {return new ActiveXObject("Microsoft.XMLHTTP");}
        ];

        for(var i = 0; i < xhr.length; i++) {
            try {
                var x = xhr[i]();
                S.getXHR = xhr[i];
                return x;
            } catch(e) {}
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
    S.register("onsubmit", "form");

    return S;
})({});