// console.log('Loaded IN Page Content Script.');
_InitControllListeners();
_InitTuneInListeners();

var TIR_context = {
  muted_volume : 100,
  volume_increase: 5,
  volume_decrease: 5
};

function _InitControllListeners() {
  document.addEventListener('TIR_PlayPause', function (e) {
    TIR_PlayPause();
  });

  document.addEventListener('TIR_PlayRadio', function (e) {
    var data = e.detail;
    TIR_PlayRadio(data);
  });

  document.addEventListener('TIR_ToggleMuteVolume', function (e) {
    TIR_ToggleMuteVolume();
  });

  document.addEventListener('TIR_VolumeUp', function (e) {
    TIR_VolumeUp();
  });

  document.addEventListener('TIR_VolumeDown', function (e) {
    TIR_VolumeDown();
  });

  document.addEventListener('TIR_GetInfo', function (e) {
    TIR_GetInfo();
  });
}

function _InitTuneInListeners() {
  Backbone.listenTo(TuneIn.events, Events.Tuner.PlayerInitialized,
    function(a){_SendEventToExtension('Tunner.PlayerInitialized');});
  Backbone.listenTo(TuneIn.events, Events.Broadcast.TuneFailed,
    function(a){_SendEventToExtension('Broadcast.TuneFailed');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.StreamsExhausted,
    function(a){_SendEventToExtension('Tunner.StreamsExhausted');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.VolumeChanged,
    function(a){_SendEventToExtension('Tunner.VolumeChanged');});
  Backbone.listenTo(TuneIn.events, Events.Tuner.PlayStateChanged,
    function(a){_SendEventToExtension('Tunner.PlayStateChanged');});
  Backbone.listenTo(TuneIn.events, Events.Auth.Success,
    function(a){_SendEventToExtension('Auth.Success');});
  Backbone.listenTo(TuneIn.events, Events.Auth.Logout,
    function(a){_SendEventToExtension('Auth.Logout');});


  // Backbone.listenTo(TuneIn.events, Events.Tuner.Play,
  //   function(a){_SendEventToExtension('Tunner.Play');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.Pause,
  //   function(a){_SendEventToExtension('Tunner.Pause');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.Stop,
  //   function(a){_SendEventToExtension('Tunner.Stop');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.AttemptTunable,
  //   function(a){_SendEventToExtension('Tunner.AttemptTunable');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.PlayIssuedToMediaPlayer,
  //   function(a){_SendEventToExtension('Tunner.PlayIssuedToMediaPlayer');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.PauseIssuedToMediaPlayer,
  //   function(a){_SendEventToExtension('Tunner.PauseIssuedToMediaPlayer');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.StopIssuedToMediaPlayer,
  //   function(a){_SendEventToExtension('Tunner.StopIssuedToMediaPlayer');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.Ready,
  //   function(a){_SendEventToExtension('Tunner.Ready');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.VolumeClicked,
  //   function(a){_SendEventToExtension('Tunner.VolumeClicked');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.ScrubberPositionChanged,
  //   function(a){_SendEventToExtension('Tunner.ScrubberPositionChanged');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.TryNextTunable,
  //   function(a){_SendEventToExtension('Tunner.TryNextTunable');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.ScrubberReset,
  //   function(a){_SendEventToExtension('Tunner.ScrubberReset');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.MediaTitleChanged,
  //   function(a){_SendEventToExtension('Tunner.MediaTitleChanged');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.LogListeningReport,
  //   function(a){_SendEventToExtension('Tunner.LogListeningReport');});
  // Backbone.listenTo(TuneIn.events, Events.Tuner.SubscriptionRequiredContentTried,
  //   function(a){_SendEventToExtension('Tunner.SubscriptionRequiredContentTried');});


  // Backbone.listenTo(TuneIn.events, Events.Broadcast.Tune,
  //   function(a){_SendEventToExtension('Broadcast.Tune');});
  // Backbone.listenTo(TuneIn.events, Events.Broadcast.TuneRequested,
  //   function(a){_SendEventToExtension('Broadcast.TuneRequested');});
  // Backbone.listenTo(TuneIn.events, Events.Broadcast.TuneIfIdle,
  //   function(a){_SendEventToExtension('Broadcast.TuneIfIdle');});
  // Backbone.listenTo(TuneIn.events, Events.Broadcast.Reload,
  //   function(a){_SendEventToExtension('Broadcast.Reload');});
  // Backbone.listenTo(TuneIn.events, Events.Broadcast.TopicFinished,
  //   function(a){_SendEventToExtension('Broadcast.TopicFinished');});
  // Backbone.listenTo(TuneIn.events, Events.Broadcast.AudioClipFinished,
  //   function(a){_SendEventToExtension('Broadcast.AudioClipFinished');});
  // Backbone.listenTo(TuneIn.events, Events.Broadcast.TuneCompleted,
  //   function(a){_SendEventToExtension('Broadcast.TuneCompleted');});
  // Backbone.listenTo(TuneIn.events, Events.Broadcast.TuneReady,
  //   function(a){_SendEventToExtension('Broadcast.TuneReady');});
  // Backbone.listenTo(TuneIn.events, Events.Broadcast.NowPlayingChanged,
  //   function(a){_SendEventToExtension('Broadcast.NowPlayingChanged');});
  // Backbone.listenTo(TuneIn.events, Events.Broadcast.TunableStreamsRejected,
  //   function(a){_SendEventToExtension('Broadcast.TunableStreamsRejected');});
  // Backbone.listenTo(TuneIn.events, Events.Broadcast.UnplayableStream,
  //   function(a){_SendEventToExtension('Broadcast.UnplayableStream');});

  // Backbone.listenTo(TuneIn.events, Events.Echo.Started,
  //   function(a){_SendEventToExtension('Echo.Started');});
  // Backbone.listenTo(TuneIn.events, Events.Echo.Cancelled,
  //   function(a){_SendEventToExtension('Echo.Cancelled');});
  // Backbone.listenTo(TuneIn.events, Events.Echo.Submitted,
  //   function(a){_SendEventToExtension('Echo.Submitted');});
  // Backbone.listenTo(TuneIn.events, Events.Echo.Unecho,
  //   function(a){_SendEventToExtension('Echo.Unecho');});
  // Backbone.listenTo(TuneIn.events, Events.Echo.Deleted,
  //   function(a){_SendEventToExtension('Echo.Deleted');});
  // Backbone.listenTo(TuneIn.events, Events.Echo.Incremented,
  //   function(a){_SendEventToExtension('Echo.Incremented');});
  // Backbone.listenTo(TuneIn.events, Events.Echo.Decremented,
  //   function(a){_SendEventToExtension('Echo.Decremented');});

  // Backbone.listenTo(TuneIn.events, Events.App.MarkupChanged,
  //   function(a){_SendEventToExtension('App.MarkupChanged');});
  // Backbone.listenTo(TuneIn.events, Events.App.MarkupRequested,
  //   function(a){_SendEventToExtension('App.MarkupRequested');});
  // Backbone.listenTo(TuneIn.events, Events.App.MarkupReady,
  //   function(a){_SendEventToExtension('App.MarkupReady');});
  // Backbone.listenTo(TuneIn.events, Events.App.MarkupRequestFailed,
  //   function(a){_SendEventToExtension('App.MarkupRequestFailed');});
  // Backbone.listenTo(TuneIn.events, Events.App.RouteRequest,
  //   function(a){_SendEventToExtension('App.RouteRequest');});
  // Backbone.listenTo(TuneIn.events, Events.App.CloseModal,
  //   function(a){_SendEventToExtension('App.CloseModal');});
  // Backbone.listenTo(TuneIn.events, Events.App.OpenModal,
  //   function(a){_SendEventToExtension('App.OpenModal');});
  // Backbone.listenTo(TuneIn.events, Events.App.ShowIFrame,
  //   function(a){_SendEventToExtension('App.ShowIFrame');});
  // Backbone.listenTo(TuneIn.events, Events.App.PageChanged,
  //   function(a){_SendEventToExtension('App.PageChanged');});
  // Backbone.listenTo(TuneIn.events, Events.App.ExternalPlayerLaunched,
  //   function(a){_SendEventToExtension('App.ExternalPlayerLaunched');});
  // Backbone.listenTo(TuneIn.events, Events.App.BackgroundChange,
  //   function(a){_SendEventToExtension('App.BackgroundChange');});
  // Backbone.listenTo(TuneIn.events, Events.App.TransitionOutCompleted,
  //   function(a){_SendEventToExtension('App.TransitionOutCompleted');});
  // Backbone.listenTo(TuneIn.events, Events.App.GoogleApiLoaded,
  //   function(a){_SendEventToExtension('App.GoogleApiLoaded');});
  // Backbone.listenTo(TuneIn.events, Events.App.CustomRouteRequest,
  //   function(a){_SendEventToExtension('App.CustomRouteRequest');});
  // Backbone.listenTo(TuneIn.events, Events.App.FullScreenPageLoaded,
  //   function(a){_SendEventToExtension('App.FullScreenPageLoaded');});
  // Backbone.listenTo(TuneIn.events, Events.App.ConvertUser,
  //   function(a){_SendEventToExtension('App.ConvertUser');});

}

function _SendEventToExtension(e) {
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("TIR_TuneInEvent", true, true, {
    eventName: e
    ,volume: TuneIn.app.volume()
    ,playState: TuneIn.app.getPlayState()
    // ,nowPlaying: TuneIn.app.getNowPlaying()
    ,userAuthenticated: TuneIn.Helpers.userAuthenticated()
  });
  document.dispatchEvent(evt);
}


// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
// API /////////////////////////////////////////////////////////////
function TIR_PlayPause() {
  // console.log("TIR_PlayPause");
  if (TuneIn.app.getPlayState() == "playing") {
    TuneIn.events.trigger(Events.Tuner.Pause);
  } else {
    TuneIn.events.trigger(Events.Tuner.Play);
  }
}

function TIR_PlayRadio(data) {
  // console.log("TIR_PlayRadio", data);
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
    // console.log('TIR_PlayRadio: Invalid stationId' + data);
  }
}


function TIR_ToggleMuteVolume() {
  // console.log("TIR_ToggleMuteVolume");
  var volume = TuneIn.app.volume();
  if (volume > 0) {
    TIR_context.muted_volume = volume;
    TuneIn.events.trigger(Events.Tuner.VolumeChanged, 0);
  } else if(volume == 0) {
    TuneIn.events.trigger(Events.Tuner.VolumeChanged, TIR_context.muted_volume);
  } else {
    // console.log('TIR_ToggleMuteVolume: Invalid volume', volume);
  }
}


function TIR_VolumeUp() {
  // console.log("TIR_VolumeUp");
  var volume = TuneIn.app.volume();
  if (volume < 100) {
    TuneIn.events.trigger(Events.Tuner.VolumeChanged, Math.min(volume + TIR_context.volume_increase, 100));
  }
}


function TIR_VolumeDown() {
  // console.log("TIR_VolumeDown");
  var volume = TuneIn.app.volume();
  if (volume > 0) {
    TuneIn.events.trigger(Events.Tuner.VolumeChanged, Math.max(volume - TIR_context.volume_decrease, 0));
  }
}


function TIR_GetInfo() {
  // console.log("TIR_GetInfo");
  _SendEventToExtension('GetInfoReply');
}

