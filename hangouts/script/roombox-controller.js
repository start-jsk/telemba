// var base_uri = 'https://dl.dropboxusercontent.com/u/11198597/telemba/hangouts/';

var RoomboxController = function(opts)
{
    opts= opts || {};
    var base_uri = opts.base_uri ||  'https://dl.dropboxusercontent.com/u/11198597/telemba/hangouts/';
    this._container= opts.container || document.body;

    //this._width = opts.width || (window.innerWidth > 0 ? window.innerWidth : 300) ;
    this._width = opts.width || (this._container.offsetWidth > 0 ? this._container.offsetWidth : 230) ;
    //this._height = (opts.height || (window.innerHeight > 0 ? window.innerHeight : 500)) ;
    this._height = (opts.height || (this._container.offsetHeight > 0 ? this._container.offsetHeight : 500)) ;
    this._img_width = opts.imgWidth || 70 ;
    this._img_height = opts.imgHeight || 70 ;

    this.image_id = 0 ;
    this.roomba = new Array() ;
    this.roomba[0] = new Image();
    this.roomba[0].src = base_uri + "img/roomba.png" ;
    this.roomba[1] = new Image();
    this.roomba[1].src = base_uri + "img/roomba-right.png" ;
    this.roomba[2] = new Image();
    this.roomba[2].src = base_uri + "img/roomba-left.png" ;
    this.roomba[3] = new Image();
    this.roomba[3].src = base_uri + "img/roomba-top.png" ;

    this.trans_roomba = new Image();
    this.trans_roomba.src = base_uri + "img/trans-roomba.png" ;

    this._stickEl= opts.stickElement || this._buildJoystickStick();
    this._baseEl= opts.baseElement || this._buildJoystickBase();
    this._mouseSupport= opts.mouseSupport !== undefined ? opts.mouseSupport : false;

    this._container.style.position= "relative";

    this._container.appendChild(this._baseEl);
    this._baseEl.style.position= "absolute"
    
    this._container.appendChild(this._stickEl);
    this._stickEl.style.position= "absolute"
    
    this._pressed= false;
    this._baseX= this._width/2 ;
    this._baseY= this._height/2 ;
    this._stickX= this._width/2 ;
    this._stickY= this._height/2 ;

    var __bind= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
    this._$onTouchStart= __bind(this._onTouchStart, this);
    this._$onTouchEnd= __bind(this._onTouchEnd, this);
    this._$onTouchMove= __bind(this._onTouchMove, this);
    this._container.addEventListener( 'touchstart', this._$onTouchStart, false );
    this._container.addEventListener( 'touchend', this._$onTouchEnd, false );
    this._container.addEventListener( 'touchmove', this._$onTouchMove, false );
    if( this._mouseSupport ){
	this._$onMouseDown= __bind(this._onMouseDown, this);
	this._$onMouseUp= __bind(this._onMouseUp, this);
	this._$onMouseMove= __bind(this._onMouseMove, this);
	this._container.addEventListener( 'mousedown', this._$onMouseDown, false );
	this._container.addEventListener( 'mouseup', this._$onMouseUp, false );
	this._container.addEventListener( 'mousemove', this._$onMouseMove, false );
    }
// useless?
//    this._$onKeyDown= __bind(this._onKeyDown, this);
//    this._$onKeyUp= __bind(this._onKeyUp, this);
//    this._container.addEventListener( 'keydown', this._$onKeyDown, false );
//    this._container.addEventListener( 'keyup', this._$onKeyUp, false );
    
    this._onUp() ;
}

RoomboxController.prototype.destroy= function()
{
    this._container.removeChild(this._baseEl);
    this._container.removeChild(this._stickEl);

    this._container.removeEventListener( 'touchstart', this._$onTouchStart, false );
    this._container.removeEventListener( 'touchend', this._$onTouchEnd, false );
    this._container.removeEventListener( 'touchmove', this._$onTouchMove, false );
    if( this._mouseSupport ){
	this._container.removeEventListener( 'mouseup', this._$onMouseUp, false );
	this._container.removeEventListener( 'mousedown', this._$onMouseDown, false );
	this._container.removeEventListener( 'mousemove', this._$onMouseMove, false );
    }
}

/**
 * @returns {Boolean} true if touchscreen is currently available, false otherwise
*/
RoomboxController.touchScreenAvailable= function()
{
    return 'createTouch' in document ? true : false;
}

