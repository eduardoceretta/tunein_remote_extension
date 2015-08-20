var login_observer = null;
var url_observer = null;
var state_observer = null;
var connection_port;

var radio_shuffle = true;
var radio_index = 0;

var error_request = {error : 'NotLoggedIn', error_message : 'Please Log In!', state : 'error'};

/////////////////START
console.log('TuneIn Remote Plugin is controlling this tab now.');
// Update All Options
_updateOptions();
// Check for Log in
if (!_isLoggedIn()) {
  _sendMessageToBackgroud(error_request);
  _observeLoginChange(function(){_sendMessageToBackgroud({state : 'idle'});});
}

function __DEBUG() {
  // console.log(arguments);
}

function _isLoggedIn() {
  __DEBUG('_isLoggedIn', ($('#userNav .my-profile').length > 0));
  return $('#userNav .my-profile').length > 0;
}

function _isInUserProfile() {
  __DEBUG('_isInUserProfile', (document.URL.search(/tunein.com\/user/i) >= 0 && $('#favoritePane .clearfix').length > 0));
  return document.URL.search(/tunein.com\/user/i) >= 0 && $('#favoritePane .clearfix').length > 0;
}

function _goBackToUserProfile() {
  __DEBUG('_goBackToUserProfile');
  if (!_isInUserProfile()) {
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
  __DEBUG('_getRadioList', radio_list);
  return radio_list;
}


function _observeLoginChange(callback) {
  var context = { callback : callback };
  if (login_observer != null) {
    login_observer.reset(context);
  } else {
    login_observer = new ConditionObserver(_checkLogin, context, {retry_max : 60 * 60 * 1000/10000, interval : 10000});  // One hour every 10 seconds
  }
  login_observer.observe();
}

function _checkLogin(context) {
  if (_isLoggedIn()){
    if (context.callback)
      context.callback();
    return true;
  }
  return false;
}

function _observeUrlChange(callback) {
  var context = {callback : callback };
  if (url_observer != null) {
    url_observer.reset(context);
  } else {
    url_observer = new ConditionObserver(_checkUrl, context, {retry_max : 60 * 1000/300, interval : 300}); 
  }
  url_observer.observe();
}

function _checkUrl(context) {
  if (_isInUserProfile()){
    if (context.callback)
      context.callback();
    __DEBUG('_checkUrl', true);
    return true;
  }
  __DEBUG('_checkUrl', false);
  return false;
}


function _observeStateChange(message_callback) {
  if(!connection_port)
    connection_port = chrome.runtime.connect({name: "Content"});
  var context = {last_state : null, callback : function(m) {connection_port.postMessage(m);} };
  if (state_observer != null) {
    state_observer.reset(context);
  } else {
    state_observer = new ConditionObserver(_checkState, context, {retry_max : 60 * 1000/500, interval : 500, no_wait : true}); 
  }
  state_observer.observe();
}

function _checkState(context) {
  var cur_state = $('#tuner').attr('class');

  if (cur_state != context.last_state){
    if (context.callback) context.callback({state : cur_state});
    context.last_state = cur_state;
  }

  if( cur_state == 'playing' ||
      cur_state == 'stopped') {
    __DEBUG('_checkState', context, cur_state, true);
    return true;
  } else if (cur_state == 'buffering') {
    // console.log('Will Listen again!', cur_state);
  } else if (cur_state == 'error' || cur_state == 'idle') {
    __DEBUG('_checkState', context, cur_state, false);
    nextRadio();
  }
  __DEBUG('_checkState', context, cur_state, false);
  return false;
}

function _playPayse() {
  __DEBUG('_playPayse');
  $('#tuner .playbutton-cont').trigger('click');
  _goBackToUserProfile();
}

function _nextRadio() {
  __DEBUG('_nextRadio');
  var radios = _getRadioList();
  if(radios.length > 0) {
    __DEBUG('  _nextRadio:Shuffle_on? ', radio_shuffle);
    if (radio_shuffle)
      radio_index = Math.floor(Math.random() * radios.length);
    else
      radio_index = (radio_index + 1) % radios.length;
    var radio = radios[radio_index];
    __DEBUG('  _nextRadio:Play ' + radio.title, radio_index , radios.length);
    $($('.play-button',$('#favoritePane .clearfix')[radio_index])[0])[0].click();
    _goBackToUserProfile();
  }
}

function _updateOptions() {
  __DEBUG('_updateOptions');
  chrome.storage.sync.get('Shuffle', function(result){
    radio_shuffle = result;
    __DEBUG('  _updateOptions: Shuffle', result,radio_shuffle);
  });
}

function _sendMessageToBackgroud(request, callback) {
  request.from = 'Content';
  chrome.extension.sendMessage(request, callback);
}


// Go to NextRadio
function nextRadio(response_callback) {
  console.log('NextRadio');
  if (!_isInUserProfile()) {
    _goBackToUserProfile();
    _observeUrlChange(function(){
      _nextRadio();
      _observeStateChange(response_callback);
    });
  } else {
    _nextRadio();
    _observeStateChange(response_callback);
  }
}

// Play/Pause current Radio
function playPause(response_callback) {
  console.log('Play/Pause');
  _playPayse();
  _observeStateChange(response_callback);
}

// Listener to Background Events
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (_isLoggedIn()) {
      if (request.from == 'Options' && request.key == 'Shuffle') {
        radio_shuffle = request.value;
      } else if (request.command) {
        if (request.command == 'NextRadio') {
          nextRadio(sendResponse);
        } else if (request.command == 'PlayPause') {
          playPause(sendResponse);
        }
        _updateOptions();
      }
    } else {
      sendResponse(error_request);
    }
});
