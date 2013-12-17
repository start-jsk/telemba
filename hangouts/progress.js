// Copyright 2007-2009 futomi  http://www.html5.jp/
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// progress.js v1.0.1

/* -------------------------------------------------------------------
* define objects (name space) for this library.
* ----------------------------------------------------------------- */
if( typeof html5jp == 'undefined' ) {
	html5jp = new Object();
}

(function () {

/* -------------------------------------------------------------------
* constructor
* ----------------------------------------------------------------- */
html5jp.progress = function (id, p) {
	if( ! id ) { return; }
	var pnode = document.getElementById(id);
	if(! pnode) { return; }
//	if( ! pnode.nodeName.match(/^DIV$/i) ) { return; }
	var nodes = {};
	nodes.parent = pnode;
	/* -------------------------------------------------------------------
	* default settings
	* ----------------------------------------------------------------- */
	var dp = {
		full: 100,	// value of 100%
		from: 0,	// value of start point
		to: 0,	// value of end point
		animation: 5,	// animation speed
		nd: 0,	//number of decimals
		width: 300,	// width of progress bar (pixel)
		height: 12,	//height of progress bar (pixel)
		// styles of frame
		frm_bgc: "#cccccc",	// backgroundColor
		frm_bdtc: null,	// borderTopColor
		frm_bdrc: null,	// borderRightColor
		frm_bdbc: null,	// borderBottomColor
		frm_bdlc: null,	// borderLeftColor
		frm_bdw: "1px",	// borderWidth
		// styles of bar
		bar_bgc: "#039ab2",	// backgroundColor
		bar_bdtc: null,	// borderTopColor
		bar_bdrc: null,	// borderRightColor
		bar_bdbc: null,	// borderBottomColor
		bar_bdlc: null,	// borderLeftColor
		bar_bdw: "1px",	// borderWidth
		// styles of percentage
		per_shw: true,
		per_ftc: "white",	// color
		per_ftf: "Arial,sans-serif",	// fontFamily
		per_fts: "11px",	// fontSize
		// styles of percentage shadow
		per_sd: true,
		per_sdc: "#101010",	// color
		// gradation
		gradation: true
	};
	/* -------------------------------
	* initialize parameters
	* ----------------------------- */
	if( typeof(p) == "undefined" ) { p = {}; }
	for( var k in dp ) {
		if( typeof(p[k]) == "undefined" ) {
			p[k] = dp[k];
		}
	}
	// value of 100%
	p.full = parseFloat(p.full);
	// value of start point
	p.from = parseFloat(p.from);
	if( p.from < 0 ) {
		p.from = 0;
	} else if( p.from > p.full ) {
		p.from = p.full;
	}

	// value of end point
	p.to = parseFloat(p.to);
	if( p.to < 0 ) {
		p.to = 0;
	} else if( p.to > p.full ) {
		p.to = p.full;
	}
	// animation speed
	p.animation = parseFloat(p.animation);
	if( p.animation < 0 ) {
		p.animation = 0;
	} else if( p.animation > 10 ) {
		p.animation = 10;
	}
	// number of decimals
	p.nd = parseFloat(p.nd);
	if( p.nd < 0 ) {
		p.nd = 0;
	} else if( p.nd > 8 ) {
		p.nd = 8;
	}
	// width of progress bar
	p.width = parseFloat(p.width);
	if( p.width < 10 ) {
		p.width = 10;
	} else if( p.width > 2400 ) {
		p.width = 2400;
	}
	// height of progress bar
	p.height = parseFloat(p.height);
	if( p.height < 5 ) {
		p.height = 5;
	} else if( p.height > 500 ) {
		p.height = 500;
	}
	// boolean parameters
	var boolean_params = ["per_shw", "per_sd", "gradation"];
	for( var i=0; i<boolean_params.length; i++ ) {
		var k = boolean_params[i];
		if( typeof(p[k]) == "string" ) {
			if(p[k] == "true") {
				p[k] = true;
			} else if(p[k] == "false") {
				p[k] = false;
			}
		} else if( typeof(p[k]) != "boolean" ) {
			p[k] = dp[k];
		}
	}
	// current value
	p.val = p.to;
	// current percentage
	p.per = p.to * 100 / p.full;
	/* -------------------------------
	* save initialize parameters
	* ----------------------------- */
	var initp = {};
	for( var k in p ) {
		var v = p[k];
		initp[k] = v;
	}
	//
	this.p = p;
	this.initp = initp;
	this.nodes = nodes;

};

/* -------------------------------------------------------------------
* prototypes
* ----------------------------------------------------------------- */
var proto = html5jp.progress.prototype;

/* -------------------------------------------------------------------
* public methods
* ----------------------------------------------------------------- */
proto.get_val = function() {
	return this.p.val;
};

proto.get_per = function() {
	return parseInt( this.p.per * Math.pow(10, this.p.nd) ) / Math.pow(10, this.p.nd);
};

proto.set_val = function(val) {
	val = parseFloat(val);
	var current = this.get_val();
	if(current != val) {
		this.incr( val - current );
	}
}

proto.set_param = function(k, v) {
	if( typeof(k) == "undefined" || ! k ) { return; }
	if( typeof(this.p[k]) == "undefined" ) { return; }
	if( ! /^(animation|nd)$/.test(k) ) { return; }
	if( typeof(v) == "undefined" || v == null ) { return; }
	// animation speed
	if(k == "animation") {
		v = parseFloat(v);
		if( v < 0 ) {
			v = 0;
		} else if( v > 10 ) {
			v = 10;
		}
	// number of decimals
	} else if(k == "nd") {
		v = parseFloat(v);
		if( v < 0 ) {
			v = 0;
		} else if( v > 8 ) {
			v = 8;
		}
	}
	//
	this.p[k] = v;
};

proto.incr = function(num) {
	if( ! num ) { return; }
	num = parseFloat(num);
	if(num == 0) { return; }
	this.p.from = this.p.val;
	this.p.val += num;
	if(this.p.val < 0) {
		this.p.val = 0;
	} else if(this.p.val > this.p.full) {
		this.p.val = this.p.full;
	}
	this.p.to = this.p.val;
	this.p.per = this._set_per();
	this._draw_bar();
	return this.p.val;
};

proto.decr = function(num) {
	if( ! num ) { return; }
	num = parseFloat(num);
	if(num == 0) { return; }
	this.p.from = this.p.val;
	this.p.val -= num;
	if(this.p.val < 0) {
		this.p.val = 0;
	} else if(this.p.val > this.p.full) {
		this.p.val = this.p.full;
	}
	this.p.to = this.p.val;
	this.p.per = this._set_per();
	this._draw_bar();
	return this.p.val;
};

proto.draw = function() {
	var p = this.p;
	var nodes = this.nodes;
	var pnode = nodes.parent;
	// clear child nodes
	this._clear();
	// create div element for the frame
	nodes.frm = this._create_frame_div_node();
	pnode.appendChild(nodes.frm);
	// create div element for the bar
	nodes.bar = this._create_bar_div_node();
	nodes.frm.appendChild(nodes.bar);
	// create div element for the percentage display box
	if(p.per_shw == true) {
		nodes.per = this._create_per_div_node();
		this._draw_per(50);
		var per_size = this._get_box_size(nodes.per);
		// define a position of the percentage display box
		p.per_left = ( ( p.width + parseInt(p.bar_bdw) * 2 ) / 2 ) - ( per_size.w / 2);
		p.per_top = ( ( p.height + parseInt(p.bar_bdw) * 2 ) / 2 ) - ( per_size.h / 2);
		nodes.per.style.left = p.per_left + "px";
		nodes.per.style.top = p.per_top + "px";
		// create div element for the percentage shadow display box
		if(p.per_sd == true) {
			this._create_per_shadow();
		}
		nodes.frm.appendChild(nodes.per);
	}
	// draw the bar
	this._draw_bar();
};

proto.reset = function() {
	for( var k in this.initp ) {
		var v = this.initp[k];
		this.p[k] = v;
	}
	this.draw();
};

/* -------------------------------------------------------------------
* private methods
* ----------------------------------------------------------------- */

proto._create_per_shadow = function() {
	var p = this.p;
	if(p.per_shw != true) { return ;}
	var nodes = this.nodes;
	nodes.persd = [];
	var dif = [ [ 0,  1], [ 0, -1], [ 1,  0], [ 1,  1], [ 1, -1], [-1,  0], [-1,  1], [-1, -1] ];
	for(var j=0; j<8; j++) {
		var sd = nodes.per.cloneNode(true);
		sd.style.margin = "0px";
		sd.style.padding = "0px";
		sd.style.position = "absolute";
		sd.style.color = p.per_sdc;
		sd.style.fontFamily = p.per_ftf;
		sd.style.fontSize = p.per_fts;
		sd.style.left = (p.per_left + dif[j][0]) + "px";
		sd.style.top = (p.per_top + dif[j][1]) + "px";
		nodes.frm.appendChild(sd);
		nodes.persd.push(sd);
	}
};

proto._create_per_div_node = function() {
	var p = this.p;
	if(p.per_shw != true) { return ;}
	var el = this._create_div_node();
	el.style.position = "absolute";
	el.style.color = p.per_ftc;
	el.style.fontFamily = p.per_ftf;
	el.style.fontSize = p.per_fts;
	return el;
};

proto._create_bar_div_node = function() {
	var p = this.p;
	var el = this._create_div_node();
	el.style.borderWidth = p.bar_bdw;
	el.style.borderStyle = "solid";
	var w = p.width;
	var h = p.height;
	if(document.uniqueID && document.compatMode == "BackCompat") {
		w += ( parseInt(p.bar_bdw) * 2 );
		h += ( parseInt(p.bar_bdw) * 2 );
	}
	el.style.width = w + "px";
	el.style.height = h + "px";
	el.style.position = "absolute";
	el.style.left = "-" + p.width + "px";
	el.style.top = "0px";
	el.style.fontSize = "1px";
	// calculate border color of the bar
	var bar_rgb = this._conv_color_to_rgb(p.bar_bgc);
	var bar_border_rgb1 = this._lighten_rgb(bar_rgb, 0.25);
	var bar_border_rgb2 = this._lighten_rgb(bar_rgb, -0.25);
	var bar_border_color1 = this._conv_rgb_to_css(bar_border_rgb1);
	var bar_border_color2 = this._conv_rgb_to_css(bar_border_rgb2);
	if(p.bar_bdtc == null) {
		el.style.borderTopColor = bar_border_color1;
	} else {
		el.style.borderTopColor = p.bar_bdtc;
	}
	if(p.bar_bdrc == null) {
		el.style.borderRightColor = bar_border_color2;	// borderRightColor
	} else {
		el.style.borderRightColor = p.bar_bdrc;
	}
	if(p.bar_bdbc == null) {
		el.style.borderBottomColor = bar_border_color2;	// borderBottomColor
	} else {
		el.style.borderBottomColor = p.bar_bdbc;
	}
	if(p.bar_bdlc == null) {
		el.style.borderLeftColor = bar_border_color1;	// borderLeftColor
	} else {
		el.style.borderLeftColor = p.bar_bdlc;
	}
	//gradation
	if(p.gradation == true) {
		var rgb = this._conv_color_to_rgb(p.bar_bgc);
		var rgb1 = this._lighten_rgb(rgb, -0.15);
		var rgb2 = this._lighten_rgb(rgb, 0.15);
		var canvas = document.createElement("CANVAS");
		if ( canvas && canvas.getContext ) {
			var color1 = this._conv_rgb_to_css(rgb1);
			var color2 = this._conv_rgb_to_css(rgb2);
			// draw by CANVAS
			var ctx = canvas.getContext('2d');
			canvas.style.margin = "0px";
			canvas.style.padding = "0px";
			canvas.width = w;
			canvas.height = h;
			el.appendChild(canvas);
			ctx.beginPath();
			var grad  = ctx.createLinearGradient(0, 0, 0, h);
			grad.addColorStop(0, color2);
			grad.addColorStop(0.4, p.bar_bgc);
			grad.addColorStop(1, color1);
			ctx.fillStyle = grad;
			ctx.rect(0, 0, w, h);
			ctx.fill();
		} else if(document.uniqueID) {
			// for Internet Explorer
			var color1 = this._conv_rgb_to_css_hex(rgb1);
			var color2 = this._conv_rgb_to_css_hex(rgb2);
			el.style.filter = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr=" + color2 + ",EndColorStr=" + color1 + ")";
		} else {
			el.style.backgroundColor = p.bar_bgc;
		}
	} else {
		el.style.backgroundColor = p.bar_bgc;
	}
	//
	return el;
};

proto._create_frame_div_node = function() {
	var p = this.p;
	var el = this._create_div_node();
	var w = p.width + parseInt(p.bar_bdw) * 2;
	var h = p.height + parseInt(p.bar_bdw) * 2;
	if(document.uniqueID && document.compatMode == "BackCompat") {
		w += parseInt(p.frm_bdw) * 2;
		h += parseInt(p.frm_bdw) * 2;
	}
	el.style.width = w + "px";
	el.style.height = h + "px";
	el.style.position = "relative";
	el.style.overflow = "hidden";
	el.style.borderWidth = p.frm_bdw;
	el.style.borderStyle = "solid";
	// calculate border color of the frame
	var frm_rgb = this._conv_color_to_rgb(p.frm_bgc);
	var frm_border_rgb = this._lighten_rgb(frm_rgb, -0.25);
	var frm_border_color = this._conv_rgb_to_css(frm_border_rgb);
	if(p.frm_bdtc == null) {
		el.style.borderTopColor = frm_border_color;
	} else {
		el.style.borderTopColor = p.frm_bdtc;
	}
	if(p.frm_bdrc == null) {
		el.style.borderRightColor = frm_border_color;
	} else {
		el.style.borderRightColor = p.frm_bdrc;
	}
	if(p.frm_bdbc == null) {
		el.style.borderBottomColor = frm_border_color;
	} else {
		el.style.borderBottomColor = p.frm_bdbc;
	}
	if(p.frm_bdlc == null) {
		el.style.borderLeftColor = frm_border_color;
	} else {
		el.style.borderLeftColor = p.frm_bdlc;
	}
	//gradation
	if(p.gradation == true) {
		var rgb = this._conv_color_to_rgb(p.frm_bgc);
		var rgb1 = this._lighten_rgb(rgb, 0.15);
		var rgb2 = this._lighten_rgb(rgb, -0.15);
		var canvas = document.createElement("CANVAS");
		if ( canvas && canvas.getContext ) {
			var color1 = this._conv_rgb_to_css(rgb1);
			var color2 = this._conv_rgb_to_css(rgb2);
			// draw by CANVAS
			var ctx = canvas.getContext('2d');
			canvas.style.margin = "0px";
			canvas.style.padding = "0px";
			canvas.width = w;
			canvas.height = h;
			el.appendChild(canvas);
			ctx.beginPath();
			var grad  = ctx.createLinearGradient(0, 0, 0, h);
			grad.addColorStop(0, color2);
			grad.addColorStop(0.4, p.frm_bgc);
			grad.addColorStop(1, color1);
			ctx.fillStyle = grad;
			ctx.rect(0, 0, w, h);
			ctx.fill();
		} else if(document.uniqueID) {
			// draw by VML for Internet Explorer
			var color1 = this._conv_rgb_to_css_hex(rgb1);
			var color2 = this._conv_rgb_to_css_hex(rgb2);
			el.style.filter = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr=" + color2 + ",EndColorStr=" + color1 + ")";
		} else {
			el.style.backgroundColor = p.frm_bgc;
		}
	} else {
		el.style.backgroundColor = p.frm_bgc;
	}
	//
	return el;
}