//////////////////////////////////////////////////////////////////////////////////
////
//////////////////////////////////////////////////////////////////////////////////

RoomboxController.prototype.deltaX= function(){ return this._stickX - this._baseX;}
RoomboxController.prototype.deltaY= function(){ return this._stickY - this._baseY;}
RoomboxController.prototype.get_velocity=function(){
    var x = this.deltaX() ;
    var y = this.deltaY() ;
    return Math.sqrt(x*x+y*y) ;
}
RoomboxController.prototype.get_rotation=function(){
    var x = this.deltaX() ;
    var y = -this.deltaY() ;
    if ( x*x + y*y < 10 ){
	return 0 ;
    }
    // when it move backward
    if (y < 0) {
	return Math.atan2(x,y) - Math.PI ;
    }
    // when it move forward
    return Math.atan2(x,y) ;
}

RoomboxController.prototype.up= function(){
    if( this._pressed === false )return false;
    var deltaX= this.deltaX();
    var deltaY= this.deltaY();
    if( deltaY >= 0 )return false;
    if( Math.abs(deltaX) > 2*Math.abs(deltaY) )return false;
    return true;
}
RoomboxController.prototype.down= function(){
    if( this._pressed === false )return false;
    var deltaX= this.deltaX();
    var deltaY= this.deltaY();
    if( deltaY <= 0 )return false;
    if( Math.abs(deltaX) > 2*Math.abs(deltaY) )return false;
    return true;
}
RoomboxController.prototype.right= function(){
    if( this._pressed === false )return false;
    var deltaX= this.deltaX();
    var deltaY= this.deltaY();
    if( deltaX <= 0 )return false;
    if( Math.abs(deltaY) > 2*Math.abs(deltaX) )return false;
    return true;
}
RoomboxController.prototype.left= function(){
    if( this._pressed === false )return false;
    var deltaX= this.deltaX();
    var deltaY= this.deltaY();
    if( deltaX >= 0 )return false;
    if( Math.abs(deltaY) > 2*Math.abs(deltaX) )return false;
    return true;
}

//////////////////////////////////////////////////////////////////////////////////
////
//////////////////////////////////////////////////////////////////////////////////

RoomboxController.prototype._onUp= function()
{
    this._pressed= false; 
    this._stickX= this._baseX ;
    this._stickY= this._baseY ;
    this._stickEl.style.left= (this._stickX - this._stickEl.width /2)+"px";
    this._stickEl.style.top= (this._stickY - this._stickEl.height/2)+"px";
    this._baseEl.style.left= (this._baseX - this._baseEl.width /2)+"px";
    this._baseEl.style.top= (this._baseY - this._baseEl.height/2)+"px";

    this._draw_roomba(this._stickEl,this.roomba[this.image_id],0) ;
}

RoomboxController.prototype._onDown= function(x, y)
{
    //var dx = x - this._baseX ;
    //var dy = y - this._baseY ;
    var dx = x - this._container.offsetLeft - this._baseX;
    var dy = y - this._container.offsetTop -  + this._baseY;
     
    console.log( "_onDown: x,y=" + x + "," + y);
    console.log( "_onDown: dx,dy" + dx + "," + dy);
    if ( Math.sqrt(dx*dx+dy*dy) < this.roomba[this.image_id].width/2 ) {
	this._pressed= true; 
	this._startX= x;
	this._startY= y;
    }
 }

RoomboxController.prototype._onMove= function(x, y)
{
    var dx = x - this._stickX ;
    var dy = y - this._stickY ;
    if ( false ){ //Math.sqrt(dx*dx+dy*dy) > this.roomba.width ) {
	this._onUp() ;
    } else if( this._pressed === true ){
	this._stickX= this._baseX + (x - this._startX) ;
	this._stickY= this._baseY + (y - this._startY) ;
	
	// console.log ("_onMove: " + this._stickX + "," + this._stickY);

	this._draw_roomba(this._stickEl,this.roomba[this.image_id],this.get_rotation(), this.get_velocity()) ;

	this._stickEl.style.left= (this._stickX - this._stickEl.width /2)+"px";
	this._stickEl.style.top= (this._stickY - this._stickEl.height/2)+"px";
    }
}


//////////////////////////////////////////////////////////////////////////////////
//bind touch events (and mouse events for debug)//
//////////////////////////////////////////////////////////////////////////////////

