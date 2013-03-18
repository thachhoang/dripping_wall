﻿// Modified from code by Simon Sarris
// www.simonsarris.com
// sarris@acm.org

function Shape(x, y, w, h, c, fill) {
	// This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
	this.x = x || 0;
	this.y = y || 0;
	this.w = w || 1; // width
	this.h = h || 1; // height
	this.c = c || 0; // curve height
	this.fill = fill || '#AAAAAA'; // fill color
}

// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {
	var c = this.c,
		l = this.x,
		t = this.y,
		r = this.x + this.w,
		b = this.y + this.h;
	ctx.beginPath();
	ctx.moveTo(l, t);
	ctx.bezierCurveTo(l, t+c, r, t+c, r, t);
	ctx.lineTo(r, b);
	ctx.bezierCurveTo(r, b+c, l, b+c, l, b);
	ctx.lineTo(l, t);
	ctx.closePath();
	ctx.fillStyle = this.fill;
	ctx.fill();
}

function CanvasState(canvas) {
	// **** First some setup! ****
	this.canvas = canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	this.ctx = canvas.getContext('2d');
	
	this.speed = 25;
	this.barWidth = 20;
	this.barHeight = 50;
	this.barCurve = 20;
	
	// **** Keep track of state! ****
	this.active = true; // draw if state is active
	this.shapes = [];  // the collection of things to be drawn
	
	// **** Then events! ****	
	var myState = this;
	
	this.interval = 1000;
	setInterval(function() { myState.draw(); }, myState.interval);
	
	// generate the first drips
	this.generate();
}

CanvasState.prototype.addShape = function(shape) {
	this.shapes.push(shape);
}

CanvasState.prototype.clear = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
}

CanvasState.prototype.generate = function() {
	var bw = this.barWidth,
		bh = this.barHeight,
		bc = this.barCurve,
		cols = Math.ceil(this.width / bw),
		rows = 2 + Math.floor(this.height / bh),
		color;
	this.shapes = [];
	this.rows = rows;
	this.cols = cols;
	for (var i = 0; i < cols; i++) {
		for (var j = rows; j > -2; j--) {
			color = '#' + zFill((Math.random() * 0xFFFFFF << 0).toString(16), 6);
			this.addShape(new Shape(i * bw, j * bh, bw, bh, bc, color));
		}
	}
}

CanvasState.prototype.draw = function() {
	if (this.active) {
		// wipe canvas
		var ctx = this.ctx;
		this.clear();
		
		// resize canvas if users resize window
		if (this.width != window.innerWidth || this.height != window.innerHeight) {
			var regen = (this.width < window.innerWidth || this.height < window.innerHeight);
			this.width = ctx.canvas.width  = window.innerWidth;
			this.height = ctx.canvas.height = window.innerHeight;
			if (regen)
				this.generate();
		}
		
		var shapes = this.shapes,
			speed = this.speed,
			w = this.width,
			h = this.height,
			rh = this.barHeight * this.rows;
		
		// draw all shapes
		var l = shapes.length;
		for (var i = 0; i < l; i++) {
			var shape = shapes[i];
			
			// skip off-screen-width elements
			if (shape.x > w || shape.x + shape.w < 0)
				continue;
			
			shapes[i].draw(ctx);
			
			// wrap vertically
			if (shape.y > h)
				shape.y -= rh;
			
			// drip
			shape.y += speed;
		}
		
		// draw only once
		//this.active = false;
	}
}

function zFill(numberStr, size) {
	// pad a string with zeroes to the desired size
	while (numberStr.length < size)
		numberStr = "0" + numberStr;
	return numberStr;
}

//init();
function init() {
	new CanvasState(document.getElementById('canvas1'));
}