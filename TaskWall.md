# Introduction #
TaskWall is a free web app that works offline and syncs with your Google Tasks. Add the web app to your iPhone home screen to activate fullscreen view. It is designed for the iPhone's small screen and touch interface and starts up fast. It uses a number of HTML5 technologies and touch events to achieve a robust yet fast application.

If you have a Google account, try **[TaskWall](http://simpleajax.googlecode.com/svn/docs/demos/taskwall.html)** now.

[![](http://img32.imageshack.us/img32/48/iphone4cl.jpg)](http://imageshack.us/photo/my-images/32/iphone4cl.jpg/)


---

# Features #
  * Download all your tasks and view them offline
  * Offline search through all your tasks.
  * One click search by days overdue.
  * Flag your tasks as important for quick access.
  * Hotkeys allow you to search just by typing.
  * Add new tasks by clicking on the List name.
  * Add sub-tasks by clicking on an existing Task name.
  * Use fuzzy text to specify a due date, such as "tom" for "tomorrow" or "+2" for "day after tomorrow".


---

# HTML5 #
TaskWall uses HTML5 Application Cache so that the web app can be accessed offline. Tasks are stored in the HTML5 Web SQL Database so that they are available offline. Offline access only works on Webkit based browsers such as the iPhone, Safari and Chrome.

```
<html manifest="todoist.manifest">
```

CSS Transforms are used to give the web app some animation and fluidity. Because CSS Transforms are native to Webkit, there is no performance hit or code overhead for it.

```
li {-webkit-transition: -webkit-transform 0.5s}
```

Being a web app means TaskWall inherits some benefits from the Safari browser. Firstly, it starts up faster than native apps. Secondly, you can pinch anywhere on the interface to zoom in or out. You can also hold to activate the copy/paste function, which allows you to copy any part of your task list to the clipboard.


---

# Cloud-based #
Your tasks are stored in the cloud, therefore any changes you make on your iPhone is immediately available on your desktop or at an Internet cafe.


---

# Usability #
TaskWall has been optimized for the iPhone:
  * Buttons have large activation areas to make them easier to tap with a finger.
  * Switch between portrait and landscape keyboards midway to speed up typing and accuracy.
  * The Wall's white on black background allows for better visibility under sunlight and better eye comfort when reading it at night. You can also switch to a black on white background.
  * An iPhone home screen icon is also available when you add the web app to your iPhone's home screen.


---

# Open Source #
TaskWall is released under the MIT Open Source license.