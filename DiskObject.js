function TallDiskObject(top, data){
	var _self = this;
	this.container = document.createElement('div');
	this.container.setAttribute ("style", "top:" + top + "px;clear:both;left:20px;position:absolute;height:31px;width:125px;overflow:hidden");
	document.getElementById("tall_disk_container").appendChild(this.container);
	
	this.name = document.createElement('div');
	this.name.setAttribute ("style", "position:absolute;top:0px;color:white;color:white;width:110px;overflow:hidden;height:12px;");
	this.name.setAttribute ("class", "ellipsis");
	this.container.appendChild(this.name);

	var used_container = document.createElement('div');
	used_container.setAttribute ("style", "width:90px;position:absolute;top:11px;color:white;color: #838383;");
	used_container.setAttribute ("class", "ellipsis");
	this.container.appendChild(used_container);
	
	this.used = document.createElement('span');
	used_container.appendChild(this.used);

	var used_suffix = document.createElement('span');
	used_suffix.innerHTML = "&nbsp;used";
	used_container.appendChild(used_suffix);

	var free_container = document.createElement('div');
	free_container.setAttribute ("style", "width:90px;position:absolute;top:21px;color:white;color: #838383;");
	free_container.setAttribute ("class", "ellipsis");
	this.container.appendChild(free_container);
	
	this.free = document.createElement('span');
	free_container.appendChild(this.free);

	var free_suffix = document.createElement('span');
	free_suffix.innerHTML = "&nbsp;free";
	free_container.appendChild(free_suffix);
	
	var graph_container = document.createElement('div');
	graph_container.setAttribute ("style", "left:116px;position:absolute;top:2px;height:30px;");
	graph_container.setAttribute ("class", "verticalbarbg");
	this.container.appendChild(graph_container);

	this.graph = document.createElement('div');
	this.graph.setAttribute ("style", "position:absolute;bottom:0px;");
	this.graph.setAttribute ("class", "verticalbar");
	graph_container.appendChild(this.graph);

	this.icon = document.createElement('img');
	this.icon.setAttribute ("style", "height:20px;width:20px;position:absolute;top:12px;left:93px;z-index:10;");
	this.icon.src = './images/defaultHD.png';
	this.container.appendChild(this.icon);
	this.icon.onclick = function(){ _self.openDisk();};
	this.icon.setAttribute("class", "diskicon");

	this.divider = document.createElement('div');
	this.divider.setAttribute ("style", "position:relative;clear:both;left:0px;background-image:url(./images/skin_tall_blaqua/menu_divider.png);width:176px;height:14px;");
	document.getElementById("tall_disk_container").appendChild(this.divider);
}

TallDiskObject.prototype.openDisk = function(){
	iStatPro.openDisk(unescape(this.path));
	widget.openURL('');
}

TallDiskObject.prototype.updateWithData = function(data){
	this.name.innerText = data[0];
	this.used.innerHTML = data[2];	
	this.free.innerHTML = data[3];	
	this.path = escape(data[4]);
		
	var barHeight = data[1] * 0.3;
	if(barHeight < 2 && Math.ceil(parseFloat(data[2])) != 0)
		barHeight = 2;
		
	this.graph.style.height = barHeight;
	this.icon.src = data[5];
}

function WideDiskObject(rootContainer, data){
	var _self = this;
	var container = document.createElement('div');
	container.setAttribute ("style", "overflow:hidden;clear:both;height:45px;width:82px;position:relative;");
	rootContainer.appendChild(container);				

	this.name = document.createElement('div');
	this.name.setAttribute ("class", "ellipsis");
	this.name.setAttribute ("style", "position:absolute;top:0px;color:white;color:white;width:82px;overflow:hidden;height:12px;");
	container.appendChild(this.name);

	var used_container = document.createElement('div');
	used_container.setAttribute ("class", "ellipsis");
	used_container.setAttribute ("style", "width:60px;position:absolute;top:11px;color:white;color: #838383;");
	container.appendChild(used_container);

	var used_suffix = document.createElement('span');
	used_suffix.innerText = 'U: ';
	used_container.appendChild(used_suffix);

	this.used = document.createElement('span');
	used_container.appendChild(this.used);

	var free_container = document.createElement('div');
	free_container.setAttribute ("class", "ellipsis");
	free_container.setAttribute ("style", "width:60px;position:absolute;top:21px;color:white;color: #838383;");
	container.appendChild(free_container);

	var free_suffix = document.createElement('span');
	free_suffix.innerText = 'F: ';
	free_container.appendChild(free_suffix);

	this.free = document.createElement('span');
	free_container.appendChild(this.free);

	var graph_container = document.createElement('div');
	graph_container.setAttribute ("style", "position:absolute;top:35px;color:white;width:82px;");
	graph_container.setAttribute ("class", "barbg");
	container.appendChild(graph_container);

	this.graph = document.createElement('div');
	this.graph.setAttribute ("class", "graphbar");
	graph_container.appendChild(this.graph);

	this.icon = document.createElement('img');
	this.icon.setAttribute ("style", "height:22px;width:22px;position:absolute;top:13px;left:60px;z-index:10;");
	this.icon.src = './images/defaultHD.png';
	container.appendChild(this.icon);
	this.icon.onclick = function(){ _self.openDisk();};
	this.icon.setAttribute("class", "diskicon");
}

WideDiskObject.prototype.openDisk = function(){
	iStatPro.openDisk(unescape(this.path));
	widget.openURL('');
}

WideDiskObject.prototype.updateWithData = function(data){
	this.name.innerText = data[0];
	this.used.innerHTML = data[2];	
	this.free.innerHTML = data[3];
	this.path = escape(data[4]);
		
	var barWidth = data[1] * 0.82;
	if(barWidth < 1 && Math.ceil(parseFloat(data[2])) != 0)
		barWidth = 1;
		
	this.graph.style.width = barWidth;
	this.icon.src = data[5];
}