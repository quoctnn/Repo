<!--
Task schedule
-->

v0.5.5 | 26.08.2019
-----------------------------------------

Added:
======

* Clickhandler on InfoToast
* Check for backend connection before loading
* Search for Groups and Projects from Sidebar
* Calendar module
* Full Calendar module
* Mention support for Community, Group, Event, Conversation, Project, Task
* Adaptive font-size for main posts(large text when less that 85 chars)
* GDPR consent dialog
* Friendship info and buttons on profile page
* 'See all' communities opens search box

Changes:
======

* Rebuilt login/signin screen and loading screen
* Switched to a new emoji input panel
* Made search accessible from url and linked hashtags in posts to search
* replaced button filters with dropdown filters for several modules (Newsfeed etc )


v0.5.4 | 13.08.2019
-----------------------------------------

Added:
======

* Status page with highlighting and capability to load newer/older comments
* 7 new modules for profile page
* Page/dialog for logging and displaying errors
* Added buttons for removing failed temporary conversation messages
* Added ability to replace text emoji with emoji while typing

Bugfixes:
=========
* Fixed crash when UploadedFile did not have any extension
* Fixed issue with Status text truncation ("read more")
* Fixed issue with inserting received sub comments
* Fixed issue with retry sending conversation message


v0.5.3 | 31.07.2019
-----------------------------------------

Added:
======

* Search component


v0.5.2 | XX.07.2019
-----------------------------------------

Added:
======

* Tabbed layout for modules
* Support for Subgroup listing in GroupModule


Changes:
========

* Many small adjustments to content in Sidebar Menu
* Anonymous users no longer has a dashboard
* You can only see whom has read your own posts
* Compacted the status options
* Moved side menu arrow down to bottom


Bugfixes:
=========

* Fixed some nullpointers
* Sending all whitespaces in message causes error


<hr/>

v0.5.1 | r27.06.2019
-----------------------------------------

Added:
======

* TopNavigation
* SideMenuNavigation
* Cover module
* Favorite system
* Files page with grid and list mode (grid mode items will be large elements in next release)
* Developer tools page
* Notification panel

Changes:
========

* Modified page layout system
* Disabled 360 photo viewer due to high CPU usage
* Modified list modules to support "load more" and "show in dialog" ++
* Centered status/post header and updated status "bubble" size


<hr/>

v0.5.0 | r31.05.2019
-----------------------------------------

Added:
======

* Read listing on statuses and comments
* Image on 404-page
* Images for empty lists and list errors
* 360 photo viewer
* Routine for marking statuses and messages as read
* Support for animated GIFs
* Navigation prevention when user has unsaved content
* File renaming when creating/editing Statuses

Changes:
========

* Style adjustments for Newsfeed
* Replaced dropzone/upload component
* Open external links in external browser (Electron)

Bugfix:
=======

* Fixed crash on Newsfeed context search