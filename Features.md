# Features of SimpleAjax #

## Simplicity ##
SimpleAjax remains simple by following three principles:

**Small APIs are easy to learn and memorize.** One requirement of SimpleAjax is to be something you could start using in minutes. To meet that requirement, much focus was placed in making the core features work in very few steps and making those steps easy to pick up and memorize. That is why SimpleAjax only has 1 function call and 4 parameters. The boilerplate code is literally 1 line of code.

**Don't require writing code if it's not necessary.** In the world today there are two bad habits inherited from the history of JavaScript: requiring !Javascript objects to be initialized with a node ID, and requiring the programmer to manually load and unload an object. As a result, even accomplishing the simplest of tasks requires the programmer to write some !Javascript. Often times such actions are not even necessary. The browser provides an environment where objects could gather all the node information for itself and perform it's own housekeeping tasks. SimpleAjax understands this principle and from the start it has been designed to avoid the need for loading and unloading, and where it does need to, it handles everything by itself. This means the developer has less code to write, debug and maintain.

**Short syntaxes are fast to read and write.** Taking a page out of jQuery, we realized that short and concise method names coupled with uniform conventions produced code that was quick to read, yet understandable enough to not cause confusion. Also, if a block of code could all be read in 1 sitting, then the user is more likely to be able to grasp it all in their head, than a block of code that causes the user to forget what happened at the start, by the time they reach the bottom.

## Speed ##

**First availability.** Most tools only become available after the "DOMContentLoaded" event has fired. This means it must wait for the whole page (excluding the images) to load before being available. On slow networks, the page may be visible early and the user can scroll around, but because the whole page is not done all !Javascript tools will be unavailable. SimpleAjax improves on that by being available as soon as the tool is downloaded, which allows users to interact with it much earlier.

**Cost of startup time.** During startup, some tools need to make a list of all the nodes on the page that match a certain criteria and then act on them in some way. This operation takes up valuable time, may make the browser unresponsive during that period, and it is unknown whether the fruits of those calculations will be actually used. SimpleAjax avoids these problems by using lazy evaluation, whereby those tasks are performed only when they are needed. This means that each task may take 1 fraction of a second longer, but in return the page loads seconds faster and is immediately responsive.