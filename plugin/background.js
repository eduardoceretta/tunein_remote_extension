
function _processResponse(response) {
  if (response && response.state) {
    var buffering = '...';
    var playing = '►';
    var paused = ' ▌▌';
    var stopped = 'X';

    var music = '\u266B';
    if(response.state == 'playing') {
      chrome.browserAction.setBadgeText({text: music});
    } else if(response.state == 'stopped') {
      chrome.browserAction.setBadgeText({text: paused});
    } else if (response.state == 'idle') {
      chrome.browserAction.setBadgeText({text: stopped});  
    } else if (response.state == 'buffering') {
      chrome.browserAction.setBadgeText({text: buffering});
    } else {
      chrome.browserAction.setBadgeText({text: ''});
    }
    chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 255]});
  }
}

function _sendMessageToTuneInTab(request, callback) {
  chrome.tabs.query({url : 'http://tunein.com/*'}, function(tabs) {
    if (tabs && tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, request, callback);
    }
  });
}

// LISTENERS
// LISTENERS
// LISTENERS

// Listens to Content Connections
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "Content");
  port.onMessage.addListener(function(response) {
     _processResponse(response);
  });
});

// Listens to Content Messages
chrome.extension.onMessage.addListener( function(request, sender, sendResponse) {
  if (request.from == 'PopUp') {
    _sendMessageToTuneInTab(request, function(response) {
      _processResponse(response);
    });
  }
});

// Listens to Keyboard Presses
chrome.commands.onCommand.addListener(function(command) {
  command = command.replace('Alias', '');
  if(command == 'PlayPause' || command == 'NextRadio' ) {
    var request = {};
    request.from = 'Keyboard';
    request.command = command;
    _sendMessageToTuneInTab(request, function(response) {
      _processResponse(response);
    });
  }
});

// Listens to LocalStorage Changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    request = {};
    request.from = "Options";
    request.key = key;
    request.value = changes[key];
    _sendMessageToTuneInTab(request);
  }
});
