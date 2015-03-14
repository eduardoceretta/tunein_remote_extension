window.addEventListener('load', function() {
  // Update Value
  chrome.storage.sync.get('Shuffle', function(result){
    options.shuffle.checked = result.Shuffle;
  });
  // Register On Change Event 
  options.shuffle.onchange = function() {
    chrome.storage.sync.set({'Shuffle': options.shuffle.checked});
  };
});

// Listens to Background Events
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.from == 'Options' && request.key == 'Shuffle') {
       options.shuffle.checked = request.value;
    }
});

