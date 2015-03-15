var ConditionObserver = ( function(window) {
  function ConditionObserver(callback, context, options) {
    var id = null;
    var retry_count = 0;

    var no_wait   = options != null && options.no_wait != null   ? options.no_wait   : false ;
    var retry_max = options != null && options.retry_max != null ? options.retry_max : 60 ;
    var interval  = options != null && options.interval  != null ? options.interval  : 1000;

    var cb_check   = callback != null ? callback : null;
    var cb_context = context  != null ? context  : {};

    function _stopObserver() {
      window.clearInterval(id);
      id = null;
      retry_count = 0;
    };

    this.reset = function reset(context) {
      _stopObserver();
      cb_context = context != null ? context : {};
    }

    this.observe = function observe() {
      if(no_wait && cb_check != null) 
        cb_check(cb_context);
      id = window.setInterval( function () {
        var check = cb_check != null ? cb_check(cb_context) : false;
        if ( ++retry_count > retry_max || check ) {
          _stopObserver();
        }
      }, interval);
    };
  }
 
  return ConditionObserver;
  
} )(window);

// var A = 0;
// var CALLMEMAYBE = function (c) { console.log('ping', c);};
// var stateObserver = new ConditionObserver(function(context) {
//   console.log("MY CHECK", context);
//   var cur_state = A;

//   if (cur_state != context.last_state){
//     CALLMEMAYBE(cur_state);
//     context.last_state = cur_state;
//   }
  
//   if( cur_state == '42') {
//     return true;
//   }

//   return false;
// }, {last_state : null}, {retry_max : 5});

// stateObserver.observe();