proto._create_div_node = function() {
	var node = document.createElement("DIV");
	node.style.margin = "0px";
	node.style.padding = "0px";
	return node;
};

proto._clear = function() {
	var pnode = this.nodes.parent;
	while (pnode.firstChild) {
		pnode.removeChild(pnode.firstChild);
	}
};

proto._draw_per = function(per) {
	if(this.p.per_shw != true) { return ;}
	if( ! per ) {
		per = this.p.per;
	}
	var nd = this.p.nd;
	per = parseInt( per * Math.pow(10, nd) ) / Math.pow(10, nd);
	var cap = per + "%";
	if( this.nodes.persd ) {
		for( var i=0; i<this.nodes.persd.length; i++ ) {
			this.nodes.persd[i].innerHTML = cap;
		}
	}
	this.nodes.per.innerHTML = cap;
};

proto._set_per = function() {
	this.p.per = this._calc_per(this.p.val);
	this._draw_per();
	return this.p.per;
};

proto._calc_per = function(val) {
	if( isNaN(val) ) { val = 0; }
	var ful = this.p.full;
	var per = val * 100 / ful;
	if( per > 100 ) { per = 100; }
	return per;
};

proto._draw_bar_static = function(per) {
	this.nodes.bar.style.left = "-" + ( this.p.width * (100 - per) / 100 ) + "px";
	this._draw_per(per);
}

