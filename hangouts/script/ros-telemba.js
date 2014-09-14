// create random clientId for MQTT server
// var message_client = new Messaging.Client("hackerspace.jp", 1883, '_' + Math.random().toString(36).substr(2, 9));

var base_uri = '../';
var telemba_connect_image_uri=base_uri + "img/telemba_connect.png" ;
var telemba_missing_image_uri=base_uri + "img/telemba_missing.png" ;
var invited = false ;

var usr = "";
var pwd = "";
var bmp = 0 ;
var lastUpdate = new Date().getTime() / 2;

var ui_width, ui_height ;

var ros = new ROSLIB.Ros({
    url: "ws://" + "127.0.0.1" + ":9090"
});
var drive_command_topic = new ROSLIB.Topic({
    ros: ros,
    name: "/telemba/request/drive_vector",
    messageType: 'std_msgs/Float32MultiArray'
});


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
    // ui_width = uw ;
    // ui_height = uh;
    // var canvas = gapi.hangout.layout.getVideoCanvas();
    // resizeVideo(canvas) ;
    // canvas.setVisible(true);
};

window.onresize = function() {
//    var canvas = gapi.hangout.layout.getVideoCanvas();
//    resizeVideo(canvas) ;
}

// message_client.onConnectionLost = function(rc){
//     var stateEl = document.getElementById('telemba_connection');
//     stateEl.style.backgroundImage = "url(" + telemba_missing_image_uri + ")" ;
// };
// message_client.onConnect = function(rc){
//     var stateEl = document.getElementById('telemba_connection');
//     stateEl.style.backgroundImage = "url(" + telemba_connect_image_uri + ")" ;
// };
// message_client.onMessageArrived = function(msg) {
//     var str = msg.payloadString ;
//     str = str.trim() ;
//     lastUpdate = new Date().getTime();
//     console.log( "message-arrive: " + str ) ;
//     if ( str.indexOf("bump") > -1 ){
//         var buf = str.split(" ") ;
//         if ( buf.length > 1 ){
// 	    bmp = parseInt( str.split(" ")[1] ) ;
// 	    if ( rc && bmp < 4) {
//                 rc.image_id = bmp ;
//                 rc._draw_roomba(rc._stickEl,rc.roomba[rc.image_id],rc.get_rotation(),rc.get_velocity()) ;
// 	    }
//         }
//     } else if ( str.indexOf("android_battery") > -1 ){
// 	abp.draw_progress( new Number(str.split(" ")[1]) /100.0) ;
//     } else if ( str.indexOf("battery") > -1 ){
// 	bp.draw_progress( new Number(str.split(" ")[1]) /100.0) ;
//     }
// }

function connection_observer(){
    // var stateEl = document.getElementById('telemba_connection');
    // if ( message_client._client.connected ){
    // 	console.log("connect") ;
    // 	stateEl.style.backgroundImage = "url(" + telemba_connect_image_uri + ")" ;
    // 	if ( ! invited ){
    // 	    sendInvite()
    // 	    invited = true ;
    // 	}
    // } else {
    // 	console.log("lost connection") ;
    // 	stateEl.style.backgroundImage = "url(" + telemba_missing_image_uri + ")" ;
    // }
}

function my_connect(){
    // usr = document.getElementById("usr").value ;
    // pwd = document.getElementById("pwd").value ;
    // try{
    //     if ( usr.length + pwd.length == 0  ) {
    //         message_client.connect({onSuccess: message_client.onConnect}) ;
    //     } else {
    //         message_client.connect({onSuccess: message_client.onConnect, userName: usr, password: pwd, useSSL: true}) ;
    //     }
    // } catch ( e ) {
    // 	var stateEl = document.getElementById('telemba_connection');
    // 	stateEl.style.backgroundImage = "url(" + telemba_missing_image_uri + ")" ;
    // 	console.log('catch exception');
    // 	console.log(e.message) ;
    // }
    // setTimeout( "connection_observer()", 3000 ) ;
}

