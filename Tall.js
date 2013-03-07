function TallSkinController(){
	this.temperatureSensors = Array();
	this.fanSensors = Array();
	this.disks = Array();
	this.networkInterfaces = Array();
	this.containerHeights = Array();
	this.cpuHistory = Array();
	
	this.ipAnimator = new AnimationController();
	this.sortOrder = p.v("sort_orders").split(",");
	
	this.inDrag = false;
	this.active = false;
	this.lastBatterySource = -1;
	this.lastBatteryState = -1;
	this.hasBT = false;
}

TallSkinController.prototype.resetSectionHeights = function(){
	this.containerHeights['cpu'] = 34;
	this.containerHeights['memory'] = 67;
	this.containerHeights['disks'] = 0;
	this.containerHeights['network'] = 0;
	this.containerHeights['uptime'] = 45;
	if(!iStatPro.isLaptop())
		this.containerHeights['battery'] = 32;
	else
		this.containerHeights['battery'] = 74;
	this.containerHeights['temps'] = 0;
	this.containerHeights['fans'] = 0;
	this.containerHeights['processes'] = 82;
	if(!iStatPro.isLaptop())
		this.containerHeights['battery'] = 0;
}

TallSkinController.prototype.setupCPUBars = function(){
	if(p.v("cpu_graph_mode") == 0){
		var data = iStatPro.cpuUsage();
		if(data[1].length <= 4){
			e("tall_cpu_bars_4").style.display = "block";
			this.containerHeights['cpu'] = 34 + (((data[1].length * 9) - 1) + 5);		
		} else if(data[1].length <= 8) {
			e("tall_cpu_bars_8").style.display = "block";
			this.containerHeights['cpu'] = 74;
		} else {
			e("tall_cpu_bars_16").style.display = "block";
			this.containerHeights['cpu'] = 114;
		}
	
		e("tall_cpu_canvas").style.display = "none";
		e("tall_cpu_graph_container").style.display = "block";
	} else {
		this.containerHeights['cpu'] = 74;
		e("tall_cpu_canvas").style.display = "block";
		e("tall_cpu_graph_container").style.display = "none";
	}
}

TallSkinController.prototype.setupMemoryMode = function(){
	if(p.v("memory_detail_mode") == 0){
		e("tall_memory_advanced").style.display = "none";
		e("tall_memory").style.height = 67;
		this.containerHeights['memory'] = 67;
		e("tall_memory_bar_container").style.top = 59;
	} else {
		e("tall_memory_advanced").style.display = "block";
		e("tall_memory").style.height = 100;
		this.containerHeights['memory'] = 100;
		e("tall_memory_bar_container").style.top = 92;
	}		
}

TallSkinController.prototype.setup = function(){
	this.resetSectionHeights();
	for(x=0;x<125;x++)
		this.cpuHistory[x] = 0;
}

TallSkinController.prototype.updateDividers = function(){
	for(x=0;x<this.sortOrder.length-1;x++){
		if(p.v("section_status_" + this.sortOrder[x]) == 'off'){
			document.getElementById("tall_divider_" + x).style.display = "none";
			continue;
		}

		if((!iStatPro.isLaptop() && !iStatPro.hasBTMouse() && !iStatPro.hasBTKeyboard()) && this.sortOrder[x] == 'battery'){
			document.getElementById("tall_divider_" + x).style.display = "none";
			continue;
		}
		
		if(this.containerHeights[this.sortOrder[x]] == 0) {
			document.getElementById("tall_divider_" + x).style.display = "none";
			continue;
		}		
		
		document.getElementById("tall_divider_" + x).style.display = "none";
		if(!this.shouldAddDivider(x)){
			document.getElementById("tall_divider_" + x).style.display = "block";
		} else {
			document.getElementById("tall_divider_" + x).style.display = "none";
		}
	}
}

