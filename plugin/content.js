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
_updateRadioList();

function __DEBUG() {
  console.log(arguments);
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

function _playPayse() {
  __DEBUG('_playPayse');
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_PlayPause", true, true, {});
  document.dispatchEvent(evt);
}

function _playRadio(radio) {
  __DEBUG('_playRadio');
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_PlayRadio", true, true, radio);
  document.dispatchEvent(evt);
}

// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////
// HELPER FUNCTIONS ///////////////////////////////////////////////////

function InitInjectScript() {
  var s = document.createElement('script');
  s.src = chrome.extension.getURL('inject_script.js');
  s.onload = function() {
      this.parentNode.removeChild(this);
  };
  (document.head||document.documentElement).appendChild(s);

  document.addEventListener('TIR_TuneInEvent', function (e) {
    var data = e.detail;
    console.log('TIR_TuneInEvent', data);
  });
}

function _updateRadioList() {
  $.ajax({
    dataType: "json",
    url: '/myradio/presets/folders/1/',
    success: function (result) {
      console.log(result);
      console.log(context);
      context.radio_list = [];
      for (i = 0; i < result.length; ++i) {
        context.radio_list.push({
          stationId : result[i].stationId
          ,title : result[i].title
          ,listenStyle : result[i].listenStyle
          ,listenType : result[i].listenType
          ,debug : result[i]
        });
      }
      console.log(context);
    }
  });
}



// function _checkState(context) {
//   var cur_state = $('#tuner').attr('class');

//   if (cur_state != context.last_state){
//     if (context.callback) context.callback({state : cur_state});
//     context.last_state = cur_state;
//   }

//   if( cur_state == 'playing' ||
//       cur_state == 'stopped') {
//     __DEBUG('_checkState', context, cur_state, true);
//     return true;
//   } else if (cur_state == 'buffering') {
//     // console.log('Will Listen again!', cur_state);
//   } else if (cur_state == 'error' ||
//              cur_state == 'idle'  ||
//              cur_state == 'notavailable' ||
//              cur_state == 'external') {
//     __DEBUG('_checkState', context, cur_state, false);
//     // nextRadio();
//   }
//   __DEBUG('_checkState', context, cur_state, false);
//   return false;
// }














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
  _updateRadioList();
}

function _updateOptions() {
  __DEBUG('_updateOptions');
  chrome.storage.sync.get('Shuffle', function(result){
    radio_shuffle = result;
    __DEBUG('  _updateOptions: Shuffle', result,radio_shuffle);
  });
}

// function _sendMessageToBackgroud(request, callback) {
//   request.from = 'Content';
//   chrome.extension.sendMessage(request, callback);
// }


// Go to NextRadio
function nextRadio(response_callback) {
  console.log('NextRadio');
  _nextRadio();
}

// Play/Pause current Radio
function playPause(response_callback) {
  console.log('Play/Pause');
  _playPayse();
}

// Toggle Mute Volume on/off
function toggleMuteVolume(response_callback) {
  console.log('ToggleMuteVolume');
  _toggleMuteVolume();
}

// Listener to Background Events
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    // if (_isLoggedIn()) {
      if (request.from == 'Options' && request.key == 'Shuffle') {
        radio_shuffle = request.value;
      } else if (request.command) {
        if (request.command == 'NextRadio') {
          nextRadio(sendResponse);
        } else if (request.command == 'PlayPause') {
          playPause(sendResponse);
        } else if (request.command == 'ToggleMuteVolume') {
          toggleMuteVolume(sendResponse);
        }
        // _updateOptions();
      }
    // } else {
    //   sendResponse(error_request);
    // }
});
