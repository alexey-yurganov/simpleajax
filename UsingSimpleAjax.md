# Using SimpleAjax #

## Add SimpleAjax to your Website ##
First add the following script tag anywhere in your HTML.
```
<script src="http://simpleajax.googlecode.com/svn/trunk/simpleajax.js"></script>
```

## Customize the HTML of the Button or Link ##
Then find the button or link with which you want to invoke an AJAX action. That element can be any form element (e.g., text field, button, select box, check box, etc.) or it can be a hyperlink. Then add a `"rel"` attribute to it.

e.g.,
```
<button rel="get getquote.cgi msg"></button>
```
```
<input type="password" rel="post checksecure.cgi sec"> Security level: <span id="sec"></span>
```
```
<a href="moreinfo.html" rel="get more">More info...</a><div id="more"></div>
```

### Parameters ###
The `rel` attribute value is a space delimited list of 4 [parameters](MethodParameters.md):
| **Index** | **Parameter** | **Meaning** | **Example** |
|:----------|:--------------|:------------|:------------|
| 1st | Method | The HTTP method that will be used to send the data. | get, post |
|2nd`*` | URL | Where the data should be sent to. | checkid.php?usr=3&auto=yes |
|3rd | Element ID for response | The ID of an element on the page that the server response should be put into. | header1 |
|4th`*` | Element ID of progress bar | The ID of an element that is also a progress indicator. When a server request is sent, this progress indicator is shown. When the server provides a response, the progress indicator is hidden. | waiting1 |

(`*`optional)

## Make a Place for the Server Response ##
When the server responds it will return a snippet of HTML. Find a place on the website where the HTML should be placed. It can be a div element, a table cell, or even another form element. Give that element an ID and make sure that that ID is also in the previously mentioned `rel` attribute.
```
Your security level is: <span id="sec_level"></span>
```

## Add a Progress Indicator ##
Since the Internet is slow because of the tubes, it would be nice to have a progress indicator to tell the user that their request is being processed. You can specify the progress indicator element by passing its ID as the fourth parameter of the `rel` attribute.
```
<a href="#" rel="get-nocache checkmail.pl status loading">Check Mail</a>
<span id="loading">Checking for new mail...</span>
```
When the above link is clicked, SimpleAjax will show the `"loading"` element, then call `checkmail.pl`, then when the server responds, it will hide the `"loading"` element and then place the response into the `"status"` element.