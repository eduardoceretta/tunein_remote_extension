var LISTENER_MAX = 60;

var listener_id = null;
var listener_count = 0;
var listener_last_state = null;
var connection_port;

var radio_shuffle = true;
var radio_index = 0;
// Update All Options
_updateOptions();

function _goBackToUserProfile() {
  if (document.URL.search(/tunein.com\/user/i) < 0) {
    $('#userNav .my-profile')[0].click();
  }
}

function _getRadioList() {
  var radio_list = [];
  $('#favoritePane .clearfix').each( function(index, elem) {
      radio_list.push({
      title : elem.title,
    });
  });
  return radio_list;
}

function _stopListener() {
  window.clearInterval(listener_id);
  listener_id = null;
  listener_count = 0;
  listener_last_state = null;
}

function _listenToStateChange(message_callback) {
  if(!connection_port)
    connection_port = chrome.runtime.connect({name: "Content"});

  if (listener_id) {
    _stopListener();
  } 
  listener_id = window.setInterval( function() {   
    _checkState(function(m) {connection_port.postMessage(m);});
  },1000);

}

function _checkState(callback) {
  var cur_state = $('#tuner').attr('class');
  ++listener_count;

  if( cur_state == 'playing' ||
      cur_state == 'stopped' ||
      cur_state == 'idle'    ||
      listener_count > LISTENER_MAX ) {
    _stopListener();
  } else if (cur_state == 'buffering') {
    // console.log('Will Listen again!', cur_state);
  } else {
    // console.log('Will Listen again!', cur_state);
  }

  if (cur_state != listener_last_state){
    callback({state : cur_state});
    listener_last_state = cur_state;
  }
}

function _updateOptions() {
  chrome.storage.sync.get('Shuffle', function(result){
    radio_shuffle = result;
  });
}

// Go to NextRadio
function nextRadio() {
  var radios = _getRadioList();
  // console.log('NextRadio');
  if(radios.length > 0) {
    if (radio_shuffle)
      radio_index = Math.floor(Math.random() * radios.length);
    else 
      radio_index = (radio_index + 1) % radios.length;
    var radio = radios[radio_index];
    // console.log('  Play ' + radio.title, radio_index , radios.length);
    $($('.play-button',$('#favoritePane .clearfix')[radio_index])[0])[0].click();
    _goBackToUserProfile();
  }
}


// Play/Pause current Radio
function playPause() {
  // console.log('Play/Pause');
  $('#tuner .playbutton-cont').trigger('click');
  _goBackToUserProfile();
}

// Listener to Background Events
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.from == 'Options' && request.key == 'Shuffle') {
      radio_shuffle = request.value;
    } else if (request.command) {
      if (request.command == 'NextRadio') {
        nextRadio();
        _listenToStateChange(sendResponse);
        _updateOptions();
      } else if (request.command == 'PlayPause') {
        playPause();
        _listenToStateChange(sendResponse);
        _updateOptions();
      }
    }
});
