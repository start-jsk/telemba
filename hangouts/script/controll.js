// create random clientId for MQTT server
var message_client = new Messaging.Client("telemba.jp", 1883, '_' + Math.random().toString(36).substr(2, 9));

var base_uri = 'https://dl.dropboxusercontent.com/u/11198597/telemba/hangouts/';
var telemba_connect_image_uri=base_uri + "img/telemba_connect.png" ;
var telemba_missing_image_uri=base_uri + "img/telemba_missing.png" ;
var invited = false ;

// var battery_option = new Object() ;
// battery_option["to"] = 0 ;
// battery_option["animation"] = 0 ;
// battery_option["width"] = 100 ;
// battery_option["height"] = 10 ;
// battery_option["frm_bgc"] = "#333333" ;
// var battery_progress = new html5jp.progress("roomba_battery", battery_option);
// var android_battery_option = new Object();
// android_battery_option["to"] = 0 ;
// android_battery_option["animation"] = 0 ;
// android_battery_option["width"] = 100 ;
// android_battery_option["frm_bgc"] = "#333333" ;
// var android_battery_progress = new html5jp.progress("android_battery", android_battery_option);

var usr = "";
var pwd = "";
var bmp = 0 ;
var lastUpdate = new Date().getTime() / 2;

var ui_width, ui_height ;

function resizeVideo(canvas){
    var w = canvas.getWidth() ;
    var h = canvas.getHeight();
    var orig_w = w ;
    var orig_h = h ;
    var video_margin = 10 ;
    var video_max_w = Math.max(document.body.clientWidth - ui_width, video_margin) - video_margin;
    var video_max_h = Math.max(document.body.clientHeight - ui_height, video_margin) - video_margin;
    var x, y ;
    var pos = new Object() ;
    //
    if ( video_max_w/video_max_h > w/h ){
	h = video_max_h ;
	w = h * orig_w/orig_h  ;
    } else {
	w = video_max_w ;
	h = w * orig_h/orig_w ;
    }
    x = (video_max_w - w)/2.0 ;
    y = (video_max_h - h)/2.0 + ui_height;
    //
    console.log("[initVideoCanvas]") ;
    console.log("  x=" + x) ;
    console.log("  y=" + y) ;
    console.log("  w=" + w) ;
    console.log("  h=" + h) ;
    //
    pos["left"] = x ;
    pos["top"] = y ;
    canvas.setPosition(pos);
    canvas.setWidth(w);
    canvas.setHeight(h);
}

function initVideoCanvas (uw, uh) {
    ui_width = uw ;
    ui_height = uh;
    var canvas = gapi.hangout.layout.getVideoCanvas();
    resizeVideo(canvas) ;
    canvas.setVisible(true);
};

window.onresize = function() {
    var canvas = gapi.hangout.layout.getVideoCanvas();
    resizeVideo(canvas) ;
}

message_client.onConnectionLost = function(rc){
    // var stateEl = document.getElementById('state');
    // stateEl.style.color="#ff6666" ;
    // stateEl.innerHTML = 'lost connection';
    var stateEl = document.getElementById('telemba_connection');
    stateEl.style.backgroundImage = "url(" + telemba_missing_image_uri + ")" ;
};
message_client.onConnect = function(rc){
    // var stateEl = document.getElementById('state');
    // stateEl.style.color="#66ff66" ;
    // stateEl.innerHTML = 'connect';
    var stateEl = document.getElementById('telemba_connection');
    stateEl.style.backgroundImage = "url(" + telemba_connect_image_uri + ")" ;
};
message_client.onMessageArrived = function(msg) {
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
	abp.draw_progress( new Number(str.split(" ")[1]) /100.0) ;
	// var androidEl = document.getElementById('android_connect');
	// androidEl.innerHTML = 'Android battery';
        // androidEl.style.color="#000000" ;
	// android_battery_option["frm_bgc"] = "#333333" ;
	// android_battery_progress.set_val( str.split(" ")[1] ) ;
	// android_battery_progress.draw() ;
    } else if ( str.indexOf("battery") > -1 ){
	bp.draw_progress( new Number(str.split(" ")[1]) /100.0) ;
        // var roombaEl = document.getElementById('roomba_connect');
	// roombaEl.innerHTML = 'Roomba battery';
        // roombaEl.style.color="#000000" ;
	// battery_option["frm_bgc"] = "#333333" ;
	// battery_progress.set_val( str.split(" ")[1] ) ;
	// battery_progress.draw() ;
    } //else if ( str.indexOf("id") > -1 ){}
}

