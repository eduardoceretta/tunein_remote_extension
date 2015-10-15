console.log('Loaded IN Page Content Script.');
_InitControllListeners();
_InitTuneInListeners();

var TIR_context = {
  muted_volume : 100
};

function _InitControllListeners() {
  document.addEventListener('TIR_PlayPause', function (e) {
    var data = e.detail;
    TIR_PlayPause(data);
  });

  document.addEventListener('TIR_PlayRadio', function (e) {
    var data = e.detail;
    TIR_PlayRadio(data);
  });

  document.addEventListener('TIR_ToggleMuteVolume', function (e) {
    var data = e.detail;
    TIR_ToggleMuteVolume(data);
  });
}

function _InitTuneInListeners() {
  Backbone.listenTo(TuneIn.events, Events.Tuner.Play,
    function(a){_SendEventToExtension('Tunner.Play');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.Pause,
    function(a){_SendEventToExtension('Tunner.Pause');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.Stop,
    function(a){_SendEventToExtension('Tunner.Stop');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.StreamsExhausted,
    function(a){_SendEventToExtension('Tunner.StreamsExhausted');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.AttemptTunable,
    function(a){_SendEventToExtension('Tunner.AttemptTunable');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.PlayIssuedToMediaPlayer,
    function(a){_SendEventToExtension('Tunner.PlayIssuedToMediaPlayer');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.PauseIssuedToMediaPlayer,
    function(a){_SendEventToExtension('Tunner.PauseIssuedToMediaPlayer');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.StopIssuedToMediaPlayer,
    function(a){_SendEventToExtension('Tunner.StopIssuedToMediaPlayer');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.Ready,
    function(a){_SendEventToExtension('Tunner.Ready');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.VolumeClicked,
    function(a){_SendEventToExtension('Tunner.VolumeClicked');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.VolumeChanged,
    function(a){_SendEventToExtension('Tunner.VolumeChanged');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.ScrubberPositionChanged,
    function(a){_SendEventToExtension('Tunner.ScrubberPositionChanged');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.TryNextTunable,
    function(a){_SendEventToExtension('Tunner.TryNextTunable');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.PlayerInitialized,
    function(a){_SendEventToExtension('Tunner.PlayerInitialized');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.PlayStateChanged,
    function(a){_SendEventToExtension('Tunner.PlayStateChanged');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.ScrubberReset,
    function(a){_SendEventToExtension('Tunner.ScrubberReset');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.MediaTitleChanged,
    function(a){_SendEventToExtension('Tunner.MediaTitleChanged');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.LogListeningReport,
    function(a){_SendEventToExtension('Tunner.LogListeningReport');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.SubscriptionRequiredContentTried,
    function(a){_SendEventToExtension('Tunner.SubscriptionRequiredContentTried');});
}

function _SendEventToExtension(e) {
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_TuneInEvent", true, true, {
    eventName: e
    ,volume: TuneIn.app.volume()
    ,playState: TuneIn.app.getPlayState()
    // ,nowPlaying: TuneIn.app.getNowPlaying()
  });
  document.dispatchEvent(evt);
}


// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
function TIR_PlayPause(data) {
  console.log("TIR_PlayPause", data);
  if (TuneIn.app.getPlayState() == "playing") {
    TuneIn.events.trigger(Events.Tuner.Pause);
  } else {
    TuneIn.events.trigger(Events.Tuner.Play);
  }
}

function TIR_PlayRadio(data) {
  console.log("TIR_PlayRadio", data);
  var streamId = data.streamId || 0;
  var stationId = data.stationId;
  if (stationId) {
    TuneIn.events.trigger(
      Events.Broadcast.Tune,
      {
        streamId: streamId,
        stationId: stationId,
        tuneType: TuneIn.tuneTypes.station,
        ignoreLinkedStations: true
      }
    );
  } else {
    console.log('TIR_PlayRadio: Invalid stationId' + data);
  }
}


function TIR_ToggleMuteVolume(data) {
  console.log("TIR_ToggleMuteVolume", data);
  var volume = TuneIn.app.volume();
  if (volume > 0) {
    TIR_context.muted_volume = volume;
    TuneIn.events.trigger(Events.Tuner.VolumeChanged, 0);
  } else if(volume == 0) {
    TuneIn.events.trigger(Events.Tuner.VolumeChanged, TIR_context.muted_volume);
  } else {
    console.log('TIR_ToggleMuteVolume: Invalid volume', volume, data);
  }
}

