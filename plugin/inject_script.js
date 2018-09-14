/////////////////Variables
var TIR_context = {};

var player_status_checker_timer = null;
var player_status_checker_counter = 0;

function __INFO(...args) {
  console.log('INJECT:',args);
}
function __DEBUG(...args) {
  console.log('INJECT:',args);
}
/////////////////START
__INFO('TuneIn Remote Plugin Loaded IN Page Content Script.');
InitGATracking();
InitContentListeners();
FetchTuneInInfo();
InitTimers();

// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////
// MAIN FUNCTIONS /////////////////////////////////////////////////

function InitContentListeners() {
  document.addEventListener('TIR_PlayPause', function (e) {
    PlayPause();
  });

  document.addEventListener('TIR_NextRadio', function (e) {
    NextRadio();
  });
}

function InitGATracking() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//ssl.google-analytics.com/analytics.js','ga');
  // })(window,document,'script','//ssl.google-analytics.com/analytics_debug.js','ga');

  var _AnalyticsCode = 'UA-120177315-1';
  ga('create', _AnalyticsCode, 'auto', 'TIR');
  ga('TIR.send', 'pageview');
  ga(function(tracker) {
    var trackers = ga.getAll();
    for (i=0;i<trackers.length;++i) {
      var tracker = trackers[i];
      if(tracker.get('name') == 'TIR') {
        __DEBUG('TIR GA Tracking loaded!');
      }
    }
  });
}

function FetchTuneInInfo() {
  _FetchTuneInUserSerial();
}

function InitTimers() {
  player_status_checker_timer = setInterval(_PlayerStatusChecker, 1000);
}

// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
function PlayPause() {
  ga('TIR.send', 'event', 'Command', 'PlayPause');
  __INFO("PlayPause");
  button = _GetPlayerButton();
  if(button != null) {
    button.click();
    InitTimers();
  }
}

function NextRadio() {
  ga('TIR.send', 'event', 'Command', 'NextRadio');
  __INFO("NextRadio");

  var radios = TIR_context['radio_list'];
  if(radios.length > 0) {
    var radio_index = Math.floor(Math.random() * radios.length);
    var radio = radios[radio_index];
    __DEBUG('  _nextRadio:Play ' + radio.title, radio_index , radios.length);
    ga('TIR.send', 'event', 'Data', 'RadioRandomPick', 'Index', radio_index);
    window.location.replace("https://tunein.com/radio/" + radio.GuideId);
  }
}

// HELPER FUNCTIONS /////////////////////////////////////////////////
// HELPER FUNCTIONS /////////////////////////////////////////////////
// HELPER FUNCTIONS /////////////////////////////////////////////////
// HELPER FUNCTIONS /////////////////////////////////////////////////
// HELPER FUNCTIONS /////////////////////////////////////////////////

function _FetchTuneInUserSerial(){
  url = '.';
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.withCredentials = true;
  xhr.onload = function () {
    var tuneInUserSerial = /tuneInUserSerial":"([\w-]+)/g.exec(xhr.responseText)[1];
    __DEBUG('Got UserSerial:' + tuneInUserSerial);
    TIR_context['tuneInUserSerial'] = tuneInUserSerial;
    _FetchFavoritesList(tuneInUserSerial);
  };
  xhr.send();
}

function _FetchFavoritesList(tuneInUserSerial){
  var url = 'https://api.tunein.com/profiles/me/follows?'
    +'folderId=f1&filter=favorites'
    // +'&formats=mp3,aac,ogg,flash,html' HTML means popup so no html
    +'&formats=mp3,aac,ogg,flash'
    +'&partnerId=RadioTime&version=2.09&itemUrlScheme=secure&build=2.9.0&reqAttempt=1'
    +'&serial=' + tuneInUserSerial //3fc0e213-5f4d-4ee6-9c2a-86dd92e169a5
  ;
  _FetchFavoritesPage(url,[]);
}

function _FetchFavoritesPage(url, fav_items) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.withCredentials = true;
  xhr.onload = function () {
    favorites_obj = JSON.parse(xhr.responseText);
    fav_items = fav_items.concat(favorites_obj["Items"]);
    fav_pagination = favorites_obj["Paging"];
    if(fav_pagination['Next']) {
      _FetchFavoritesPage(fav_pagination['Next'], fav_items);
    } else {
      _ParseFavoriteItems(fav_items);
    }
  };
  xhr.send();
}

function _ParseFavoriteItems(fav_items){
  var radio_list=[];
  for (i=0;i<fav_items.length;++i) {

    v = fav_items[i];
    canPlay  = v['Actions']['Play']['CanPlay'];
    if (canPlay) {
      radio_list.push({
        title : v['Title'],
        GuideId: v['GuideId']
      });
    }
  }
  TIR_context['radio_list'] = radio_list;

  ga('TIR.send', 'event', 'Data', 'FetchFavorites', 'NumItems', radio_list.length);
  __INFO('Got Radios: ' +  radio_list.length);
}

function _GetPlayerStatus() {
  var status_list = ["idle", "loaded", "playing", "preroll", "paused", "stopped", "connecting", "failed", "htmlStreamLoaded"];
  for(var i=0;i<status_list.length;++i) {
    if (document.getElementsByClassName(status_list[i]).length > 0) {
      return status_list[i];
    }
  }
  return null;
}

function _GetPlayerButton() {
  var status_list = ["playing","paused", "stopped"];
  for(var i=0;i<status_list.length;++i) {
    if (document.getElementsByClassName(status_list[i]).length > 0) {
      return document.getElementsByClassName(status_list[i])[0];
    }
  }
  return null;
}

function _PlayerStatusChecker() {
  player_status_checker_counter++;
  var p_status = _GetPlayerStatus();

  if (p_status != null) {
    __INFO('Player Status: ' +  p_status);
    ga('TIR.send', 'event', 'Radio', 'Status', p_status);
  }

  if (p_status == 'playing' && player_status_checker_timer) {
    window.clearInterval(player_status_checker_timer);
  } else if (p_status == 'stopped' && player_status_checker_timer) {
    window.clearInterval(player_status_checker_timer);
  } else if (p_status == 'failed') {
    NextRadio();
    window.clearInterval(player_status_checker_timer);
  }

  // After a minute don't check the status so often.
  if (player_status_checker_counter == 60) {
    window.clearInterval(player_status_checker_timer);
    player_status_checker_timer = setInterval(_PlayerStatusChecker, 5000);

  // If it still doesn't help just give up
  } else if (player_status_checker_counter > 80) {
    __INFO('stop checking for player status');
    window.clearInterval(player_status_checker_timer);
  }
}
