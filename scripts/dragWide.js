function SectionController(element){
	this.container = element
	this.animator = new AnimationController();
}

function WideDragController(){
	this.startIndex = 0;
	this.sectionName = "";
	this.currentIndex = 0;
	this.dragOrigin = 0;
	this.lastPosition = 0;
	
	var _self = this;
	this.dragHandler = function(event){ _self.doDrag(event); };
	this.dragEndHandler = function(event){ _self.finishDrag(event); };
	
	this.sections = {};
	this.visibleSortOrder = Array();
}

WideDragController.prototype.setup = function(event){
	this.sections['cpu'] = new SectionController(document.getElementById("wide_cpu"));
	this.sections['memory'] = new SectionController(document.getElementById("wide_memory"));
	this.sections['disks'] = new SectionController(document.getElementById("wide_disks"));
	this.sections['network'] = new SectionController(document.getElementById("wide_network"));
	this.sections['temps'] = new SectionController(document.getElementById("wide_temps"));
	this.sections['fans'] = new SectionController(document.getElementById("wide_fans"));
	this.sections['uptime'] = new SectionController(document.getElementById("wide_uptime"));
	this.sections['processes'] = new SectionController(document.getElementById("wide_processes"));
	this.sections['battery'] = new SectionController(document.getElementById("wide_battery"));

	this.seperators = Array(document.getElementById("wide_divider_0"), document.getElementById("wide_divider_1"), document.getElementById("wide_divider_2"), document.getElementById("wide_divider_3"), document.getElementById("wide_divider_4"), document.getElementById("wide_divider_5"), document.getElementById("wide_divider_6"), document.getElementById("wide_divider_7"), document.getElementById("wide_divider_8"));
}

WideDragController.prototype.offsetForCurrentIndex = function(){
	var height = 8;
	for(x=0;x<this.currentIndex;x++){
		if(this.sections[this.visibleSortOrder[x]].container.style.display != "block")
			continue
			
		height += 12;
		height += parseInt(this.sections[this.visibleSortOrder[x]].container.style.width);
	}
	return height;
}

WideDragController.prototype.lastVisibleSecton = function(){
	var section = null;
	for(x=0;x<this.visibleSortOrder.length;x++){
		if(this.visibleSortOrder[x] == this.activeDivName || this.sections[this.visibleSortOrder[x]].container.style.display != "block")
			continue
		section = this.visibleSortOrder[x]
	}
	return this.sections[section];
}

WideDragController.prototype.startDrag = function(event, name){
	this.sortOrder = p.v("sort_orders").split(",");
	this.activeDivName = name;
	this.visibleSortOrder.length = 0;
	
	for(x=0;x<this.sortOrder.length;x++){
		if(this.sortOrder[x] == this.activeDivName)
			this.sections[this.activeDivName].container.style.zIndex = 50;
		else
			this.sections[this.sortOrder[x]].container.style.zIndex = 1;
			
		if(wsk.isSectionEnabled(this.sortOrder[x])){
			if(this.sortOrder[x] == this.activeDivName)
				this.currentIndex = x;
			this.visibleSortOrder.push(this.sortOrder[x]);
		}
	}
	
	document.getElementById("wideDragFiller").style.width = parseInt(this.sections[this.activeDivName].container.style.width) + 30 + "px"
	document.getElementById("wideDragFiller").style.left = parseInt(this.sections[this.activeDivName].container.style.left) - 15 + "px"
	document.getElementById("wideDragFiller").style.display = "block"
	document.getElementById("wideDragFillerBackground").style.width = parseInt(this.sections[this.activeDivName].container.style.width) + 10 + "px"
	
	this.dragOrigin = event.x;
	this.startOffset = parseInt(this.sections[this.activeDivName].container.style.left);
	this.lastPosition = event.x;
	wsk.inDrag = true;
	document.addEventListener("mousemove", this.dragHandler, false);	document.addEventListener("mouseup", this.dragEndHandler, false);
}