function connection_observer(){
    // var stateEl = document.getElementById('state');
    // stateEl.style.color =
    //     t._client.connected ? "#66ff66" : "#ff6666" ;
    // stateEl.innerHTML =
    //     t._client.connected ? "connect" : "lost connection" ;
    var stateEl = document.getElementById('telemba_connection');
    if ( message_client._client.connected ){
	console.log("connect") ;
	stateEl.style.backgroundImage = "url(" + telemba_connect_image_uri + ")" ;
	if ( ! invited ){
	    sendInvite()
	    invited = true ;
	}
    } else {
	console.log("lost connection") ;
	stateEl.style.backgroundImage = "url(" + telemba_missing_image_uri + ")" ;
    }
}

function my_connect(){
    usr = document.getElementById("usr").value ;
    pwd = document.getElementById("pwd").value ;
    try{
        if ( usr.length + pwd.length == 0  ) {
            message_client.connect({onSuccess: message_client.onConnect}) ;
        } else {
            message_client.connect({onSuccess: message_client.onConnect, userName: usr, password: pwd, useSSL: true}) ;
            //t.connect({onSuccess: t.onConnect, userName: usr, password: pwd}) ;
        }
	/*
        if ( ! t._client.connected ) {
            // var stateEl = document.getElementById('state');
            // stateEl.style.color="#ff6666" ;
            // stateEl.innerHTML = 'password missmatch';
	    var stateEl = document.getElementById('telemba_connection');
	    stateEl.style.backgroundImage = "url(" + telemba_missing_image_uri + ")" ;
	    console.log('password missmatch') ;
        } else {
	    if ( ! invited ){
		sendInvite()
		invited = true ;
	    }
	}
	*/
    } catch ( e ) {
        // var stateEl = document.getElementById('state');
        // stateEl.style.color="#ff6666" ;
        // stateEl.innerHTML = e.message; // | 'connection error ' ;
	var stateEl = document.getElementById('telemba_connection');
	stateEl.style.backgroundImage = "url(" + telemba_missing_image_uri + ")" ;
	console.log('catch exception');
	console.log(e.message) ;
    }
    // クッキーに保存
    document.cookie = 'phrase=' + usr;
    console.log('cookie:'+document.cookie);
    // 接続状態の監視を起動
    setTimeout( "connection_observer()", 3000 ) ;
}

function my_publish(mes){
    // 制御権が自分にあるときだけ送信する
    console.log ("owner is "+ gapi.hangout.data.getValue('owner'));
    if (gapi.hangout.data.getValue('owner') != gapi.hangout.getParticipantId()) {
        return;
    }

    if ( message_client._client.connected ){
        // var resEl = document.getElementById('result');
        // resEl.style.color="#000000" ;
        // resEl.innerHTML = mes;
	//
        var message = new Messaging.Message(mes);
        message.destinationName = "telemba/"+usr+"/command" ;
        console.log( mes + " to " + message.destinationName ) ;
        message_client.send(message);
    }
}

function my_subscribe(){
    if ( message_client._client.connected ){
        var topic = "telemba/"+usr+"/data" ;
        message_client.subscribe(topic);
    }
}

// var stateEl = document.getElementById('state');
// stateEl.style.color="#000000" ;
// stateEl.style.fontSize="15px" ;
// stateEl.style.textShadow = "2px 2px 2px gray" ;
// stateEl.innerHTML = 'no connection';

// var resultEl = document.getElementById('result');
// resultEl.style.color="#000000" ;
// resultEl.style.fontSize="15px" ;
// resultEl.style.textShadow = "2px 2px 2px gray" ;
// resultEl.innerHTML = 'no topics';

//var roombaEl = document.getElementById('roomba');
//roombaEl.style.color="#000000" ;
//roombaEl.style.fontSize="25px" ;
//roombaEl.style.textShadow = "2px 2px 2px gray" ;
//roombaEl.innerHTML = 'no roomba';

//battery_progress.draw() ;
//android_battery_progress.draw() ;

// roomba observer
setInterval(function(){
    var now = new Date().getTime();
    //var roombaEl = document.getElementById('roomba_connect');
    //var androidEl = document.getElementById('android_connect');
    //roombaEl.style.fontSize="25px" ;
    //roombaEl.style.textShadow = "2px 2px 2px gray" ;
    if ( now - lastUpdate > 3000 ) {
	abp.draw_progress(-0.01) ;
	bp.draw_progress(-0.01) ;
	// roombaEl.style.color="#ff0000" ;
	// roombaEl.innerHTML = 'Roomba is missing';
	// battery_option["frm_bgc"] = "#ff0000" ;
	// battery_progress.set_val(0) ;
	// battery_progress.draw() ;
	// androidEl.style.color="#ff0000" ;
	// androidEl.innerHTML = 'Android is missing';
	// android_battery_option["frm_bgc"] = "#ff0000" ;
	// android_battery_progress.set_val(0) ;
	// android_battery_progress.draw() ;
	// } else if ( roombaEl.innerHTML.indexOf("missing") > -1 ){
	// roombaEl.style.color="#000000" ;
	// roombaEl.innerHTML = 'roomba';
	// battery_option["frm_bgc"] = "#333333" ;
	// battery_progress.set_val(0) ;
	// battery_progress.draw() ;
	// android_battery_option["frm_bgc"] = "#333333" ;
	// android_battery_progress.set_val(0) ;
	// android_battery_progress.draw() ;
    }
}, 5000);

