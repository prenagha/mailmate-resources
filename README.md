# Mailmate Resources

This directory is a sampling of what I have in ```/Users/me/Library/Application Support/MailMate/Resources```

My customizations to MailMate Resource files to:

* Customized header layout
  * * Display Sender header (Outlook calendar forwards make this important)
  * * Flip "Last, First" names to "First Last"
  * * Show Name only (not Name and Address)
  * * Click search is against "Any Address" using address (not name)
  * * [Gravatar](https://www.gravatar.com/) avatar support for From, To, CC, BCC headers
  * * Fallback to domain favicon if Gravatar not found
  * * Use local avatar images for common addresses

* Avatars
  * * In general avatar tries Gravatar first, then falls back to Favicon of address domain name
  * * From: label replaced by avatar of from address
  * * To/CC/BCC:
      * * If only 1 recipient, header label replaced by their avatar
      * * If > recipient, and all recipients from the same domain, header label replaced by domain Favicon
      * * Otherwise avatar displayed to right of each recipient name
      
* Customized Message Verifications
  * * Catch replies to tool accounts (JIRA, CVS)
  * * Don't respond via home email to a previously used work recipient (and vice versa)
  * * If a new recipient make sure to send from home/work properly

Uses [jQuery](https://jquery.com) as referenced in headersFormatting.plist so make sure to download that and put in scripts directory.

Default icons (user, users, cvs, jira) are mostly colored PNG versions of [Font Awesome icons](http://fontawesome.io). But of course you can use any icon you like.

Of course replace all ```/Users/me/``` with your home directory.

Uses [Favicon Finder]((https://icons.better-idea.org) which I have found works best. You can see other options commented out in the code. Also Favicon Finder is open-source and you can run it locally if you like.

[MD5 script](http://www.myersdaily.org/joseph/javascript/md5.js) included inline in ```custom.js``` because I couldn't get it to work from its own script file.

Examples

(ex1.png)
(ex2.png)