TallSkinController.prototype.isSectionEnabled = function(section){
	if(p.v("section_status_" + section) == 'off'){
		return false;
	}
	if((!iStatPro.isLaptop() && !iStatPro.hasBTMouse() && !iStatPro.hasBTKeyboard()) && section == 'battery'){
		return false;
	}
	if(this.containerHeights[section] == 0){
		return false;
	}
	return true;
}

TallSkinController.prototype.shouldAddDivider = function(pos){
	for(y=pos+1;y<this.sortOrder.length;y++){
		if(p.v("section_status_" + this.sortOrder[y]) == 'off'){
			continue;
		}
		if((!iStatPro.isLaptop() && !iStatPro.hasBTMouse() && !iStatPro.hasBTKeyboard()) && this.sortOrder[y] == 'battery'){
			continue;
		}
		if(this.containerHeights[this.sortOrder[y]] == 0){
			continue;
		}
		
		return false;
	}
	return true;
}

TallSkinController.prototype.updateLayout = function(){
	var offset = 8;
	this.updateDividers()
	
	var batteryHeight = 0;
	if(iStatPro.isLaptop()){
		batteryHeight += 50;
		
		if(iStatPro.hasBTMouse() || iStatPro.hasBTKeyboard())
			batteryHeight += 24;
		
		var btPosition = 18;
		if(iStatPro.hasBTMouse()) {
			e("tall_mouse_percentage_container").style.display = "block";
			e("tall_mouse_percentage_container").style.left = btPosition;
			btPosition += 60;
		} else {
			e("tall_mouse_percentage_container").style.display = "none";
		}
		
		if(iStatPro.hasBTKeyboard()){
			e("tall_kb_percentage_container").style.display = "block";
			e("tall_kb_percentage_container").style.left = btPosition;
		} else {
			e("tall_kb_percentage_container").style.display = "none";
		}
	} else {
		var btPosition = 18;
		if(iStatPro.hasBTMouse()) {
			e("tall_mouse_percentage_container").style.display = "block";
			e("tall_mouse_percentage_container").style.left = btPosition;
			btPosition += 60;
		} else {
			e("tall_mouse_percentage_container").style.display = "none";
		}
		
		if(iStatPro.hasBTKeyboard()){
			e("tall_kb_percentage_container").style.display = "block";
			e("tall_kb_percentage_container").style.left = btPosition;
		} else {
			e("tall_kb_percentage_container").style.display = "none";
		}
		batteryHeight = 32;
	}		
	this.containerHeights['battery'] = batteryHeight;

	for(x=0;x<this.sortOrder.length;x++){
		if(p.v("section_status_" + this.sortOrder[x]) == 'off' || ((!iStatPro.isLaptop() && !iStatPro.hasBTMouse() && !iStatPro.hasBTKeyboard()) && this.sortOrder[x] == 'battery') || this.containerHeights[this.sortOrder[x]] == 0){
			e("tall_" + this.sortOrder[x]).style.display = "none";
			e("tall_" + this.sortOrder[x]).style.top = offset + "px";
		} else {
			e("tall_" + this.sortOrder[x]).style.display = "block";
			e("tall_" + this.sortOrder[x]).style.top = offset + "px";
			e("tall_" + this.sortOrder[x]).style.height = this.containerHeights[this.sortOrder[x]] + "px";
			offset += this.containerHeights[this.sortOrder[x]];
			
			if(!this.shouldAddDivider(x)){
				document.getElementById("tall_divider_" + x).style.top = offset;
				offset += 10;
			}
		}
	}
	document.getElementById("tallContentContainer").style.height = offset + "px"
	e("tall_base").style.top = offset + 23 + "px";

	this.sectionSize = offset + 23 + 60;

	if(this.active)
		resizeFront(304, offset + 23 + 60);
}

