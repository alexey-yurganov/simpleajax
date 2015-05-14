# Introduction #
Todoist Wall is a free todo list web app that works offline and syncs with your Todoist account. (You will need a [todoist.com](http://todoist.com) account which is also free.) Add the web app to your iPhone home screen to activate fullscreen view. It is designed for the iPhone's small screen and touch interface and starts up fast. It uses a number of HTML5 technologies and touch events to achieve a robust yet fast application.

Todoist Wall presents all your projects and tasks on a huge wall and you can pan left and right to view them. You can tap to add more tasks or to mark tasks as completed. You can tap and hold to edit a task. Due and overdue items are distinctly highlighted for clarity.

If you have a Todoist account, try **[Todoist Wall](http://simpleajax.googlecode.com/svn/docs/demos/todoist.html)** now.
If you are using Firefox, login with your [Todoist API token](http://getsatisfaction.com/todoist/topics/how_do_i_get_an_api_token).

[![](http://img545.imageshack.us/img545/6735/todoistwallmain.jpg)](http://img545.imageshack.us/i/todoistwallmain.jpg/)


---

# HTML5 #
Todoist Wall uses HTML5 Application Cache so that the web app can be accessed offline. Todos are stored in the HTML5 Web SQL Database so that they are available offline. Offline access only works on Webkit based browsers such as the iPhone, Android, Safari and Chrome.

```
<html manifest="todoist.manifest">
```

CSS Transforms are used to give the web app some animation and fluidity. Because CSS Transforms are native to Webkit, there is no performance hit or code overhead for it.

```
li {-webkit-transition:margin 0.3s}
```

Being a web app means Todoist Wall inherits some benefits from the Safari browser. Firstly, it starts up faster than native apps. Secondly, you can pinch anywhere on the interface to zoom in or out. You can also double-tap and hold to activate the copy/paste function, which allows you to copy any part of your todo list to the clipboard.

[![](http://img440.imageshack.us/img440/9899/todoistwallicon.jpg)](http://img440.imageshack.us/i/todoistwallicon.jpg/)


---

# Cloud-based #
Your todo list is stored in the cloud, therefore any changes you make on your iPhone is immediately available on your desktop or at an Internet cafe.


---

# Usability #
Todoist Wall has been optimized for the iPhone:
  * Buttons have large activation areas to make them easier to tap with a finger.
  * Instead of tapping back and forth on the menu to change to another project, simply swipe left and right to fly to other projects.
  * Use fuzzy text to specify a due date, such as "tom" for "tomorrow" or "ev friday" for "every friday".
  * Switch between portrait and landscape keyboards midway to speed up typing and accuracy.
  * The Wall's white on black background allows for better visibility under sunlight and better eye comfort when reading it at night. You can also switch to a [black on white background](http://simpleajax.googlecode.com/svn/docs/demos/todoist.html#w).
  * An iPhone home screen icon is also available when you add the web app to your iPhone's home screen.

[![](http://img691.imageshack.us/img691/9189/todoistwalldue.jpg)](http://img691.imageshack.us/i/todoistwalldue.jpg/)


---

# Open Source #
Todoist Wall is released under the MIT Open Source license.


---

If you have a Todoist account, try **[Todoist Wall](http://simpleajax.googlecode.com/svn/docs/demos/todoist.html)** .