RoomboxController.prototype._onKeyDown = function(event) {
    var keyEvent = event || window.event;
    var x=0, y=0 ;
    console.log( "onKeyDown: " + keyEvent.keyCode ) ;
    switch( keyEvent.keyCode ){
    case 37: // left
	y = -100 ;
	break ;
    case 38: // top
	x = 100 ;
	break ;
    case 39: // right
	y = 100 ;
	break ;
    case 40: // bttom
	x = -100 ;
	break ;
    }
    return this._onDown(this._baseX,this._baseY) && this._onMove(this._baseX+x, this._baseY+y) ;
}

RoomboxController.prototype._onKeyUp = function(event) {
    return this._onUp() ;
}

RoomboxController.prototype._onMouseUp= function(event)
{
    return this._onUp();
}

RoomboxController.prototype._onMouseDown= function(event)
{
    var x= event.pageX;
    var y= event.pageY;
    return this._onDown(x, y);
}

RoomboxController.prototype._onMouseMove= function(event)
{
    var x= event.pageX;
    var y= event.pageY;
    return this._onMove(x, y);
}

RoomboxController.prototype._onTouchStart= function(event)
{
    if( event.touches.length != 1 )return;

    event.preventDefault();

    var x= event.touches[ 0 ].pageX;
    var y= event.touches[ 0 ].pageY;
    return this._onDown(x, y)
}

RoomboxController.prototype._onTouchEnd= function(event)
{
//??????
// no preventDefault to get click event on ios
    event.preventDefault();

    return this._onUp()
}

RoomboxController.prototype._onTouchMove= function(event)
{
    if( event.touches.length != 1 )return;

    event.preventDefault();

    var x= event.touches[ 0 ].pageX;
    var y= event.touches[ 0 ].pageY;
    return this._onMove(x, y)
}


//////////////////////////////////////////////////////////////////////////////////
//build default stickEl and baseEl//
//////////////////////////////////////////////////////////////////////////////////

RoomboxController.prototype._draw_roomba = function(canvas,image,rot,vel){
    var context= canvas.getContext('2d');    
    var width = canvas.width;
    var height = canvas.height;
    var x = -(width * 0.5);
    var y = -(height * 0.5);

    context.clearRect(0,0,width,height) ;

    if ( ! isNaN(vel) && vel > 0 ){ //image.width/2){
	var rad = vel + image.width/2 ;
	var grad  = context.createRadialGradient(-x,-y,image.width/2,-x,-y,rad);
	grad.addColorStop(0,'rgba(200, 200, 255, 1.0)');
	grad.addColorStop(1,'rgba(255, 255, 255, 0.0)');
	context.fillStyle = grad;
	context.rect(0,0, width,height);
	context.fill();

	// var rad = vel + image.width/2 ;
	// context.beginPath(); 
	// context.strokeStyle= "cyan"; 
	// context.lineWidth= 6; 
	// context.arc( -x, -y, rad, 0, Math.PI*2, true); 
	// context.stroke();
    }

    context.save();
    context.translate(-x,-y);
    context.rotate(rot);
    context.translate(x,y) ;
    context.drawImage(image, (width-image.width)/2, (height-image.height)/2);
    context.restore();
}

RoomboxController.prototype._buildJoystickBase= function()
{
    var canvas= document.createElement( 'canvas' );
    canvas.width = this._img_width ;
    canvas.height = this._img_height ;
    var image = this.trans_roomba ;
    var obj = this ; 
    image.onload
	= function() {
	    canvas.width= image.width ; //128;
	    canvas.height= image.height ; //128;

	    obj._draw_roomba(canvas,image,0) ;
	}
    return canvas ;
}

RoomboxController.prototype._buildJoystickStick= function()
{
    var canvas= document.createElement( 'canvas' );
    canvas.width = this._width*2 ;
    canvas.height = this._height*2 ;
    var image = this.roomba[this.image_id] ;
    var obj = this ;
    image.onload
	= function() {
//	    canvas.width= image.width ; //128;
//	    canvas.height= image.height ; //128;

	    obj._draw_roomba(canvas,image,0) ;
	}
    return canvas ;
}

RoomboxController.prototype._buildJoystickButton= function()
{
    var canvas= document.createElement( 'canvas' );
    canvas.width= 86;
    canvas.height= 86;
    var ctx= canvas.getContext('2d');
    ctx.beginPath(); 
    ctx.strokeStyle= "red"; 
    ctx.lineWidth= 6; 
    ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true); 
    ctx.stroke();
    return canvas;
}
