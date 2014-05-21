var base_uri = 'https://dl.dropboxusercontent.com/u/11198597/telemba/hangouts/';

var BatteryProgress = function(opts)
{
    opts= opts || {};
    this._container= opts.container || document.body;

    this._width = opts.width || (this._container.offsetWidth > 0 ? this._container.offsetWidth : 230) ;
    this._height = (opts.height || (this._container.offsetHeight > 0 ? this._container.offsetHeight : 500)) ;

    this._battery_progress_case = new Image();
    this._battery_progress_case.src = base_uri + "img/bar_bk.png" ;
    this._battery_progress_bar = new Image();
    this._battery_progress_bar.src = base_uri + "img/bar_red.png" ;

    this._caseEl= opts.caseElement || this._buildBatteryProgressCase();
    this._barEl= opts.barElement || this._buildBatteryProgressBar();
    this._bgEl =  document.createElement( 'canvas' );
    this._filterEl = opts.filterElement || this._buildFilterElement() ;

    this._container.style.position= "relative";

    this._container.appendChild(this._bgEl) ;
    this._bgEl.width = this._width;
    this._bgEl.height = this._height ;
    this._bgEl.style.position= "absolute" ;
    this._bgEl.style.width = this._bgEl.width ;
    this._bgEl.style.height = this._bgEl.height ;
    //
    this._container.appendChild(this._caseEl);
    this._caseEl.width = this._width * 0.75;
    this._caseEl.height = this._height ;
    this._caseEl.style.position= "absolute" ;
    this._caseEl.style.width = this._caseEl.width ;
    this._caseEl.style.height = this._caseEl.height ;
    //this._caseEl.style.margin = "auto" ;
    this._container.appendChild(this._barEl);
    this._barEl.width = this._width * 0.75 ;
    this._barEl.height = this._height ;
    this._barEl.style.position= "absolute" ;
    this._barEl.style.width = this._barEl.width ;
    this._barEl.style.height = this._barEl.height ;
    //this._barEl.style.margin = "auto" ;
    // this._container.appendChild(this._filterEl);
    // this._filterEl.style.position= "absolute" ;
    // this._filterEl.style.width = "0%" ;
    // this._filterEl.style.height = "100%" ;
    // this._filterEl.style.right = "0px" ;
    this._draw_percent(this._bgEl,-0.01) ;
}

BatteryProgress.prototype.destroy= function()
{
    this._container.removeChild(this._caseEl);
    this._container.removeChild(this._barEl);
}

/**
 * @returns {Boolean} true if touchscreen is currently available, false otherwise
*/
BatteryProgress.touchScreenAvailable= function()
{
    return 'createTouch' in document ? true : false;
}

BatteryProgress.prototype.draw_progress = function(rate){
    BatteryProgress.prototype._draw_image(this._barEl, this._battery_progress_bar, rate) ;
    BatteryProgress.prototype._draw_percent(this._bgEl, rate) ;
}

BatteryProgress.prototype._draw_image = function(canvas, image, rate){
    var context= canvas.getContext('2d');
    var x,y,w,h ;
    if ( image.width/image.height > canvas.width/canvas.height ) {
	//console.log("yokonaga width=" + image.width + "/height=" + image.height) ;
	w = canvas.width ;
	h = 1.0 * image.height * canvas.width/image.width ;
	x = 0 ;
	y = (canvas.height - h)/2.0 ;
    } else {
	h = canvas.height ;
	w = 1.0 * image.width * canvas.height/image.height ;
	x = (canvas.width - w ) /2.0 ;
	y = 0 ;
    }
    context.clearRect(0,0,canvas.width,canvas.height) ;
    context.save();
    context.drawImage(image, 0,0, image.width*rate, image.height,
		      x,y,w*rate,h) ;
    context.restore();
}

BatteryProgress.prototype._draw_percent = function(canvas, rate){
    var context= canvas.getContext('2d');
    context.clearRect(0,0,canvas.width,canvas.height) ;
    context.font = "bold " + Math.round(canvas.height*0.8) + "px 'Times New Roman'";
    context.textAlign = "end" ;
    context.fillStyle = "white";
    context.fillText( Math.round(rate*100) + "%",
		      canvas.width, canvas.height ) ;
    context.restore();
}

BatteryProgress.prototype._buildBatteryProgressBar= function()
{
    var canvas= document.createElement( 'canvas' );
    var image = this._battery_progress_bar ;
    image.onload
	= function() {
	    BatteryProgress.prototype._draw_image(canvas, image, 0.0) ;
	}
    return canvas ;
}

BatteryProgress.prototype._buildBatteryProgressCase= function()
{
    var canvas= document.createElement( 'canvas' );
    var image = this._battery_progress_case ;
    image.onload
	= function() {
	    BatteryProgress.prototype._draw_image(canvas, image, 1.1) ;
	}
    return canvas ;
}

BatteryProgress.prototype._buildFilterElement = function(){
    var canvas= document.createElement( 'canvas' );
    return canvas ;
}
