function SectionController(element){
	this.container = element
	this.animator = new AnimationController();
}

function TallDragController(){
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

TallDragController.prototype.setup = function(event){
	this.sections['cpu'] = new SectionController(document.getElementById("tall_cpu"));
	this.sections['memory'] = new SectionController(document.getElementById("tall_memory"));
	this.sections['disks'] = new SectionController(document.getElementById("tall_disks"));
	this.sections['network'] = new SectionController(document.getElementById("tall_network"));
	this.sections['temps'] = new SectionController(document.getElementById("tall_temps"));
	this.sections['fans'] = new SectionController(document.getElementById("tall_fans"));
	this.sections['uptime'] = new SectionController(document.getElementById("tall_uptime"));
	this.sections['processes'] = new SectionController(document.getElementById("tall_processes"));
	this.sections['battery'] = new SectionController(document.getElementById("tall_battery"));

	this.seperators = Array(document.getElementById("tall_divider_0"), document.getElementById("tall_divider_1"), document.getElementById("tall_divider_2"), document.getElementById("tall_divider_3"), document.getElementById("tall_divider_4"), document.getElementById("tall_divider_5"), document.getElementById("tall_divider_6"), document.getElementById("tall_divider_7"), document.getElementById("tall_divider_8"));
}

TallDragController.prototype.offsetForCurrentIndex = function(){
	var height = 8;
	for(x=0;x<this.currentIndex;x++){
		if(this.sections[this.visibleSortOrder[x]].container.style.display != "block")
			continue
			
		height += 10;
		height += parseInt(this.sections[this.visibleSortOrder[x]].container.style.height);
	}
	return height;
}

TallDragController.prototype.lastVisibleSecton = function(){
	var section = null;
	for(x=0;x<this.visibleSortOrder.length;x++){
		if(this.visibleSortOrder[x] == this.activeDivName || this.sections[this.visibleSortOrder[x]].container.style.display != "block")
			continue
		section = this.visibleSortOrder[x]
	}
	return this.sections[section];
}

TallDragController.prototype.startDrag = function(event, name){
	this.sortOrder = p.v("sort_orders").split(",");
	this.activeDivName = name;
	this.visibleSortOrder.length = 0;
	
	for(x=0;x<this.sortOrder.length;x++){
		if(this.sortOrder[x] == this.activeDivName)
			this.sections[this.activeDivName].container.style.zIndex = 50;
		else
			this.sections[this.sortOrder[x]].container.style.zIndex = 1;
			
		if(tsk.isSectionEnabled(this.sortOrder[x])){
			if(this.sortOrder[x] == this.activeDivName)
				this.currentIndex = x;
			this.visibleSortOrder.push(this.sortOrder[x]);
		}
	}

	document.getElementById("tallDragFiller").style.height = parseInt(this.sections[this.activeDivName].container.style.height) + 28 + "px"
	document.getElementById("tallDragFillerBackground").style.height = parseInt(this.sections[this.activeDivName].container.style.height) + 8 + "px"
	document.getElementById("tallDragFiller").style.top = parseInt(this.sections[this.activeDivName].container.style.top) - 14 + "px"
	document.getElementById("tallDragFiller").style.display = "block"
	
	this.dragOrigin = event.y;
	this.startOffset = parseInt(this.sections[this.activeDivName].container.style.top);
	this.lastPosition = event.y;
	tsk.inDrag = true;
	document.addEventListener("mousemove", this.dragHandler, false);	document.addEventListener("mouseup", this.dragEndHandler, false);
}

TallDragController.prototype.doDrag = function(event){
	if(this.lastPosition == event.y || this.lastVisibleSecton() == null)
		return;
	
	var newPosition = event.y - this.dragOrigin + this.startOffset;
	if(newPosition < 8)
		newPosition = 8;
		
	var lastVisibleSeciton = this.lastVisibleSecton();
	var lastSectionOffset = parseInt(lastVisibleSeciton.container.style.top)
	if(lastVisibleSeciton.animator.active)
		lastSectionOffset = lastVisibleSeciton.finalOffset;
		
	if(newPosition > lastSectionOffset + parseInt(lastVisibleSeciton.container.style.height) + 10)
		newPosition = lastSectionOffset + parseInt(lastVisibleSeciton.container.style.height) + 10
		
	this.sections[this.activeDivName].container.style.top = newPosition + "px";
	document.getElementById("tallDragFiller").style.top = newPosition - 14 + "px"

	cpuStart = parseInt(this.sections[this.activeDivName].container.style.top) - 8;
	cpuEnd = parseInt(this.sections[this.activeDivName].container.style.height) + cpuStart;

	var newIndex = -1;
	for(x=0;x<this.visibleSortOrder.length;x++){
		memoryHalfHeight = parseInt(this.sections[this.visibleSortOrder[x]].container.style.height) / 2;
		memoryOrigin = parseInt(this.sections[this.visibleSortOrder[x]].container.style.top) - 8
		
		if(event.y > this.lastPosition){
			if((cpuEnd > (memoryOrigin + memoryHalfHeight))){
					newIndex = x;
			}
		}
		if(event.y < this.lastPosition){
			if(cpuStart < (memoryOrigin + memoryHalfHeight)){
					newIndex = x;
					break;
			}
		}
	}
	
	if(newIndex == -1)
		return;
	
	this.lastPosition = event.y;
	
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
				if(parseInt(this.sections[this.visibleSortOrder[x]].container.style.top) != offset){
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
						move.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.sections[this.visibleSortOrder[x]].container.style.top), offset, 10, 0, null)
					
						animator.pushGroup(Array(move));
						animator.prepare(175, 10);
						animator.run();
					}								
				}
			}
			
			if(this.sections[this.visibleSortOrder[x]].container.style.display == "block")
				offset += parseInt(this.sections[this.visibleSortOrder[x]].container.style.height);
			
			if(!this.sections[this.visibleSortOrder[x]].container.style.display == "block")
				continue;
			
			if(x < this.visibleSortOrder.length){
				this.seperators[x].style.top = offset + "px";
				this.seperators[x].style.display = "block";
				offset += 10;
			}
		}
	}
}