TallSkinController.prototype.updateCPU = function(){
	var data = iStatPro.cpuUsage();

	document.getElementById("tall_cpu_user").innerHTML = data[0][1];
	document.getElementById("tall_cpu_system").innerHTML = data[0][0];
	document.getElementById("tall_cpu_nice").innerHTML = data[0][2];
	document.getElementById("tall_cpu_idle").innerHTML = data[0][3];
	
	if(data[1].length <= 4){
		for(x=0;x<data[1].length;x++){
			e("tall_cpu_4bar_" + x).style.width = data[1][x][0] * 1.25;
		}
	} else if(data[1].length == 8) {
		for(x=0;x<8;x++){
			e("tall_cpu_8bar_" + x).style.width = data[1][x][0] * 0.61;
		}
	} else if(data[1].length == 16) {
		for(x=0;x<8;x++){
			e("tall_cpu_16bar_" + x).style.width = data[1][x][0] * 0.61;
		}
	}

	for(x=124;x > 0;x--) {
		this.cpuHistory[x] = this.cpuHistory[x - 1];
	}
	this.cpuHistory[0] = 100 - data[0][3];

    var canvas = document.getElementById("tall_cpu_canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, 125, 37);
	context.save();
	context.translate (125, 37);
	context.rotate(3.14159265359)

	context.moveTo(0, 0);
				
	for(x=0;x<125;x++){
		context.lineTo(x, this.cpuHistory[x] * 0.37);
	}
				
	context.lineTo (x, 0);
	context.closePath();

	try {
		var lingrad = context.createLinearGradient(0,0,0,37);
		lingrad.addColorStop(0, graph_colors[p.v("skin_color")][3]);
		lingrad.addColorStop(0.25, graph_colors[p.v("skin_color")][3]);
		lingrad.addColorStop(0.5, graph_colors[p.v("skin_color")][2]);
		lingrad.addColorStop(0.75, graph_colors[p.v("skin_color")][1]);
		lingrad.addColorStop(1, graph_colors[p.v("skin_color")][0]);
		
		context.fillStyle = lingrad;
		context.fill();
	}
	catch(ex){ }
	context.restore();
}


TallSkinController.prototype.updateMemory = function(){
	var data = iStatPro.memoryUsage();
		
	document.getElementById("tall_memory_wired").innerHTML = data[4];
	document.getElementById("tall_memory_active").innerHTML = data[2];
	document.getElementById("tall_memory_inactive").innerHTML = data[3];
	document.getElementById("tall_memory_free").innerHTML = data[0];
	document.getElementById("tall_memory_bar").style.width = Math.round(data[5]) * 1.26;
	
	if(p.v("memory_detail_mode") == '1'){
		document.getElementById("tall_memory_swap").innerHTML = data[9];
		document.getElementById("tall_memory_pageins").innerHTML = data[6][1];
		document.getElementById("tall_memory_pageouts").innerHTML = data[7][1];
	}
}

TallSkinController.prototype.updateDisks = function(){
	var data = iStatPro.diskUsage();

	var filteredData = Array();
	for(x=0;x<data.length;x++) {
		if(!p.isDiskFiltered(data[x][6]))
			filteredData.push(data[x]);
	}

	if(this.disks.length != filteredData.length){
		while (document.getElementById("tall_disk_container").hasChildNodes())
			document.getElementById("tall_disk_container").removeChild(document.getElementById("tall_disk_container").firstChild);
		
		this.disks.length = 0;
		var height = 12;
		for(x=0;x<filteredData.length;x++) {
			var disk = new TallDiskObject(height, filteredData[x]);
			this.disks.push(disk);
			height += 35;
		}
		this.containerHeights['disks'] = height;
		this.updateLayout();
	}
	for(x=0;x<filteredData.length;x++) {
		this.disks[x].updateWithData(filteredData[x]);
	}
}

TallSkinController.prototype.updateNetwork = function(update){
	var data = iStatPro.network();

	var filteredData = Array();
	for(x=0;x<data.length;x++) {
		if(widget.preferenceForKey("network_" + data[x][0])){
			if(widget.preferenceForKey("network_" + data[x][0]) == "off"){
			} else {
				filteredData.push(data[x]);
			}
		} else {
			if(data[x][5].length > 0)
				continue;
			filteredData.push(data[x]);
		}
	}
	
	for(x=0;x<filteredData.length;x++) {
		for(y=0;y<this.networkInterfaces.length;y++){
			if(this.networkInterfaces[y].service == filteredData[x][0]){
				if(this.networkInterfaces[y].isPPP){
					if(filteredData[x][5][0] != this.networkInterfaces[y].lastPPPStatus){
						this.networkInterfaces[y].updateWithData(filteredData[x]);
						update = true;
					}
				}
				break;
			}
		}
	}
	
	if(update == true || forceNetworkLayout == true){
		forceNetworkLayout = false;

		for(z=0;z<filteredData.length;z++) {
			var serviceExists = false;
			for(y=0;y<this.networkInterfaces.length;y++){
				if(this.networkInterfaces[y].service == filteredData[z][0]){
					serviceExists = true;
					break;
				}
			}
			if(serviceExists)
				continue;
			
			var ifn = new TallNetworkObject(filteredData[z]);
			ifn.updateWithData(filteredData[z]);
			this.networkInterfaces.push(ifn);
		}
		for(x=0;x<this.networkInterfaces.length;x++){
			var found = false;
			for(y=0;y<filteredData.length;y++){
				if(this.networkInterfaces[x].service == filteredData[y][0]){
					found = true;
					break;
				}
			}
			if(!found){
				document.getElementById("tall_network_container").removeChild(this.networkInterfaces[x].container);
				document.getElementById("tall_network_container").removeChild(this.networkInterfaces[x].divider);
				this.networkInterfaces.splice(x, 1);
				x--;
			}
		}
	
		var sortedInterfaces = Array();
		for(x=0;x<filteredData.length;x++){
			for(y=0;y<this.networkInterfaces.length;y++){
				if(this.networkInterfaces[y].service == filteredData[x][0]){
					sortedInterfaces.push(this.networkInterfaces[y]);
					break;
				}
			}	
		}
		this.networkInterfaces = sortedInterfaces;
			
		offset = 12;			
		for(x=0;x<this.networkInterfaces.length;x++){	
			this.networkInterfaces[x].container.style.top = offset + "px";
			
			if(this.networkInterfaces[x].isPPP){
				if(this.networkInterfaces[x].lastPPPStatus == 8)
					offset += 107;
				else
					offset += 45;
			} else
				offset += 85;
				
			if((x + 1) < this.networkInterfaces.length){
				this.networkInterfaces[x].divider.style.top = offset + "px"
				this.networkInterfaces[x].divider.style.display = "block";
				offset += 14;
			} else
				this.networkInterfaces[x].divider.style.display = "none";
		}
		
		offset += 5;
		document.getElementById("tall_extip_container").style.top = offset + "px"

		if(filteredData.length == 0)
			this.containerHeights['network'] = 0;
		else
			this.containerHeights['network'] = offset + 15;

		this.updateLayout();
	}
	
	for(z=0;z<filteredData.length;z++) {
		for(y=0;y<this.networkInterfaces.length;y++){
			if(this.networkInterfaces[y].service == filteredData[z][0]){
				this.networkInterfaces[y].updateWithData(filteredData[z]);
				break;
			}
		}
	}
}

TallSkinController.prototype.updateUptime = function(){
	document.getElementById("tall_uptimevalue").innerHTML = iStatPro.uptime();
	document.getElementById("tall_loadavg").innerHTML = iStatPro.load();
	document.getElementById("tall_process_count").innerHTML = iStatPro.processCount();
}

TallSkinController.prototype.updateTemperatures = function(){
	var basedata = iStatPro.temps(p.v("degrees_type"));

	var filteredData = Array();
	for(x=0;x<basedata.length;x++) {
		var filterKey;
		if(basedata[x].length == 4)
			filterKey = basedata[x][3];
		else
			filterKey = basedata[x][0];

		if(widget.preferenceForKey("temps_" + filterKey)){
			if(widget.preferenceForKey("temps_" + filterKey) == "off"){
			} else {
				filteredData.push(basedata[x]);
			}
		} else {
			filteredData.push(basedata[x]);
		}
	}

	if(this.temperatureSensors.length != filteredData.length){
		while (document.getElementById("tall_temp_container").hasChildNodes())
			document.getElementById("tall_temp_container").removeChild(document.getElementById("tall_temp_container").firstChild);

		this.temperatureSensors.length = 0;
		var height = 12;
		for(x=0;x<filteredData.length;x++) {
			var container = document.createElement('div');
			container.setAttribute ("style", "top:" + height + "px;position:absolute;height:12px;width:125px;overflow:hidden");
			document.getElementById("tall_temp_container").appendChild(container);
	
			var name = document.createElement('div');
			name.setAttribute ("style", "position:absolute;height:13px;width:90px;overflow:hidden;color:white;color: #838383;");
			name.setAttribute ("class", "ellipsis");
			container.appendChild(name);
	
			var value = document.createElement('div');
			value.setAttribute ("style", "color:white;position:absolute;height:12px;left:95px;width:30px;overflow:hidden;text-align:right;");
			value.setAttribute ("class", "ellipsis");
			container.appendChild(value);
			
			this.temperatureSensors.push(Array(name, value, container));
			height += 11;
		}
		
		if(filteredData.length == 0)
			this.containerHeights['temps'] = 0;
		else
			this.containerHeights['temps'] = height + 2;

		this.updateLayout();
	}

	for(x=0;x<filteredData.length;x++) {
		this.temperatureSensors[x][0].innerHTML = filteredData[x][0];
		this.temperatureSensors[x][1].innerHTML = filteredData[x][1];
	}
}

TallSkinController.prototype.updateFans = function(){
	var basedata = iStatPro.fans();

	var filteredData = Array();
	for(x=0;x<basedata.length;x++) {
		if(widget.preferenceForKey("fans_" + basedata[x][0])){
			if(widget.preferenceForKey("fans_" + basedata[x][0]) == "off"){
			} else {
				filteredData.push(basedata[x]);
			}
		} else {
			filteredData.push(basedata[x]);
		}
	}

	if(this.fanSensors.length != filteredData.length){
		var height = 12;
		this.fanSensors.length = 0;
		for(x=0;x<filteredData.length;x++) {
			var container = document.createElement('div');
			container.setAttribute ("style", "top:" + height + "px;position:absolute;height:12px;width:125px;overflow:hidden");
			document.getElementById("tall_fan_container").appendChild(container);
	
			var name = document.createElement('div');
			name.setAttribute ("style", "position:absolute;height:13px;width:67px;overflow:hidden;color:white;color: #838383;");
			name.setAttribute ("class", "ellipsis");
			container.appendChild(name);
	
			var value = document.createElement('div');
			value.setAttribute ("style", "color:white;position:absolute;height:12px;left:72px;width:53px;overflow:hidden;text-align:right;");
			value.setAttribute ("class", "ellipsis");
			container.appendChild(value);
			this.fanSensors.push(Array(name, value, container));
			height += 11;
		}
		if(filteredData.length == 0)
			this.containerHeights['fans'] = 0;
		else
			this.containerHeights['fans'] = height + 2;

		this.updateLayout();
	}
	
	for(x=0;x<filteredData.length;x++) {
		this.fanSensors[x][0].innerHTML = filteredData[x][0];
		this.fanSensors[x][1].innerHTML = filteredData[x][1];
	}
}

TallSkinController.prototype.updateProcesses = function(){
	var _self = this;
	var exclude = "";
	if(p.v("processes_excludewidgets") == 'on')
		exclude = " grep -v DashboardClient | ";
	
	if(p.v("processes_sort_mode") == 'cpu')
		widget.system('ps -arcwwwxo "pid %cpu command" | egrep "PID| $1" | grep -v grep | ' + exclude + ' head -7 | tail -6 | awk \'{print "<pid>"$1"</pid><cpu>"$2"</cpu><name>"$3,$4,$5"</name></item>"}\'', function(data){ _self.updateProcessesOut(data);});
	else
		widget.system('ps -amcwwwxo "pid rss command"  | egrep "PID| $1" | grep -v grep | ' + exclude + ' head -7 | tail -6 | awk \'{print "<pid>"$1"</pid><cpu>"$2"</cpu><name>"$3,$4,$5"</name></item>"}\'', function(data){ _self.updateProcessesOut(data);});
}

TallSkinController.prototype.updateProcessesOut = function(data){
	var processes = data.outputString.split("</item>");
	y = 0;
	for(x=0;x<processes.length-1;x++){
		pid = this.processSubstring(processes[x], "<pid>", "</pid>");
		if(pid == iStatPro.getselfpid())
			continue;
		
		if(this.processSubstring(processes[x], "<name>", "</name>").match("DashboardClient") || this.processSubstring(processes[x], "<name>", "</name>").match("LaunchCFM")){
			name = iStatPro.getPsName(pid)
			if(name == "")
				name = this.processSubstring(processes[x], "<name>", "</name>");
		} else {
			name = this.processSubstring(processes[x], "<name>", "</name>");
		}
		
		icon = iStatPro.getAppPath(pid, this.processSubstring(processes[x], "<name>", "</name>"));
		if(icon == "")
			icon = "./images/defaultProcessIcon.tiff";
	
		e("tall_process_name" + y).innerHTML = name;
		if(p.v("processes_sort_mode") == 'cpu')
			e("tall_process_cpu" + y).innerHTML = this.processSubstring(processes[x], "<cpu>", "</cpu>") + "%";
		else
			e("tall_process_cpu" + y).innerHTML = convert_mb(Math.round(parseInt(this.processSubstring(processes[x], "<cpu>", "</cpu>")) / 1024));
		e("tall_process_icon" + y).src = icon;
		y++;
		if(y == 4)
			return;
	}
}

TallSkinController.prototype.processSubstring = function(input, start, end){
	return input.substring(input.indexOf(start) + start.length, input.indexOf(end));
}

TallSkinController.prototype.copyIP = function(){
	if(this.ipAnimator.active)
		return;
	this.ipAnimator.purge();
	var fade = new AnimationObject(e("tall_ipcopied"));
	fade.setOptions(kAnimateOptionsHide, 10);
	fade.pushPhase(kAnimateOpacity, 1, 0, 10, 0, null)
	
	this.ipAnimator.pushGroup(Array(fade));
	this.ipAnimator.prepare(300, 10);
	this.ipAnimator.run();
}

TallSkinController.prototype.updateBattery = function(){
	alert("battery");
	if(iStatPro.isLaptop()){
		var data = iStatPro.battery();
		
		document.getElementById("tall_battery_percentage").innerHTML = data[1];
		document.getElementById("tall_battery_time").innerHTML = data[0];
		document.getElementById("tall_battery_health").innerHTML = data[5];
		document.getElementById("tall_battery_cycles").innerHTML = data[4];

		if(this.lastBatterySource != data[2] || this.lastBatteryState != data[3]){
			this.lastBatterySource = data[2];
			this.lastBatteryState = data[3];
			if(this.lastBatteryState == "Charging")
				document.getElementById("tall_battery_source").src = "./images/battery_charging.png";
			else if(this.lastBatterySource == "Battery")
				document.getElementById("tall_battery_source").src = "./images/battery_nomains.png";
			else
				document.getElementById("tall_battery_source").src = "./images/battery_mains.png";
		}
	}

	var ms = iStatPro.getMouseLevel();
	var kb = iStatPro.getKbLevel();

	if(iStatPro.hasBTMouse()){
		e("tall_mouse_percentage").innerHTML = ms;
	}
	
	if(iStatPro.hasBTKeyboard()){
		e("tall_kb_percentage").innerHTML = kb;
	}
	
	if(this.hasBT){
		if(!iStatPro.hasBTMouse() && !iStatPro.hasBTKeyboard()){
			this.hasBT = false;
			this.updateLayout();
		}
	} else {
		if(iStatPro.hasBTMouse() || iStatPro.hasBTKeyboard()){
			this.hasBT = true;
			this.updateLayout();
		}
	}
}


