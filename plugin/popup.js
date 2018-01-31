document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#playPauseButton').addEventListener('click', sendPlayPause);
  document.querySelector('#nextRadioButton').addEventListener('click', sendNextRadio);

  // Update Error Text
  chrome.storage.local.get('Error', function(result){
    if(result.Error) {
      document.getElementById('error').style.display      = 'block';
      document.getElementById('controller').style.display = 'none';
      document.getElementById('error_txt').innerHTML = result.Error.error_message;
    } else {
      document.getElementById('error').style.display      = 'none';
      document.getElementById('controller').style.display = 'block';    
    }
  });
});


//////////////////////ACTION FUNCTIONS
function sendPlayPause() {
  _sendMessageToBackgroud({command: "PlayPause"});
}

function sendNextRadio() {
  _sendMessageToBackgroud({command: "NextRadio"});
}

//////////////////////HELPER FUNCTIONS
function _sendMessageToBackgroud(request, callback) {
  request.from = 'PopUp';
  chrome.extension.sendMessage(request, callback);
}
