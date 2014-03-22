// create random clientId for MQTT server
var t = new Messaging.Client("hackerspace.jp", 1883, '_' + Math.random().toString(36).substr(2, 9));
var battery_option = new Object() ;
battery_option["to"] = 0 ;
battery_option["animation"] = 0 ;
battery_option["width"] = 100 ;
battery_option["height"] = 10 ;
battery_option["frm_bgc"] = "#333333" ;
var battery_progress = new html5jp.progress("roomba_battery", battery_option);
var android_battery_option = new Object();
android_battery_option["to"] = 0 ;
android_battery_option["animation"] = 0 ;
android_battery_option["width"] = 100 ;
android_battery_option["frm_bgc"] = "#333333" ;
var android_battery_progress = new html5jp.progress("android_battery", android_battery_option);

var usr = "";
var pwd = "";
var bmp = 0 ;
var lastUpdate = new Date().getTime() / 2;

function initVideoCanvas () {
    var canvas = gapi.hangout.layout.getVideoCanvas();
    canvas.setHeight(document.body.clientHeight);
    canvas.setVisible(true);
    //canvas.setPosition(0, 0);
};

window.onresize = function() {
    var canvas = gapi.hangout.layout.getVideoCanvas();
    canvas.setHeight(document.body.clientHeight);
    console.log("height:", document.body.clientHeight);
}

t.onConnectionLost = function(rc){
    var stateEl = document.getElementById('state');
    stateEl.style.color="#ff6666" ;
    stateEl.innerHTML = 'lost connection';
};
t.onConnect = function(rc){
    var stateEl = document.getElementById('state');
    stateEl.style.color="#66ff66" ;
    stateEl.innerHTML = 'connect';
};
t.onMessageArrived = function(msg) {
    var str = msg.payloadString ;
    str = str.trim() ;
    lastUpdate = new Date().getTime();
    console.log( "message-arrive: " + str ) ;
    if ( str.indexOf("bump") > -1 ){
        var buf = str.split(" ") ;
        if ( buf.length > 1 ){
	    bmp = parseInt( str.split(" ")[1] ) ;
	    if ( rc && bmp < 4) {
                rc.image_id = bmp ;
                rc._draw_roomba(rc._stickEl,rc.roomba[rc.image_id],rc.get_rotation(),rc.get_velocity()) ;
	    }
        }
    } else if ( str.indexOf("android_battery") > -1 ){
	var androidEl = document.getElementById('android_connect');
	androidEl.innerHTML = 'Android battery';
        androidEl.style.color="#000000" ;
	android_battery_option["frm_bgc"] = "#333333" ;
	android_battery_progress.set_val( str.split(" ")[1] ) ;
	android_battery_progress.draw() ;
    } else if ( str.indexOf("battery") > -1 ){
        var roombaEl = document.getElementById('roomba_connect');
	roombaEl.innerHTML = 'Roomba battery';
        roombaEl.style.color="#000000" ;
	battery_option["frm_bgc"] = "#333333" ;
	battery_progress.set_val( str.split(" ")[1] ) ;
	battery_progress.draw() ;
    } //else if ( str.indexOf("id") > -1 ){}
}

function connection_observer(){
    var stateEl = document.getElementById('state');
    stateEl.style.color =
        t._client.connected ? "#66ff66" : "#ff6666" ;
    stateEl.innerHTML =
        t._client.connected ? "connect" : "lost connection" ;
}

function my_connect(){
    usr = document.getElementById("usr").value ;
    pwd = document.getElementById("pwd").value ;
    try{
        if ( usr.length + pwd.length == 0  ) {
            t.connect({onSuccess: t.onConnect}) ;
        } else {
            t.connect({onSuccess: t.onConnect, userName: usr, password: pwd}) ;
        }
        if ( ! t._client.connected ) {
            var stateEl = document.getElementById('state');
            stateEl.style.color="#ff6666" ;
            stateEl.innerHTML = 'password missmatch';
        }
    } catch ( e ) {
        var stateEl = document.getElementById('state');
        stateEl.style.color="#ff6666" ;
        stateEl.innerHTML = e.message; // | 'connection error ' ;
    }
    setTimeout( "connection_observer()", 3000 ) ;
}

function my_publish(mes){
    if ( t._client.connected ){
        var resEl = document.getElementById('result');
        resEl.style.color="#000000" ;
        resEl.innerHTML = mes;
	//
        var message = new Messaging.Message(mes);
        message.destinationName = "telemba/"+usr+"/command" ;
        console.log( mes + " to " + message.destinationName ) ;
        t.send(message);
    }
}

function my_subscribe(){
    if ( t._client.connected ){
        var topic = "telemba/"+usr+"/data" ;
        t.subscribe(topic);
    }
}

var stateEl = document.getElementById('state');
stateEl.style.color="#000000" ;
stateEl.style.fontSize="15px" ;
stateEl.style.textShadow = "2px 2px 2px gray" ;
stateEl.innerHTML = 'no connection';

var resultEl = document.getElementById('result');
resultEl.style.color="#000000" ;
resultEl.style.fontSize="15px" ;
resultEl.style.textShadow = "2px 2px 2px gray" ;
resultEl.innerHTML = 'no topics';