function my_publish(mes){
    // 制御権が自分にあるときだけ送信する
    // console.log ("owner is "+ gapi.hangout.data.getValue('owner'));
    // if (gapi.hangout.data.getValue('owner') != gapi.hangout.getParticipantId()) {
    //     return;
    // }

    // if ( message_client._client.connected ){
    //     var message = new Messaging.Message(mes);
    //     message.destinationName = "telemba/"+usr+"/command" ;
    //     console.log( mes + " to " + message.destinationName ) ;
    //     message_client.send(message);
    // }
}

function my_subscribe(){
    // if ( message_client._client.connected ){
    //     var topic = "telemba/"+usr+"/data" ;
    //     message_client.subscribe(topic);
    // }
}

// roomba observer
// setInterval(function(){
//     var now = new Date().getTime();
//     if ( now - lastUpdate > 3000 ) {
// 	abp.draw_progress(-0.01) ;
// 	bp.draw_progress(-0.01) ;
//     }
// }, 5000);

var rc = new RoomboxController({
    container: document.getElementById('container'),
    mouseSupport: true,
    base_uri: "./"
}) ;
var bp = new BatteryProgress({
    container: document.getElementById('telemba_battery'),
    base_uri: "./"
}) ;
var abp = new BatteryProgress({
    container: document.getElementById('android_battery'),
    base_uri: "./"
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
	r = v/w/2;
	if (Math.abs(w) < 0.01 || Math.abs(Math.abs(w) -1) < 0.1){
	    r = 0;
	}
        if ( x < 0 ) v *= -1 ;
	v = 2.0 * Math.round(v);
	r = Math.round(r);

	// my_publish("drive "+v+" "+r+" ") ;
	drive_command_topic.publish(new ROSLIB.Message({data: [v,r]}));
    }
}, 1/10 * 1000);

setInterval(function(){
    my_subscribe() ;
}, 10/50 * 1000);

function sendInit() {
    my_publish("init") ;
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
    // // 共有状態の変更ハンドラを設定する
    // gapi.hangout.data.onStateChanged.add (stateChangedCallback)
    // // 時間表示更新のタイマを設定する
    // ownerDisplayUpdate ();
}

// 共有状態が変更された際のコールバック関数
function stateChangedCallback (event) {
    // var owner_name = document.getElementById("owner_name") ;
    // if (event && event.metadata['owner']) {
    // 	var participant = gapi.hangout.getParticipantById(event.metadata['owner'].value);
    // 	owner_name.innerHTML = participant.person.displayName + ':' + Math.round((60000 - (new Date().getTime() - event.metadata['owner'].timestamp))/1000) + 'sec';
    // } else {
    // 	owner_name.innerHTML = 'No owner';
    // }
}

// １秒おきにownerの持つ残り時間を表示
function ownerDisplayUpdate () {
    // var metadata = gapi.hangout.data.getStateMetadata();
    // if (metadata['owner']) {
    // 	var participant = gapi.hangout.getParticipantById(metadata['owner'].value);
    // 	var lasttime = Math.round((60000 - (new Date().getTime() - metadata['owner'].timestamp))/1000);
    // 	owner_name.innerHTML = participant.person.displayName + ' : ' + ((lasttime < 0) ? 0 : lasttime) + 'sec';
    // } else {
    // 	owner_name.innerHTML = 'No owner';
    // }
    // setTimeout("ownerDisplayUpdate()", 1000);
}

// ルンバの制御権の取得
function requestControl() {
    // var metadata = gapi.hangout.data.getStateMetadata();
    // // 制御権がとられてから1分以内の場合
    // if (metadata['owner'] && metadata['owner'].timestamp + 60000 > new Date().getTime()) {
    // 	console.log( "you have to wait more " + Math.round((60000 - (new Date().getTime() - metadata['owner'].timestamp))/1000) + "seconds");
    // }	    
    // // それ以外の場合は自分に制御権を設定する
    // else {
    // 	gapi.hangout.data.setValue ("owner", gapi.hangout.getParticipantId());
    // 	// gapi.hangout.data.submitDelta ({"owner":gapi.hangout.getParticipantId()});
    // 	// console.log( "set owner as: " + gapi.hangout.getParticipantId());
    // }
}

// ルンバの制御権の解放
function releaseControl() {
    // gapi.hangout.data.clearValue ("owner");
    // //gapi.hangout.data.submitDelta ({}, ["owner"]);
    // console.log("clear owner");
}
