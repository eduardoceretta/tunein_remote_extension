//////////////////////MAIN
//////////////////////MAIN
//////////////////////MAIN
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#playPauseButton').addEventListener(
      'click', sendPlayPause);
  document.querySelector('#nextRadioButton').addEventListener(
      'click', sendNextRadio);

  // Update Shuffle State
  chrome.storage.sync.get('Shuffle', function(result){
    document.querySelector('#shuffle').checked = result.Shuffle;
  });

  // Register Shuffle OnChange Listener
  document.querySelector('#shuffle').onchange = function() {
    chrome.storage.sync.set({'Shuffle': document.querySelector('#shuffle').checked});
  };
});


//////////////////////ACTION FUNCTIONS
//////////////////////ACTION FUNCTIONS
//////////////////////ACTION FUNCTIONS
function sendPlayPause() {
  _sendMessageToBackgroud({command: "PlayPause"});
}

function sendNextRadio() {
  _sendMessageToBackgroud({command: "NextRadio"});
}


//////////////////////HELPER FUNCTIONS
//////////////////////HELPER FUNCTIONS
//////////////////////HELPER FUNCTIONS
function _sendMessageToBackgroud(request, callback) {
  request.from = 'PopUp';
  chrome.extension.sendMessage(request, callback);
}