proto._draw_bar = function() {
	var speed = this.p.animation;
	var from = this.p.from;
	var to = this.p.to;
	if( speed <= 0 || speed > 10 || from == to ) {
		this._draw_bar_static(this.p.per);
	} else {
		var per1 = this._calc_per(this.p.from);
		var per2 = this.p.per;
		var _this = this;
		var fn = function() {
			var dif = 0.1 * _this.p.animation;
			if(per1 < per2) {
				per1 += dif;
				if(per1 > per2) {
					per1 = per2;
				}
			} else {
				per1 -= dif;
				if(per1 < per2) {
					per1 = per2;
				}
			}
			_this._draw_bar_static(per1);
			if(per1 != per2) {
				setTimeout(fn, 10 );
			}
		}
		fn();
	}
};

proto._get_box_size = function(el) {
	var visible = el.style.visible;
	el.style.visible = "hidden";
	this.nodes.frm.appendChild( el );
	var o = {
		w: el.offsetWidth,
		h: el.offsetHeight
	};
	this.nodes.frm.removeChild(el);
	el.style.visible = visible;
	return o;
}

proto._conv_rgb_to_css = function(rgb) {
	if( typeof(rgb.a) == "undefined" ) {
		return "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
	} else {
		return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + rgb.a + ")";
	}
};