//var roombaEl = document.getElementById('roomba');
//roombaEl.style.color="#000000" ;
//roombaEl.style.fontSize="25px" ;
//roombaEl.style.textShadow = "2px 2px 2px gray" ;
//roombaEl.innerHTML = 'no roomba';

battery_progress.draw() ;
android_battery_progress.draw() ;

// roomba observer
setInterval(function(){
    var now = new Date().getTime();
    var roombaEl = document.getElementById('roomba_connect');
    var androidEl = document.getElementById('android_connect');
    //roombaEl.style.fontSize="25px" ;
    //roombaEl.style.textShadow = "2px 2px 2px gray" ;
    if ( now - lastUpdate > 6000 ) {
	roombaEl.style.color="#ff0000" ;
	roombaEl.innerHTML = 'Roomba is missing';
	battery_option["frm_bgc"] = "#ff0000" ;
	battery_progress.set_val(0) ;
	battery_progress.draw() ;
	androidEl.style.color="#ff0000" ;
	androidEl.innerHTML = 'Android is missing';
	android_battery_option["frm_bgc"] = "#ff0000" ;
	android_battery_progress.set_val(0) ;
	android_battery_progress.draw() ;
    } else if ( roombaEl.innerHTML.indexOf("missing") > -1 ){
	roombaEl.style.color="#000000" ;
	roombaEl.innerHTML = 'roomba';
	battery_option["frm_bgc"] = "#333333" ;
	battery_progress.set_val(0) ;
	battery_progress.draw() ;
	android_battery_option["frm_bgc"] = "#333333" ;
	android_battery_progress.set_val(0) ;
	android_battery_progress.draw() ;
    }
}, 5000);
//my_connect() ;

//console.log( window.innerWidth + " nanoda" ) ;
var rc = new RoomboxController({
    container: document.getElementById('container'),
    mouseSupport: true
}) ;
var prev_x=0 ;
var prev_y=0 ;
var pwm_ref_prev = 0, pwm_ref_curr = 0;

setInterval(function(){
    var x = -rc.deltaY();
    var y = -rc.deltaX();
    if ( Math.abs(x-prev_x) < 1 && Math.abs(y-prev_y) < 1 ){
	//        console.log("skip") ;
    } else {
	prev_x = x ;
	prev_y = y ;
	var v;
	var w;
	var r;
        if ( x > 0 ){
	    w = Math.atan2 (y, x) / 3.14;
	} else {
            w = Math.atan2 (y, -x) / 3.14;
        }
	v = Math.sqrt(x*x+y*y);
        console.log( "x="+x + "/" + "y=" + y ) ;
        console.log( "v="+v + "/" + "w=" + w ) ;
	//	      if (x < 0) {
	//		  if (y < 0) {
	//		      r = -1;
	//		  } else {
	//		      r = 1;
	//		  }
	//	      } else {
	r = v/w/2;
	if (Math.abs(w) < 0.01 || Math.abs(Math.abs(w) -1) < 0.1){
	    r = 0;
	}
	//	      }
        if ( x < 0 ) v *= -1 ;
	v = Math.round(v);
	r = Math.round(r);

	my_publish("drive "+v+" "+r+" ") ;
    }
    //my_subscribe();
    // Send servo mesg
    pwm_ref_prev = pwm_ref_curr;
    pwm_ref_curr = document.getElementById('rangeInput').value;
    if (pwm_ref_curr != pwm_ref_prev) {
	sendServo(pwm_ref_curr);
    }
}, 1/10 * 1000);

setInterval(function(){
    my_subscribe() ;
}, 10/50 * 1000);

function setUrl() {
    document.getElementById('hangout').value = gapi.hangout.getHangoutUrl();
}

function sendInit() {
    my_publish("init") ;
}
function sendInvite() {
    my_publish("invite" + " " + location.search.substr(1)) ;
}
function sendForward() {
    my_publish("fwd") ;
}
function sendBackward() {
    my_publish("bkw") ;
}
function sendLeft() {
    my_publish("left") ;
}
function sendRight() {
    my_publish("right") ;
}
function sendClean() {
    my_publish("clean") ;
}
function sendStream() {
    my_publish("stream") ;
}
function sendMotor() {
    var side_brush = document.getElementById("side_brush") ;
    var vacuum = document.getElementById("vacuum") ;
    var main_brush = document.getElementById("main_brush") ;
    var _1 = 0 ;
    var _2 = 0 ;
    var _3 = 0 ;
    if ( side_brush.checked ) _1 = 1 ;
    if ( vacuum.checked ) _2 = 1 ;
    if ( main_brush.checked ) _3 = 1 ;
    my_publish("motors " + _1 + " " + _2 + " " + _3) ;
}
function sendServo(pwm_ref) {
    my_publish("servo " + pwm_ref) ;
}

// ビデオが縦画面の場合に縦いっぱいに表示するためのHack:domainが違うのでうまくいかない
function expandVideoCanvasHeight() {
    for (var e in document.getElementsByClassName('Ya-sc-t')) {
	e.style.top = '0px';
    }
    for (var e in document.getElementsByClassName('Ya-sc-sa')) {
	e.style.height = '360px';
	e.style.width = '180px';
	e.style.top = '0px';
    }
}

function init() {
    gapi.hangout.onApiReady.add(
        function(eventObj) {
            if (eventObj.isApiReady) {
		initVideoCanvas();
            }
        });
}
gadgets.util.registerOnLoadHandler(init);
