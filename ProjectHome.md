By marking up your HTML with simple attributes, you can make your website Ajaxified without writing any JavaScript. This tool will do all the heavy work for you.

# What is SimpleAjax? #
SimpleAjax is a lightweight (8K) tool that was made for people who don't know JavaScript, but do know server-side programming (PHP, Ruby, etc.), and want to AJAX enable their website. SimpleAjax will take care of all the event handling and data collection tasks that need to be done in JavaScript so all you have to do is write the server part. SimpleAjax will also take the server response and put it anywhere on the page for you. You do not need to write a single line of JavaScript.

# Features #
  * **No coding**: No JavaScript coding, that is. Just some simple HTML attributes. Server-side coding required.

  * **Lean HTML**: Requires fewer HTML additions and therefore less overhead, making your page lean and bandwidth efficient.

  * **Speed**: No waiting till "onload" for it to work, and no DOM traversal overhead at startup.

  * **Simplicity**: This tool is not over-engineered so you don't have to be a rocket scientist.

  * **Small API**: Only just 4 permutations of parameters and 1 function name to remember.

# Demos #
[Feature Tests](http://simpleajax.googlecode.com/svn/docs/demos/simple_demos.html),
[Tab Widget](http://simpleajax.googlecode.com/svn/docs/demos/tabs.html),
[YouTube Test](http://simpleajax.googlecode.com/svn/docs/demos/youtube.html)

# Tutorial #
Quick run-through on [using SimpleAjax](UsingSimpleAjax.md)

# Download #
Coming soon, but now on SVN only, uncompiled. MIT Licensed. Cross-browser.

# What does it look like? #
```
<div id="vid1">
<a href="play.php?q=3" rel="get # vid1">Play Video</a>
</div>
```
The above snippet will call `play.php?q=3` and place the returned HTML into a div with id `"vid1"`. See this demo.

# Scope #
SimpleAjax is not a [framework](http://code.google.com/webtoolkit/) or a [library](http://developer.yahoo.com/yui/). It doesn't help you write [object-oriented code](http://www.prototypejs.org/), or [compact code](http://jquery.com/), or make [things fly](http://script.aculo.us/) across the page. It doesn't try to simulate the desktop with [dialogs](http://www.extjs.com) and [widgets](http://dojotoolkit.org). Instead it is designed to do one thing only, which is to send data to the server and update the page, without ever leaving the page. This is where AJAX is supposed to shine: in its ability to not disrupt the user's work flow.