proto._conv_rgb_to_css_hex = function(rgb) {
	var r = rgb.r.toString(16);
	var g = rgb.g.toString(16);
	var b = rgb.b.toString(16);
	if( r.length == 1 ) { r = "0" + r; }
	if( g.length == 1 ) { g = "0" + g; }
	if( b.length == 1 ) { b = "0" + b; }
	return "#" + r + g + b;
};

proto._lighten_rgb = function(rgb, gain_rate) {
	// convert rgb to yuv
	var yuv = this._rgb_to_yuv(rgb);
	// compute the luma (Y') information
	var luma = yuv.y + gain_rate * 256;
	yuv.y = luma;
	return this._yuv_to_rgb(yuv);
};

proto._conv_color_to_rgb = function(color) {
	/* color name mapping */
	var color_name_map = {
		aliceblue : "#F0F8FF",
		antiquewhite : "#FAEBD7",
		aqua : "#00FFFF",
		aquamarine : "#7FFFD4",
		azure : "#F0FFFF",
		beige : "#F5F5DC",
		bisque : "#FFE4C4",
		black : "#000000",
		blanchedalmond : "#FFEBCD",
		blue : "#0000FF",
		blueviolet : "#8A2BE2",
		brass : "#B5A642",
		brown : "#A52A2A",
		burlywood : "#DEB887",
		cadetblue : "#5F9EA0",
		chartreuse : "#7FFF00",
		chocolate : "#D2691E",
		coolcopper : "#D98719",
		copper : "#BF00DF",
		coral : "#FF7F50",
		cornflower : "#BFEFDF",
		cornflowerblue : "#6495ED",
		cornsilk : "#FFF8DC",
		crimson : "#DC143C",
		cyan : "#00FFFF",
		darkblue : "#00008B",
		darkbrown : "#DA0B00",
		darkcyan : "#008B8B",
		darkgoldenrod : "#B8860B",
		darkgray : "#A9A9A9",
		darkgreen : "#006400",
		darkkhaki : "#BDB76B",
		darkmagenta : "#8B008B",
		darkolivegreen : "#556B2F",
		darkorange : "#FF8C00",
		darkorchid : "#9932CC",
		darkred : "#8B0000",
		darksalmon : "#E9967A",
		darkseagreen : "#8FBC8F",
		darkslateblue : "#483D8B",
		darkslategray : "#2F4F4F",
		darkturquoise : "#00CED1",
		darkviolet : "#9400D3",
		deeppink : "#FF1493",
		deepskyblue : "#00BFFF",
		dimgray : "#696969",
		dodgerblue : "#1E90FF",
		feldsper : "#FED0E0",
		firebrick : "#B22222",
		floralwhite : "#FFFAF0",
		forestgreen : "#228B22",
		fuchsia : "#FF00FF",
		gainsboro : "#DCDCDC",
		ghostwhite : "#F8F8FF",
		gold : "#FFD700",
		goldenrod : "#DAA520",
		gray : "#808080",
		green : "#008000",
		greenyellow : "#ADFF2F",
		honeydew : "#F0FFF0",
		hotpink : "#FF69B4",
		indianred : "#CD5C5C",
		indigo : "#4B0082",
		ivory : "#FFFFF0",
		khaki : "#F0E68C",
		lavender : "#E6E6FA",
		lavenderblush : "#FFF0F5",
		lawngreen : "#7CFC00",
		lemonchiffon : "#FFFACD",
		lightblue : "#ADD8E6",
		lightcoral : "#F08080",
		lightcyan : "#E0FFFF",
		lightgoldenrodyellow : "#FAFAD2",
		lightgreen : "#90EE90",
		lightgrey : "#D3D3D3",
		lightpink : "#FFB6C1",
		lightsalmon : "#FFA07A",
		lightseagreen : "#20B2AA",
		lightskyblue : "#87CEFA",
		lightslategray : "#778899",
		lightsteelblue : "#B0C4DE",
		lightyellow : "#FFFFE0",
		lime : "#00FF00",
		limegreen : "#32CD32",
		linen : "#FAF0E6",
		magenta : "#FF00FF",
		maroon : "#800000",
		mediumaquamarine : "#66CDAA",
		mediumblue : "#0000CD",
		mediumorchid : "#BA55D3",
		mediumpurple : "#9370DB",
		mediumseagreen : "#3CB371",
		mediumslateblue : "#7B68EE",
		mediumspringgreen : "#00FA9A",
		mediumturquoise : "#48D1CC",
		mediumvioletred : "#C71585",
		midnightblue : "#191970",
		mintcream : "#F5FFFA",
		mistyrose : "#FFE4E1",
		moccasin : "#FFE4B5",
		navajowhite : "#FFDEAD",
		navy : "#000080",
		oldlace : "#FDF5E6",
		olive : "#808000",
		olivedrab : "#6B8E23",
		orange : "#FFA500",
		orangered : "#FF4500",
		orchid : "#DA70D6",
		palegoldenrod : "#EEE8AA",
		palegreen : "#98FB98",
		paleturquoise : "#AFEEEE",
		palevioletred : "#DB7093",
		papayawhip : "#FFEFD5",
		peachpuff : "#FFDAB9",
		peru : "#CD853F",
		pink : "#FFC0CB",
		plum : "#DDA0DD",
		powderblue : "#B0E0E6",
		purple : "#800080",
		red : "#FF0000",
		richblue : "#0CB0E0",
		rosybrown : "#BC8F8F",
		royalblue : "#4169E1",
		saddlebrown : "#8B4513",
		salmon : "#FA8072",
		sandybrown : "#F4A460",
		seagreen : "#2E8B57",
		seashell : "#FFF5EE",
		sienna : "#A0522D",
		silver : "#C0C0C0",
		skyblue : "#87CEEB",
		slateblue : "#6A5ACD",
		slategray : "#708090",
		snow : "#FFFAFA",
		springgreen : "#00FF7F",
		steelblue : "#4682B4",
		tan : "#D2B48C",
		teal : "#008080",
		thistle : "#D8BFD8",
		tomato : "#FF6347",
		turquoise : "#40E0D0",
		violet : "#EE82EE",
		wheat : "#F5DEB3",
		white : "#FFFFFF",
		whitesmoke : "#F5F5F5",
		yellow : "#FFFF00",
		yellowgreen : "#9ACD32"
	};
	if( /^[a-zA-Z]+$/.test(color) && color_name_map[color] ) {
		color = color_name_map[color];
	}
	var rgb = {};
	var m;
	if( m = color.match( /rgb\(\s*(\d+)\,\s*(\d+)\,\s*(\d+)\s*\)/ ) ) {
		rgb.r = parseInt(m[1], 10);
		rgb.g = parseInt(m[2], 10);
		rgb.b = parseInt(m[3], 10);
		rgb.a = 1;
	} else if( m = color.match( /rgba\(\s*(\d+)\,\s*(\d+)\,\s*(\d+),\s*(\d+)\s*\)/ ) ) {
		rgb.r = parseInt(m[1], 10);
		rgb.g = parseInt(m[2], 10);
		rgb.b = parseInt(m[3], 10);
		rgb.a = parseInt(m[4], 10);
	} else if( m = color.match( /\#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/ ) ) {
		rgb.r = parseInt(m[1], 16);
		rgb.g = parseInt(m[2], 16);
		rgb.b = parseInt(m[3], 16);
		rgb.a = 1;
	} else if( m = color.match( /\#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/ ) ) {
		rgb.r = parseInt(m[1]+m[1], 16);
		rgb.g = parseInt(m[2]+m[2], 16);
		rgb.b = parseInt(m[3]+m[3], 16);
		rgb.a = 1;
	} else if( color == "transparent" ) {
		rgb.r = 255;
		rgb.g = 255;
		rgb.b = 255;
		rgb.a = 1;
	} else {
		return null;
	}
	/* for Safari */
	if( rgb.r == 0 && rgb.g == 0 && rgb.b == 0 && rgb.a == 0 ) {
		rgb.r = 255;
		rgb.g = 255;
		rgb.b = 255;
		rgb.a = 1;
	}
	/* */
	return rgb;
};

proto._rgb_to_yuv = function(rgb) {
	var yuv = {
		y: parseInt( 0.299 * rgb.r + 0.587  * rgb.g + 0.114 * rgb.b ),
		u: parseInt( -0.169 * rgb.r - 0.3316 * rgb.g + 0.500 * rgb.b ),
		v: parseInt( 0.500 * rgb.r - 0.4186 * rgb.g - 0.0813 * rgb.b )
	};
	return yuv;
};

proto._yuv_to_rgb = function(yuv) {
	var rgb = {
		r: parseInt( yuv.y + 1.402 * yuv.v ),
		g: parseInt( yuv.y - 0.714 * yuv.v - 0.344 * yuv.u ),
		b: parseInt( yuv.y + 1.772 * yuv.u )
	};
	for( var k in rgb ) {
		if(rgb[k] > 255) {
			rgb[k] = 255;
		} else if(rgb[k] < 0) {
			rgb[k] = 0;
		}
	}
	return rgb;
};

/* -------------------------------------------------------------------
* for static drawing by class attributes
* ----------------------------------------------------------------- */

_add_event_listener(window, "load", _static_init);

function _static_init() {
	var elms = _get_elements_by_class_name(document, "html5jp-progress");
	for( var i=0; i<elms.length; i++ ) {
		var elm = elms.item(i);
		if( ! /^DIV$/i.test(elm.nodeName) ) { continue; }
		var id  = elm.id;
		if( ! id ) { continue; }
		var p = {};
		var m = elm.className.match(/\[([^\]]+)\]/);
		if(m && m[1]) {
			var parts = m[1].split(";");
			for( var j=0; j<parts.length; j++ ) {
				var pair = parts[j];
				if(pair == "") { continue; }
				var m2 = pair.match(/^([a-zA-Z0-9\-\_]+)\:([a-zA-Z0-9\-\_\#\(\)\,\.]+)$/);
				if( ! m2 ) { continue; }
				var k = m2[1];
				var v = m2[2];
				p[k] = v;
			}
		}
		var o = new html5jp.progress(id, p);
		o.draw();
	}
}

function _add_event_listener(elm, type, func) {
	if(! elm) { return false; }
	if(elm.addEventListener) {
		elm.addEventListener(type, func, false);
	} else if(elm.attachEvent) {
		elm['e'+type+func] = func;
		elm[type+func] = function(){elm['e'+type+func]( window.event );}
		elm.attachEvent( 'on'+type, elm[type+func] );
	} else {
		return false;
	}
	return true;
}

function _get_elements_by_class_name(element, classNames) {
	if(element.getElementsByClassName) {
		return element.getElementsByClassName(classNames);
	}
	/* split a string on spaces */
	var split_a_string_on_spaces = function(string) {
		string = string.replace(/^[\t\s]+/, "");
		string = string.replace(/[\t\s]+$/, "");
		var tokens = string.split(/[\t\s]+/);
		return tokens;
	};
	var tokens = split_a_string_on_spaces(classNames);
	var tn = tokens.length;
	var nodes = element.all ? element.all : element.getElementsByTagName("*");
	var n = nodes.length;
	var array = new Array();
	if( tn > 0 ) {
		if( document.evaluate ) {
			var contains = new Array();
			for(var i=0; i<tn; i++) {
				contains.push('contains(concat(" ",@class," "), " '+ tokens[i] + '")');
			}
			var xpathExpression = "/descendant::*[" + contains.join(" and ") + "]";
			var iterator = document.evaluate(xpathExpression, element, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			var inum = iterator.snapshotLength;
			for( var i=0; i<inum; i++ ) {
				var elm = iterator.snapshotItem(i);
				if( elm != element ) {
					array.push(iterator.snapshotItem(i));
				}
			}
		} else {
			for(var i=0; i<n; i++) {
				var elm = nodes.item(i);
				if( elm.className == "" ) { continue; }
				var class_list = split_a_string_on_spaces(elm.className);
				var class_name = class_list.join(" ");
				var f = true;
				for(var j=0; j<tokens.length; j++) {
					var re = new RegExp('(^|\\s)' + tokens[j] + '(\\s|$)')
					if( ! re.test(class_name) ) {
						f = false;
						break;
					}
				}
				if(f == true) {
					array.push(elm);
				}
			}
		}
	}
	/* add item(index) method to the array as if it behaves such as a NodeList interface. */
	array.item = function(index) {
		if(array[index]) {
			return array[index];
		} else {
			return null;
		}
	};
	//
	return array;
}

})();