TallDragController.prototype.finishDrag = function(event){
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
	tsk.sortOrder = newSortOrder;
	wsk.sortOrder = newSortOrder;
	
	p.s(this.sortOrder.join(), "sort_orders");
	
	var currentOffset = parseInt(this.sections[this.activeDivName].container.style.top);
	var offset = this.offsetForCurrentIndex();
	
	if(currentOffset != offset){
		var animator = this.sections[this.activeDivName].animator;
		animator.purge();
		animator.purgeCallbacks();
		var move = new AnimationObject(this.sections[this.activeDivName].container);
		move.setOptions(0, 10);
		move.pushPhase(kAnimatorMoveVerticalTop, parseInt(this.sections[this.activeDivName].container.style.top), offset, 10, 0, null)

		var move2 = new AnimationObject(document.getElementById("tallDragFiller"));
		move2.setOptions(kAnimateOptionsHide, 10);
		move2.pushPhase(kAnimatorMoveVerticalTop, parseInt(document.getElementById("tallDragFiller").style.top), offset - 14, 10, 0, null)
	
		animator.pushCallback(function(){ tsk.inDrag = false;tsk.updateLayout();wsk.updateLayout();});
		animator.pushGroup(Array(move, move2));
		animator.prepare(175, 10);
		animator.run();
	} else {
		document.getElementById("tallDragFiller").style.display = "none";
		tsk.inDrag = false;
	}
}

TallDragController.prototype.showHandle = function(section){
	document.getElementById("tallDragHandle" + section).style.display = "block"
}

TallDragController.prototype.hideHandle = function(section){
	document.getElementById("tallDragHandle" + section).style.display = "none"
}