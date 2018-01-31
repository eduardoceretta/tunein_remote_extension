var player_status_checker_timer = null;
var player_status_checker_counter = 0;

var error_request = {error : 'NotLoggedIn', error_message : 'Please Log In!', state : 'error'};

var context = {
  radio_list : [],
};

/////////////////START
console.log('TuneIn Remote Plugin is controlling this tab now!!!');

InitInjectScript();
InitTimers();

// $( document ).ready(function() {
  // GetInitialInfo();
// });

function __DEBUG() {
  console.log(arguments);
}

// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////

function InitTimers() {
  __DEBUG('InitTimers');
  player_status_checker_timer = setInterval(_playerStatusChecker, 1000);
}

function InitInjectScript() {
  __DEBUG('InitInjectScript');
  var s = document.createElement('script');
  s.src = chrome.extension.getURL('inject_script.js');
  s.onload = function() {
    this.parentNode.removeChild(this);
  };
  (document.head||document.documentElement).appendChild(s);

  document.addEventListener('TIR_TuneInEvent', function (e) {
    _processTuneInEvent(e.detail);
  });
}


function GetInitialInfo() {
  __DEBUG('GetInitialInfo');
  _requestAuthorizationInfo();
}

// Go to NextRadio
function nextRadio() {
  __DEBUG('nextRadio');
  _nextRadio();
}

// Play/Pause current Radio
function playPause() {
  __DEBUG('playPause');
  _playPause();
}

function isLoggedIn() {
  __DEBUG('isLoggedIn');
  return 1;
  if(!context.userAuthenticated) {
    _requestAuthorizationInfo();
  }
  return context.userAuthenticated;
}

// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////
function _playerStatusChecker() {
  player_status_checker_counter++;
  if (document.getElementById('playerActionButton')) {
    var cur_class = document.getElementById('playerActionButton').className;
    if (cur_class == 'playing' && player_status_checker_timer) {
      window.clearInterval(player_status_checker_timer);
    } else if (cur_class == 'failed') {
      nextRadio();
    }
  }

  // After a minute don't check the status so often.
  if (player_status_checker_counter == 60) {
    window.clearInterval(player_status_checker_timer);
    player_status_checker_timer = setInterval(_playerStatusChecker, 5000);

  // If it still doesn't help just give up
  } else if (player_status_checker_counter > 80) {
    console.log('stop checking for player status');
    window.clearInterval(player_status_checker_timer);
  }
}

function _processRadioListUpdate(result) {
  __DEBUG('_processRadioListUpdate', result);
  context.radio_list = result;
}

function _processTuneInEvent(data) {
  __DEBUG('_processTuneInEvent', data);
  console.log('TIR_TuneInEvent', data);

  if (data.eventName == 'UpdateRadioList') {
    _processRadioListUpdate(data.radioList);
  }

  // if(data.userAuthenticated != undefined) {
  //   context.userAuthenticated = data.userAuthenticated;
  // }

  // if(context.userAuthenticated == true) {
  //   _sendMessageToBackgroud({state : data.playState});

  //   if( data.eventName === "Broadcast.TuneFailed"    ||
  //       data.eventName === "Tunner.StreamsExhausted" ||
  //       (data.eventName === "Tunner.PlayStateChanged" && data.playState === "unplayable")
  //     ) {
  //     _nextRadio();
  //   }
  // }else {
  //   _sendMessageToBackgroud(error_request);
  // }
}

function _nextRadio() {
  __DEBUG('_nextRadio');
  var radios = context.radio_list;
  if(radios.length > 0) {
    var radio_index = Math.floor(Math.random() * radios.length);
    var radio = radios[radio_index];
    __DEBUG('  _nextRadio:Play ' + radio.title, radio_index , radios.length);
    _playRadio(radio);
  }
}


function _sendMessageToBackgroud(request, callback) {
  request.from = 'Content';
  chrome.extension.sendMessage(request, callback);
}

// TUNEIN WRAPPER FUNCTIONS ///////////////////////////////////////////////////
// TUNEIN WRAPPER FUNCTIONS ///////////////////////////////////////////////////
// TUNEIN WRAPPER FUNCTIONS ///////////////////////////////////////////////////
// TUNEIN WRAPPER FUNCTIONS ///////////////////////////////////////////////////
// TUNEIN WRAPPER FUNCTIONS ///////////////////////////////////////////////////

function _playPause() {
  __DEBUG('_playPause');
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_PlayPause", true, true, {});
  document.dispatchEvent(evt);
}

function _playRadio(radio) {
  __DEBUG('_playRadio', radio);
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_PlayRadio", true, true, radio);
  document.dispatchEvent(evt);
}

function _requestAuthorizationInfo() {
  __DEBUG('_requestAuthorizationInfo');
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_GetInfo", true, true, {});
  document.dispatchEvent(evt);
}

// CHROME LISTENERS ///////////////////////////////////////////////////
// CHROME LISTENERS ///////////////////////////////////////////////////
// CHROME LISTENERS ///////////////////////////////////////////////////
// CHROME LISTENERS ///////////////////////////////////////////////////
// CHROME LISTENERS ///////////////////////////////////////////////////


// Listener to Background Events
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('LISTEN', request);
    if (isLoggedIn()) {
      if (request.from == 'Options' && request.key == 'Shuffle') {
        // radio_shuffle = request.value.newValue;
      } else if (request.command) {
        if (request.command == 'NextRadio') {
          nextRadio();
        } else if (request.command == 'PlayPause') {
          playPause();
        }
      }
    } else {
      _sendMessageToBackgroud(error_request);
    }
});
