#!/usr/bin/env node
var chromeLauncher = require('chrome-launcher');
var CDP = require('chrome-remote-interface');
var validUrl = require('valid-url');
var os = require('os');

var lastarg = process.argv.pop();

if (!validUrl.isUri(lastarg)) {
  console.log("Usage: bugout-launcher SERVER-URL");
  process.exit(1);
}

function log() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(new Date().toISOString().replace(/[TZ]/g, " "));
  console.log.apply(this, args);
}

function launchChrome(headless=true) {
  return chromeLauncher.launch({
    // port: 9222, // Uncomment to force a specific port of your choice.
    chromeFlags: [
      '--window-size=412,732',
      '--disable-gpu',
      '--user-data-dir=' + os.homedir() + '/.bugout-launcher-chrome',
      headless ? '--headless' : ''
    ]
  });
}

launchChrome().then(function(chrome) {
  CDP.Version({port: chrome.port}).then(function(version) {
    log("Browser launched:", version['User-Agent']);
  });
  CDP({port: chrome.port}).then(function(p) {
    Promise.all([p.Network.enable(), p.Page.enable(), p.Runtime.enable(), p.Console.enable()]).then(function() {
      p.Console.messageAdded((message) => {
        // message.message.level = log,warning,error,debug.info
        log(message.message.text);
      });
      p.Page.loadEventFired(function() {
        // TODO: watchdog
        /*p.Runtime.evaluate({expression: "console.log('remote');"}).then(function(result) {
          // log("remote result:", result);
        });*/
      });
      p.Page.navigate({url: lastarg}).then(function() {
        
      });
    });
  });
});

