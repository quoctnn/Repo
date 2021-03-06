<!--
Task schedule
-->

v0.5.8 | 04.12.2019
-----------------------------------------

Added:
======
Task creation and updating
Form for registering new users
Membership requests administration in community, group and event settings
Font size global option
User theme preference is saved in backend
Back button on Electron apps


Changes:
========
New sidebar menu, community selector
Task listing has new layout
Private conversations are disabled if user has been blocked
Notifications dialog shows only 5 items per category by default
Improved contacts module performance


Bugfixes:
=========
Profile theme was broken
Font color issues/inconsistensies



v0.5.7 | 22.10.2019
-----------------------------------------

Added:
======
Leave, Delete, Mute Notifications and Unmute Notifications for Community, Group, Event and Project
Member administration dialog with pages for members, roles and invitations for Community, Group, Event and Project
Events for triggering client updates

Changes:
======
Moved groups, events and projects out of Redux Cache.
Websocket refactored
Conversations updated instantly when adding/removing members

Bugfixes:
=========
Fixed issue with clearing text field on conversation page


v0.5.6 | 01.10.2019
-----------------------------------------

Added:
======

* Sorting options for 'Recent Activities'
* Unfriend button on profile page
* Multi-select edit on ListComponent
* Community selector top/most used
* Favorite button on search result items
* Conversation detail module
* Multiple file upload for conversation messages
* Community create/update form
* Group create/update form
* Event create/update form
* Project create/update form
* Components for avatar/cover cropping
* More context links in search results
* Invitations list for Community, Group and Event
* Invite form for Community, Group and Event
* Warning/info box for Internet connection loss
* Warning/info box for Websocket connection loss
* Profile update form


Changes:
======

* Improved reaction display
* Improved error logging
* Improved mobile support for Conversation page
* Improved mobile support for Search page

Bugfixes:
=========

* Fixed bug with duplicate messages when creating conversation
* Fixed logo issues on Safari
* Fixed issues with text input cursor positioning
* Fixed issue with mentions containing '.'
* Fixed small layout issue on conversation
* Fixed issues inserting comment when status(parent) not available
* Fixed issue with multiple reloads when reacting to status/comment


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