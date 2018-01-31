function __DEBUG() {
  console.log(arguments);
}

function _processResponse(response) {
  __DEBUG('_processResponse', response);
  if (response){
    if(response.state)
      _updateBadge(response.state);
    _updatePopUp(response);
  }
}

function _updatePopUp(response) {
  __DEBUG('_updatePopUp', response);
  if(response && response.error)
    chrome.storage.local.set({'Error': response});
  else chrome.storage.local.set({'Error': null});
}

function _updateBadge(state) {
  __DEBUG('_updateBadge', state);
  var buffering = '...';
  var playing = '►';
  var paused = ' ▌▌';
  var iddle = 'X';
  var error  = '!';
  var music = '\u266B';

  chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 255]});
  if(state == 'playing') {
    chrome.browserAction.setBadgeText({text: music});
  } else if(state == 'stopped') {
    chrome.browserAction.setBadgeText({text: paused});
  } else if (state == 'idle') {
    chrome.browserAction.setBadgeText({text: ''});
  } else if (state == 'connecting') {
    chrome.browserAction.setBadgeText({text: buffering});
  } else if (state == 'error' || state == 'unplayable') {
    chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
    chrome.browserAction.setBadgeText({text: error});
  } else {
    chrome.browserAction.setBadgeText({text: ''});
  }
}

function _sendMessageToTuneInTab(request, callback) {
  __DEBUG('_sendMessageToTuneInTab', request);
  chrome.tabs.query({url : '*://tunein.com/*'}, function(tabs) {
    if (tabs && tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, request, callback);
    }
  });
}

//////////////////////////////////////////////////////////
// LISTENERS

// Listens to Content Connections
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "Content");
  port.onMessage.addListener(function(response) {
    _processResponse(response);
  });
});

// Listens to Messages
chrome.extension.onMessage.addListener( function(request, sender, sendResponse) {
  if (request.from == 'PopUp') {
    _sendMessageToTuneInTab(request, function(response) {
      _processResponse(response);
    });
  } else if (request.from == 'Content') {
    _processResponse(request);
  }
});

// Listens to Keyboard Presses
chrome.commands.onCommand.addListener(function(command) {
  __DEBUG('chrome.commands.onCommand.addListener', command);
  command = command.replace('Alias', '');
  if( command == 'PlayPause'  ||
      command == 'NextRadio') {
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
