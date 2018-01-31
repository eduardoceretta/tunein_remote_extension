 console.log('Loaded IN Page Content Script.');
_InitControllListeners();
_InitTuneInScript();

var TIR_context = {
};

function _InitControllListeners() {
  document.addEventListener('TIR_PlayPause', function (e) {
    TIR_PlayPause();
  });

  document.addEventListener('TIR_PlayRadio', function (e) {
    var data = e.detail;
    TIR_PlayRadio(data);
  });

  document.addEventListener('TIR_GetInfo', function (e) {
    TIR_GetInfo();
  });
}

function _InitTuneInScript() {
  console.log('_InitTuneInScript');
  _FetchTuneInUserSerial();
}

function _FetchTuneInUserSerial(){
  url = '.';
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.withCredentials = true;
  xhr.onload = function () {
    var tuneInUserSerial = /tuneInUserSerial":"([\w-]+)/g.exec(xhr.responseText)[1];
    console.log('Got UserSerial:' + tuneInUserSerial);
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
  console.log('FetchingFavoritesPage');
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
  console.log('_ParseFavoriteItems');
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
  _SendUpdateRadiosEventToExtension(radio_list)
}

function _SendUpdateRadiosEventToExtension(radio_list) {
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_TuneInEvent", true, true, {
    eventName: 'UpdateRadioList',
    radioList: radio_list
    // ,userAuthenticated: TuneIn.Helpers.userAuthenticated()
  });
  document.dispatchEvent(evt);
}

function _SendEventToExtension(e) {
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_TuneInEvent", true, true, {
    eventName: e
    // ,playState: TuneIn.app.getPlayState()
    // ,nowPlaying: TuneIn.app.getNowPlaying()
    // ,userAuthenticated: TuneIn.Helpers.userAuthenticated()
  });
  document.dispatchEvent(evt);
}


// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
function TIR_PlayPause() {
  console.log("TIR_PlayPause");
  document.getElementById('playerActionButton').click();
}

function TIR_PlayRadio(data) {
  console.log("TIR_PlayRadio", data);
  if (data.GuideId) {
    window.location.replace("https://tunein.com/radio/" + data.GuideId);
  }
}

function TIR_GetInfo() {
  console.log("TIR_GetInfo");
  _SendEventToExtension('GetInfoReply');
}

