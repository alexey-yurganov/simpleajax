# Method Parameters #

To invoke SimpleAjax, add a `rel` attribute to any hyperlink or form control:

> <a href="desc.php" **rel="get # div1 loading"**>View Description

Unknown end tag for &lt;/a&gt;



This syntax consists of:
  * **"rel"**: When an element with a "rel" attribute is activated SimpleAjax will take over and invoke the alternate AJAX behavior.

  * **["get"](#The_HTTP_Method.md)**: This must be a valid HTTP method (or variants of it) that will be used to retrieve the resource over the Internet. It can be "post", "get", or "get-nocache".

  * **[#The_#_URL "#"]**: This is a URL indicating the resource to download. Relative URLs are accepted.

  * **["div1"](#The_Content_ID.md)**: This is the ID of an element (on the current page) that will be used to display the server results. It also accepts "null" as a name to indicate that the response should not be displayed.

  * **["loading"](#The_Loading_ID.md)**: This is the ID of an element that will be shown when a server request is being sent and will be hidden when the server response has arrived. Effectively this is an progress indicator.

### The HTTP Method ###
This is a valid [HTTP method](http://en.wikipedia.org/wiki/HTTP#Request_methods) that will be used to retrieve the resource over the Internet. The following methods are supported:

  * GET: Used to indicate that retrieving the resource will not cause side effects. The responses of all GET requests will be cached so that subsequent requests to that URL are fast.

  * GET-NOCACHE: Same as GET except the URL is not cached by SimpleAjax and the URL is modified each time so that it cannot be cached by any intermediate servers.

  * POST: Submits data to the server with the expectation that side effects may occur such as updates to the servers data.

The only supported HTTP methods are "get, get-nocache, post, put and delete" and are case-insensitive. Any other method will be ignored.

### The # URL ###
This is a URL to a resource on the Internet. It can be a relative URL, in which it is relative to the implied URL.

Three additionally supported URLs are:
  * An _implied URL_ (#) is just the URL implied by the element. The implied URL of a hyperlink is its `href` URL.

  * A _data URL_ specifies data that is [inline](http://en.wikipedia.org/wiki/Data:_URI_scheme) in the URL.

  * A _fragment identifier_ identifies data that is readily found on the current page.

#### This table illustrates the different scenarios: ####

| **Concept** | **Example HTML** | **Resulting data** |
|:------------|:-----------------|:-------------------|
| Absolute URL | `<a href="http://msn.com/en/about.html" rel="get http://msn.com/en/about.html div1">` | http_:_//msn.com/en/about.html |
| Implied URL | `<a href="http://msn.com/en/about.html" rel="get # div1">` | http_:_//msn.com/en/about.html |
| Relative URL | `<a href="http://msn.com/en/about.html" rel="get help.html div1">` | http_:_//msn.com/en/help.html |
| Relative URL | `<a href="http://msn.com/en/about.html" rel="get /more.html div1">` | http_:_//msn.com/more.html |
| Relative URL | `<a href="http://msn.com/en/about.html" rel="get ?id=3 div1">` | http_:_//msn.com/en/about.html?id=3 |
| Relative URL | `<a href="http://msn.com/en/about.html?n=2" rel="get ?id=3 div1">` | http_:_//msn.com/en/about.html?n=2&id=3 |
| Relative URL | `<a href="http://msn.com/en/about.html" rel="get help.html?id=3 div1">` | http_:_//msn.com/en/help.html?id=3 |
| data URL | `<a href="http://msn.com/en/about.html" rel="get data:hello%20world div1">` | hello world |
| Fragment Identifier | `<a href="http://msn.com/en/about.html" rel="get #from div1"></a><div id="from">hello world</div>` | hello world |

#### The URL as an optional parameter ####
The URL is an optional parameter, when it is implied and when no loading parameter is needed. The following two URLs are equivalent:

> `<a href="more.php" rel="get div1">` **is equal to** `<a href="more.php" rel="get # div1">`

### The Content ID ###
This is an element on the page that will have its children updated when the server responds. It can be any element, but must be marked with an ID.

e.g.,

```
Your transaction was: <span id="div1"></span>
```
```
<table id="div1" border="0">
  <tr>
    <td>GOOG</td><td>567</td>
    <td>IBM</td><td>124.94</td>
    <td>MSFT</td><td>27.49</td>
  </tr>
</table>
```
```
<select id="div1">
  <option>Haiti</option>
  <option>Honduras</option>
  <option>Hong Kong</option>
  <option>Hungary</option>
<select>
```

### The Loading ID ###
This is an element that will be shown or hidden as necessary to indicate to the user that their request is in progress. This is purely a usability feature and this parameter is optional.

e.g.,
```
<div id="report">
  <a href="report.php" rel="get-nocache # report loading">Show Report</a>
  <img src="throbber.gif" id="loading" style="display:none">
</div>
```