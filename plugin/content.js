/////////////////START
function __DEBUG(...args) {
  console.log('CONTENT:', args);
}
InjectScript();

// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////

function InjectScript() {
  __DEBUG('InjectScript');
  var s = document.createElement('script');
  s.src = chrome.extension.getURL('inject_script.js');
  s.onload = function() {
    this.parentNode.removeChild(this);
  };
  (document.head||document.documentElement).appendChild(s);
}

function isLoggedIn() {
  __DEBUG('isLoggedIn');
  return 1;
}

// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////
function _sendEventToInjectedScript(event_name) {
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent(event_name, true, true, {});
  document.dispatchEvent(evt);
}

function _sendMessageToBackgroud(request, callback) {
  request.from = 'Content';
  chrome.extension.sendMessage(request, callback);
}

// CHROME LISTENERS ///////////////////////////////////////////////////
// CHROME LISTENERS ///////////////////////////////////////////////////
// CHROME LISTENERS ///////////////////////////////////////////////////
// CHROME LISTENERS ///////////////////////////////////////////////////
// CHROME LISTENERS ///////////////////////////////////////////////////
// Listener to Background Events
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    __DEBUG(request);
    if (isLoggedIn()) {
      if (request.from == 'Options' && request.key == 'Shuffle') {
        // radio_shuffle = request.value.newValue;
      } else if (request.command) {
        if (request.command == 'NextRadio') {
          _sendEventToInjectedScript("TIR_NextRadio");
        } else if (request.command == 'PlayPause') {
          _sendEventToInjectedScript("TIR_PlayPause");
        }
      }
    } else {
      var error_request = {error : 'NotLoggedIn', error_message : 'Please Log In!', state : 'error'};
      _sendMessageToBackgroud(error_request);
    }
});
