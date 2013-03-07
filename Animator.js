var kSubAnimatorModeConcurrent = 0;
var kSubAnimatorModeFollow = 1;

var kAnimatorCallBackValue = 1;
var kAnimatorCallBackStep = 2;

function AnimationController() {
	var _self = this;
	
	this.mode = 0;
	this.active = false;
	
	this.animators = Array();
	this.callbacks = Array();
	this.stepCallbacks = Array();
	
	this.timerCallback = function(){ _self.tick(); };
}

// Remove all animation objects
AnimationController.prototype.purge = function(){
	this.animators.length = 0;
}

// Remove all callbacks
AnimationController.prototype.purgeCallbacks = function(){
	this.callbacks.length = 0;
}

// Remove all step based callbacks
AnimationController.prototype.purgeStepCallbacks = function(){
	this.stepCallbacks.length = 0;
}

// add a group of animation objects
AnimationController.prototype.pushGroup = function(animators){
	this.animators.push(animators);
}

// add a single animation object
AnimationController.prototype.pushAnimator = function(animator){
	this.animators.push(Array(animator));
}

// Add a new callback
AnimationController.prototype.pushCallback = function(callback){
	this.callbacks.push(callback);
}

// Add a new step based callback
AnimationController.prototype.pushStepCallback = function(callback){
	this.stepCallbacks.push(callback);
}

// creates a callback with the specified options
AnimationController.prototype.callbackWithOptions = function(mode, func){
	callback = {callback:func, mode:mode};
	return callback;
}

// Create and return a new step based callback. These are called at a specific timer tick unlike the normal callbacks which are called once animation has finished
AnimationController.prototype.callbackAtStep = function(step, funct){
	var callback = new Object();
	callback.step = step;
	callback.callback = funct;
	return callback;
}

// Prepare to animate. Sets the total timer and number of steps. The timer interval is determined based on those 2 values
AnimationController.prototype.prepare = function(time, steps){
	this.steps = steps;
	this.interval = time / steps;
	this.time = time;
}

// Animate !!
AnimationController.prototype.run = function(time, steps){
	this.active = true;
	this.currentStep = 0;
	this.timer = setInterval(this.timerCallback, this.interval);
}

// Cancel animation but dont finish any phases
AnimationController.prototype.cancelWithoutFinishing = function(){
	if(this.timer)
		clearInterval(this.timer);
	this.timer = null	
	this.active = false;
}

// Cancel animation.
AnimationController.prototype.cancel = function(){
	if(this.timer)
		clearInterval(this.timer);
	this.timer = null	
	this.active = false;
	if(this.animators.length > 0){
		for(a=0;a<this.animators.length;a++){
			var group = this.animators[a];
			for(b=0;b<group.length;b++){
				if(!group[b].finished)
					group[b].finish();
			}		
		}
	}
	for(a=0;a<this.callbacks.length;a++){
		this.callbacks[a]();
	}
}

// Timer tick. Update each phase of each animation object
AnimationController.prototype.tick = function(){
	for(x=0;x<this.stepCallbacks.length;x++){
		if(this.stepCallbacks[x].step == this.currentStep)
			this.stepCallbacks[x].callback();
	}
	
	for(x=0;x<this.animators.length;x++){
		var group = this.animators[x];
		for(y=0;y<group.length;y++){
			group[y].tick(this.currentStep);
		}		
	}
	
	if(this.currentStep >= this.steps){
		clearInterval(this.timer);
		this.timer = null	
		this.active = false;
		for(x=0;x<this.callbacks.length;x++){
			this.callbacks[x](this);
		}
		return;
	}
	
	this.currentStep++;
}