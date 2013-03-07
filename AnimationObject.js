var kAnimatorMoveHorizontalLeft = 1;
var kAnimatorMoveHorizontalRight = 2;
var kAnimatorMoveVerticalTop = 4;
var kAnimatorMoveVerticalBottom = 8;
var kAnimatorResizeHeight = 16;
var kAnimatorResizeWidth = 32;
var kAnimateOpacity = 64;

var kAnimateOptionsHide = 1; // Hide the element
var kAnimateOptionsRemoveFromParent = 2; // Remove the element from its parent node
var kAnimateOptionsResetToZeros = 4; // Reset the objects position to 0x 0y
var kAnimateOptionsInvisible = 8; // set visibility to hidden
var kAnimateOptionsResetZIndex = 16;

function AnimationObject(element) {
	var _self = this;
	
	this.element = element;
	this.totalTicks = 0;
	
	this.active = false;
	this.finished = false;
	
	this.properties = Array()
	this.callbacks = Array()
}

// set options and total ticks
AnimationObject.prototype.setOptions = function(options, totalTicks){
	this.options = options;
	this.totalTicks = totalTicks;
}

AnimationObject.prototype.reset = function(){
	this.active = false;
}

// remove all phases
AnimationObject.prototype.purgePhases = function(){
	this.properties.length = 0;
	this.finished = false;
}

// remove all callbacks
AnimationObject.prototype.purgeCallbacks = function(){
	this.callbacks.length = 0;
}

// add a new animation phase
// Each animation object supports unlimited phases. Each phase has its own animation properties
AnimationObject.prototype.pushPhase = function(mode, start, end, ticks, firstTick, callback){
	var property = new Object();
	property.mode = mode;
	property.start = start;
	property.end = end;
	property.perTick = (property.end - property.start ) / ticks;
	property.ticks = ticks;
	property.finished = false;
	property.firstTick = firstTick;
	property.hasCallback = false;
	
	// The reason we have callbacks for individuals phases aswell as the controller is so we can get a single phase(currently passes the value for the current step) passed to the callback where as the controller callbacks just return the entire animation object
	if(callback){
		property.hasCallback = true;
		property.callback = callback
	}
	this.properties.push(property)
}

// Overrisd to set the end/per tick properties of a phase after its been created
AnimationObject.prototype.setEndForPhase = function(end, phase){
	this.properties[phase].end = end;
	this.properties[phase].perTick = (this.properties[phase].end - this.properties[phase].start ) / this.properties[phase].ticks;
}

AnimationObject.prototype.run = function(){
	this.active = true;
}

// Do animation. This is called from the controller.
// For each phase we check if its ready to start(based on the firstTick property) and if its finished animating in which case we set the "finished" property to true so its ignored in future ticks
// If the tick count is greater then the total for this animation object then we are finished. At this stage we do any further actions as specified by the options list and set ourself as complete so future ticks are ignored

AnimationObject.prototype.tick = function(tick){
	if(this.finished)
		return;
	
	for(d=0;d<this.properties.length;d++){
		if(tick >= this.properties[d].firstTick){
			if((tick - this.properties[d].firstTick) < this.properties[d].ticks){
				this.doUpdate(tick, this.properties[d]);
				if(this.properties[d].hasCallback){
					if(this.properties[d].callback.mode == kAnimatorCallBackValue)
						this.properties[d].callback.callback(this.properties[d].start + (this.properties[d].perTick * (tick - this.properties[d].firstTick)));
					if(this.properties[d].callback.mode == kAnimatorCallBackStep)
						this.properties[d].callback.callback(this.element, tick - this.properties[d].firstTick);
				}
			} else if(!this.properties[d].finished){
				this.finishPhase(this.properties[d]);
				if(this.properties[d].hasCallback){
					if(this.properties[d].callback.mode == kAnimatorCallBackValue)
						this.properties[d].callback.callback(this.properties[d].end);
					if(this.properties[d].callback.mode == kAnimatorCallBackStep)
						this.properties[d].callback.callback(this.element, tick - this.properties[d].firstTick);
				}
			}
		}
	}
	
	if(tick >= this.totalTicks){
		this.finished = true;
		if(this.options & kAnimateOptionsHide)
			this.element.style.display = "none";
		if(this.options & kAnimateOptionsRemoveFromParent)
			this.element.parentNode.removeChild(this.element);
		if(this.options & kAnimateOptionsInvisible)
			this.element.style.visibility = "hidden";
		if(this.options & kAnimateOptionsResetZIndex)
			this.element.style.zIndex = 1;
	}
}


// Update a phase
AnimationObject.prototype.doUpdate = function(tick, phase){
	if(phase.mode == 0)
		return;
	
	if(phase.mode & kAnimatorMoveHorizontalLeft)
		this.element.style.left = phase.start + (phase.perTick * (tick - phase.firstTick)) + "px"
		
	if(phase.mode & kAnimatorMoveHorizontalRight)
		this.element.style.right = phase.start + (phase.perTick * (tick - phase.firstTick)) + "px"

	if(phase.mode & kAnimatorMoveVerticalTop)
		this.element.style.top = phase.start + (phase.perTick * (tick - phase.firstTick)) + "px"

	if(phase.mode & kAnimatorMoveVerticalBottom)
		this.element.style.bottom = phase.start + (phase.perTick * (tick - phase.firstTick)) + "px"

	if(phase.mode & kAnimatorResizeHeight)
		this.element.style.height = phase.start + (phase.perTick * (tick - phase.firstTick)) + "px"

	if(phase.mode & kAnimatorResizeWidth)
		this.element.style.width = phase.start + (phase.perTick * (tick - phase.firstTick)) + "px"

	if(phase.mode & kAnimateOpacity)
		this.element.style.opacity = phase.start + (phase.perTick * (tick - phase.firstTick))
}

// This is called by the controller when its sent a cancel message
// We need to finish each phase no matter what position its at
AnimationObject.prototype.finish = function(){
	for(d=0;d<this.properties.length;d++){
		var phase = this.properties[d];
		this.finishPhase(phase)
	}
	this.finished = true;

	if(this.options & kAnimateOptionsHide)
		this.element.style.display = "none";
	if(this.options & kAnimateOptionsRemoveFromParent)
		this.element.parentNode.removeChild(this.element);
	if(this.options & kAnimateOptionsInvisible)
		this.element.style.visibility = "hidden";
	if(this.options & kAnimateOptionsResetZIndex)
		this.element.style.zIndex = 1;
}

// Finish a phase
AnimationObject.prototype.finishPhase = function(phase){
	if(phase.mode == 0)
		return;
	
	if(phase.mode & kAnimatorMoveHorizontalLeft)
		this.element.style.left = phase.end + "px"
		
	if(phase.mode & kAnimatorMoveHorizontalRight)
		this.element.style.right = phase.end + "px"

	if(phase.mode & kAnimatorMoveVerticalTop)
		this.element.style.top = phase.end + "px"

	if(phase.mode & kAnimatorMoveVerticalBottom)
		this.element.style.bottom = phase.end + "px"

	if(phase.mode & kAnimatorResizeHeight)
		this.element.style.height = phase.end + "px"

	if(phase.mode & kAnimatorResizeWidth)
		this.element.style.width = phase.end + "px"

	if(phase.mode & kAnimateOpacity)
		this.element.style.opacity = phase.end
}