WideDragController.prototype.doDrag = function(event){
	if(this.lastPosition == event.x || this.lastVisibleSecton() == null)
		return;
	
	var newPosition = event.x - this.dragOrigin + this.startOffset;
	if(newPosition < 8)
		newPosition = 8;
		
	var lastVisibleSeciton = this.lastVisibleSecton();
	var lastSectionOffset = parseInt(lastVisibleSeciton.container.style.left)
	if(lastVisibleSeciton.animator.active)
		lastSectionOffset = lastVisibleSeciton.finalOffset;
		
	if(newPosition > lastSectionOffset + parseInt(lastVisibleSeciton.container.style.width) + 12)
		newPosition = lastSectionOffset + parseInt(lastVisibleSeciton.container.style.width) + 12
		
	this.sections[this.activeDivName].container.style.left = newPosition + "px";
	document.getElementById("wideDragFiller").style.left = newPosition - 15 + "px"

	cpuStart = parseInt(this.sections[this.activeDivName].container.style.left) - 8;
	cpuEnd = parseInt(this.sections[this.activeDivName].container.style.width) + cpuStart;

	var newIndex = -1;
	for(x=0;x<this.visibleSortOrder.length;x++){
		memoryHalfHeight = parseInt(this.sections[this.visibleSortOrder[x]].container.style.width) / 2;
		memoryOrigin = parseInt(this.sections[this.visibleSortOrder[x]].container.style.left) - 8
		
		if(event.x > this.lastPosition){
			if((cpuEnd > (memoryOrigin + memoryHalfHeight))){
					newIndex = x;
			}
		}
		if(event.x < this.lastPosition){
			if(cpuStart < (memoryOrigin + memoryHalfHeight)){
					newIndex = x;
					break;
			}
		}
	}
	
	if(newIndex == -1)
		return;
	
	this.lastPosition = event.x;
	
	if(newIndex != this.currentIndex){
		oldIndex = this.currentIndex;
		this.currentIndex = newIndex;
		
		var newDivOrder = Array();
		for(x=0;x<this.visibleSortOrder.length;x++){
			if(this.visibleSortOrder[x] == this.activeDivName)
				continue;
			newDivOrder.push(this.visibleSortOrder[x]);
		}
		newDivOrder.splice(this.currentIndex, 0, this.activeDivName);
		this.visibleSortOrder = newDivOrder;

		var offset = 8;
		for(x=0;x<this.visibleSortOrder.length;x++){
			if(this.visibleSortOrder[x] != this.activeDivName){
				if(parseInt(this.sections[this.visibleSortOrder[x]].container.style.left) != offset){
					var animator = this.sections[this.visibleSortOrder[x]].animator;
					
					var animate = true;
					if(animator.active){
						if(this.sections[this.visibleSortOrder[x]].finalOffset == offset){
							animate = false;
						}
					}
					
					if(animate){
						if(animator.active)
							animator.cancelWithoutFinishing();
						this.sections[this.visibleSortOrder[x]].finalOffset = offset;
						animator.purge();
						animator.purgeCallbacks();
						var move = new AnimationObject(this.sections[this.visibleSortOrder[x]].container);
						move.setOptions(0, 10);
						move.pushPhase(kAnimatorMoveHorizontalLeft, parseInt(this.sections[this.visibleSortOrder[x]].container.style.left), offset, 10, 0, null)
					
						animator.pushGroup(Array(move));
						animator.prepare(175, 10);
						animator.run();
					}								
				}
			}
			
			if(this.sections[this.visibleSortOrder[x]].container.style.display == "block")
				offset += parseInt(this.sections[this.visibleSortOrder[x]].container.style.width);
			
			if(!this.sections[this.visibleSortOrder[x]].container.style.display == "block")
				continue;
			
			if(x < this.visibleSortOrder.length){
				this.seperators[x].style.left = offset + "px";
				this.seperators[x].style.display = "block";
				offset += 12;
			}
		}
	}
}

WideDragController.prototype.finishDrag = function(event){
	document.removeEventListener("mousemove", this.dragHandler, false);	document.removeEventListener("mouseup", this.dragEndHandler, false);
	
	var newSortOrder = Array();
	newSortOrder = newSortOrder.concat(this.visibleSortOrder);
	for(x=0;x<this.sortOrder.length;x++){
		var add = true;
		for(y=0;y<newSortOrder.length;y++){
			if(newSortOrder[y] == this.sortOrder[x]){
				add = false;
				break;
			}
		}
		if(add)
			newSortOrder.push(this.sortOrder[x]);
	}

	var baseSortOrder = Array("cpu", "memory", "disks", "network", "temps", "fans", "battery", "uptime", "processes");
	for(x=0;x<baseSortOrder.length;x++){
		var add = true;
		for(y=0;y<newSortOrder.length;y++){
			if(newSortOrder[y] == baseSortOrder[x]){
				add = false;
				break;
			}
		}
		if(add)
			newSortOrder.push(baseSortOrder[x]);
	}

	this.sortOrder = newSortOrder;
	wsk.sortOrder = newSortOrder;
	tsk.sortOrder = newSortOrder;
	
	p.s(this.sortOrder.join(), "sort_orders");
	
	var currentOffset = parseInt(this.sections[this.activeDivName].container.style.left);
	var offset = this.offsetForCurrentIndex();
	
	if(currentOffset != offset){
		var animator = this.sections[this.activeDivName].animator;
		animator.purge();
		animator.purgeCallbacks();
		var move = new AnimationObject(this.sections[this.activeDivName].container);
		move.setOptions(0, 10);
		move.pushPhase(kAnimatorMoveHorizontalLeft, parseInt(this.sections[this.activeDivName].container.style.left), offset, 10, 0, null)

		var move2 = new AnimationObject(document.getElementById("wideDragFiller"));
		move2.setOptions(kAnimateOptionsHide, 10);
		move2.pushPhase(kAnimatorMoveHorizontalLeft, parseInt(document.getElementById("wideDragFiller").style.left), offset - 15, 10, 0, null)
	
		animator.pushCallback(function(){ wsk.inDrag = false;wsk.updateLayout();tsk.updateLayout();});
		animator.pushGroup(Array(move, move2));
		animator.prepare(175, 10);
		animator.run();
	} else {
		document.getElementById("wideDragFiller").style.display = "none";
		wsk.inDrag = false;
	}
}

WideDragController.prototype.showHandle = function(section){
	document.getElementById("wideDragHandle" + section).style.display = "block"
}

WideDragController.prototype.hideHandle = function(section){
	document.getElementById("wideDragHandle" + section).style.display = "none"
}