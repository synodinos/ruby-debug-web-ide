#ruby-debug-web-ide
A prototype app for debugging Ruby scripts in [Web IDEs](http://www.infoq.com/news/2009/02/web-based-ide).

## How it works

[Screencast](http://www.youtube.com/watch?v=NABtpXmdbuU) (try hi-res + full-screen)

1. User starts the server e.g. `node socket-server.js`.
2. Visits http://localhost:8888/.
3. Page loads and `front.js` opens one websocket to the server and gets the list of Ruby script
available at public/ruby.
4. User selects a script from the drop-down, `front.js` loads it in the editor (Ace).
5. User enters line for breakpoint and presses the DEBUG button.
6. `node socket-server.js`
    - Spawns the debugger on a different process,
    - Sets the break point,
    - Inspects local variables,
    - Sends the data back to the client over the Websocket,
    - Terminates debugger process.
  7. `front.js` renders data in a table.


![Image](http://github.com/synodinos/ruby-debug-web-ide/raw/master/ruby-debug-web-ide-splash.jpg)

## Known issues
This is just a proof-of-concept and has several issues like racing-conditions, poor scalability,
 garbage-processes, etc. etc.

## Notes about ruby-debugger-ide
* As far as I know it was used in NetBeans and RubyMine
* Now primaraly supported by the IntelliJ team (RubyMine)

## Tested configuration
* Node.js v0.5.0-pre
    * Socket.io@0.7.7
    * Express 2.4.3
    * libxmljs@0.4.2
* Ruby 1.8.7
    * ruby-debug 0.10.4
    * ruby-debug-base 0.10.4
    * ruby-debug-ide 0.4.16
* Google Chrome 14 beta
    * jQuery 1.6.2
    * Underscore.js 1.1.7
* Mac OS X 10.6.8

