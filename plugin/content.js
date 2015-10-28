var login_observer = null;
var url_observer = null;
var state_observer = null;
var connection_port;

var radio_shuffle = true;
var radio_index = 0;

var error_request = {error : 'NotLoggedIn', error_message : 'Please Log In!', state : 'error'};

var context = {
  radio_list : [],
};

/////////////////START
console.log('TuneIn Remote Plugin is controlling this tab now.');
InitInjectScript();
UpdateRadioList();
UpdateOptions();
$( document ).ready(function() {
  GetInitialInfo();
});

function __DEBUG() {
  // console.log(arguments);
}

// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////

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

function UpdateRadioList() {
  __DEBUG('UpdateRadioList');
  $.ajax({
    dataType: "json",
    url: '/myradio/presets/folders/1/',
    success: _processRadioListUpdate
  });
}

function UpdateOptions() {
  __DEBUG('UpdateOptions');
  chrome.storage.sync.get('Shuffle', function(result){
    radio_shuffle = result.Shuffle;
    __DEBUG('  _updateOptions: Shuffle', result,radio_shuffle);
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

// Toggle Mute Volume on/off
function toggleMuteVolume() {
  __DEBUG('toggleMuteVolume');
  _toggleMuteVolume();
}

function volumeUp() {
  __DEBUG('volumeUp');
  _volumeUp();
}

function volumeDown() {
  __DEBUG('volumeDown');
  _volumeDown();
}

function isLoggedIn() {
  __DEBUG('isLoggedIn');
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
function _processRadioListUpdate(result) {
  __DEBUG('_processRadioListUpdate', result);
  context.radio_list = [];
  for (i = 0; i < result.length; ++i) {
    context.radio_list.push({
      stationId : result[i].stationId
      ,title : result[i].title
      ,listenStyle : result[i].listenStyle
      ,listenType : result[i].listenType
    });
  }
}

function _processTuneInEvent(data) {
  __DEBUG('_processTuneInEvent', data);
  // console.log('TIR_TuneInEvent', data);

  if(data.userAuthenticated != undefined) {
    context.userAuthenticated = data.userAuthenticated;
  }

  if(context.userAuthenticated == true) {
    _sendMessageToBackgroud({state : data.playState});

    if( data.eventName === "Broadcast.TuneFailed"    ||
        data.eventName === "Tunner.StreamsExhausted" ||
        (data.eventName === "Tunner.PlayStateChanged" && data.playState === "unplayable")
      ) {
      _nextRadio();
    }
  }else {
    _sendMessageToBackgroud(error_request);
  }
}

function _nextRadio() {
  __DEBUG('_nextRadio');
  var radios = context.radio_list;
  if(radios.length > 0) {
    __DEBUG('  _nextRadio:Shuffle_on? ', radio_shuffle);
    if (radio_shuffle)
      radio_index = Math.floor(Math.random() * radios.length);
    else
      radio_index = (radio_index + 1) % radios.length;
    var radio = radios[radio_index];
    __DEBUG('  _nextRadio:Play ' + radio.title, radio_index , radios.length);
    _playRadio(radio);
  }
  UpdateRadioList();
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

function _toggleMuteVolume() {
  __DEBUG('_toggleMuteVolume');
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_ToggleMuteVolume", true, true, {});
  document.dispatchEvent(evt);
}

function _volumeUp() {
  __DEBUG('_volumeUp');
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_VolumeUp", true, true, {});
  document.dispatchEvent(evt);
}

function _volumeDown() {
  __DEBUG('_volumeDown');
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_VolumeDown", true, true, {});
  document.dispatchEvent(evt);
}

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
    // console.log('LISTEN', request);
    if (isLoggedIn()) {
      if (request.from == 'Options' && request.key == 'Shuffle') {
        radio_shuffle = request.value.newValue;
      } else if (request.command) {
        if (request.command == 'NextRadio') {
          nextRadio();
        } else if (request.command == 'PlayPause') {
          playPause();
        } else if (request.command == 'ToggleMute') {
          toggleMuteVolume();
        } else if (request.command == 'VolumeUp') {
          volumeUp();
        } else if (request.command == 'VolumeDown') {
          volumeDown();
        }
      }
    } else {
      _sendMessageToBackgroud(error_request);
    }
});