var rc = new RoomboxController({
    container: document.getElementById('container'),
    mouseSupport: true
}) ;
var bp = new BatteryProgress({
    container: document.getElementById('telemba_battery')
}) ;
var abp = new BatteryProgress({
    container: document.getElementById('android_battery')
}) ;

var prev_x=0 ;
var prev_y=0 ;
var pwm_ref_prev = 0, pwm_ref_curr = 0;

setInterval(function(){
    var x = -rc.deltaY();
    var y = -rc.deltaX();
    if ( Math.abs(x-prev_x) < 1 && Math.abs(y-prev_y) < 1 && x*x+y*y < 1){
	console.log("skip") ;
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
	v = 2.0 * Math.round(v);
	r = Math.round(r);

	my_publish("drive "+v+" "+r+" ") ;
    }
    //my_subscribe();
    // Send servo mesg
    // pwm_ref_prev = pwm_ref_curr;
    // pwm_ref_curr = document.getElementById('rangeInput').value;
    // if (pwm_ref_curr != pwm_ref_prev) {
    // 	sendServo(pwm_ref_curr);
    // }
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
    //my_publish("invite" + " " + gapi.hangout.getHangoutUrl()) ;
    //my_publish("invite" + " " + location.search.substr(1)) ;
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

// 所有者を決めるための枠組みの初期化
function initOwnerFramework() {
    // 共有状態の変更ハンドラを設定する
    gapi.hangout.data.onStateChanged.add (stateChangedCallback)
    // 時間表示更新のタイマを設定する
    ownerDisplayUpdate ();
}

// 共有状態が変更された際のコールバック関数
function stateChangedCallback (event) {
    var owner_name = document.getElementById("owner_name") ;
    if (event && event.metadata['owner']) {
	var participant = gapi.hangout.getParticipantById(event.metadata['owner'].value);
	owner_name.innerHTML = participant.person.displayName + ':' + Math.round((60000 - (new Date().getTime() - event.metadata['owner'].timestamp))/1000) + 'sec';
    } else {
	owner_name.innerHTML = 'No owner';
    }
}

// １秒おきにownerの持つ残り時間を表示
function ownerDisplayUpdate () {
    var metadata = gapi.hangout.data.getStateMetadata();
    if (metadata['owner']) {
	var participant = gapi.hangout.getParticipantById(metadata['owner'].value);
	var lasttime = Math.round((60000 - (new Date().getTime() - metadata['owner'].timestamp))/1000);
	owner_name.innerHTML = participant.person.displayName + ' : ' + ((lasttime < 0) ? 0 : lasttime) + 'sec';
    } else {
	owner_name.innerHTML = 'No owner';
    }
    setTimeout("ownerDisplayUpdate()", 1000);
}    

// ルンバの制御権の取得
function requestControl() {
    var metadata = gapi.hangout.data.getStateMetadata();
    // 制御権がとられてから1分以内の場合
    if (metadata['owner'] && metadata['owner'].timestamp + 60000 > new Date().getTime()) {
	console.log( "you have to wait more " + Math.round((60000 - (new Date().getTime() - metadata['owner'].timestamp))/1000) + "seconds");
    }	    
    // それ以外の場合は自分に制御権を設定する
    else {
	gapi.hangout.data.setValue ("owner", gapi.hangout.getParticipantId());
	// gapi.hangout.data.submitDelta ({"owner":gapi.hangout.getParticipantId()});
	// console.log( "set owner as: " + gapi.hangout.getParticipantId());
    }
}

// ルンバの制御権の解放
function releaseControl() {
    gapi.hangout.data.clearValue ("owner");
    //gapi.hangout.data.submitDelta ({}, ["owner"]);
    console.log("clear owner");
}

// フォーム用のクッキーを入力する
function setFormFromCookie () {
    document.getElementById("usr").value = getCookie("phrase");
    console.log("setFromFromCookie:"+getCookie("phrase"));
}

// 該当する名前のクッキーを返す
function getCookie( name )
{
    var result = null;

    var cookieName = name + '=';
    var allcookies = document.cookie;

    var position = allcookies.indexOf( cookieName );
    if( position != -1 )
    {
        var startIndex = position + cookieName.length;

        var endIndex = allcookies.indexOf( ';', startIndex );
        if( endIndex == -1 )
        {
            endIndex = allcookies.length;
        }
        result = decodeURIComponent(
            allcookies.substring( startIndex, endIndex ) );
    }

    return result;
}
