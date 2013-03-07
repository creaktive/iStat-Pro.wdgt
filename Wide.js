function WideSkinController(){
	this.temperatureSensors = Array();
	this.fanSensors = Array();
	this.disks = Array();
	this.networkInterfaces = Array();
	this.containerWidths = Array();
	this.cpuHistory = Array();
	this.memoryHistory = Array();
	
	this.ipAnimator = new AnimationController();
	this.sortOrder = p.v("sort_orders").split(",");
	
	this.inDrag = false;
	this.temperateSectionWidth = 0;
	this.fanSectionWidth = 0;
	this.active = false;
	this.lastBatterySource = -1;
	this.lastBatteryState = -1;
	this.hasBT = false;
}

WideSkinController.prototype.resetSectionHeights = function(){
	this.containerWidths['cpu'] = 80;
	this.containerWidths['memory'] = 82;
	this.containerWidths['disks'] = 0;
	this.containerWidths['network'] = 0;
	this.containerWidths['uptime'] = 90;
	if(iStatPro.isLaptop())
		this.containerWidths['battery'] = 100;
	else
		this.containerWidths['battery'] = 70;
	this.containerWidths['temps'] = 0;
	this.containerWidths['fans'] = 0;
	this.containerWidths['processes'] = 130;
	
	if(!iStatPro.isLaptop()){
		this.containerWidths['battery'] = 0;
	}	
}

WideSkinController.prototype.setup = function(){
	this.resetSectionHeights();
	for(x=0;x<125;x++){
		this.cpuHistory[x] = 0;
		this.memoryHistory[x] = 0;
	}
}

WideSkinController.prototype.setupCPUBars = function(){
	data = iStatPro.cpuUsage()
	if(p.v("cpu_graph_mode") == 0){
		if(data[1].length <= 4){
			tall_cpu_bars_height = ((data[1].length * 9) - 1) + 5
			if(data[1].length == 1)
				e("wide_cpu_4bar_container_0").style.display = "block";
			else if(data[1].length == 2) {
				e("wide_cpu_4bar_container_0").style.display = "block";
				e("wide_cpu_4bar_container_1").style.display = "block";
			} else if(data[1].length == 4) {
				e("wide_cpu_4bar_container_0").style.display = "block";
				e("wide_cpu_4bar_container_1").style.display = "block";
				e("wide_cpu_4bar_container_2").style.display = "block";
				e("wide_cpu_4bar_container_3").style.display = "block";
			}
			e("wide_cpu_bars_4").style.display = "block";
		} else if(data[1].length <= 8){
			e("wide_cpu_bars_8").style.display = "block";
		} else {
			e("wide_cpu_bars_16").style.display = "block";
		}

		e("wide_cpu_bars").style.display = "block";
		e("wide_cpu_canvas").style.display = "none";
	} else {
		e("wide_cpu_canvas").style.display = "block";
		e("wide_cpu_bars").style.display = "none";
	}
}

WideSkinController.prototype.setupMemoryMode = function(){
	if(p.v("memory_detail_mode") == 0){
		e("wide_memory_advanced").style.display = "none";
		e("memory_canvas").style.display = "block";
		e("wide_memory").style.width = 82;
		this.containerWidths['memory'] = 82;
	} else {
		e("wide_memory_advanced").style.display = "block";
		e("memory_canvas").style.display = "none";
		e("wide_memory").style.width = 105;
		this.containerWidths['memory'] = 105;
	}		
}

WideSkinController.prototype.updateDividers = function(){
	for(x=0;x<this.sortOrder.length-1;x++){
		if(p.v("section_status_" + this.sortOrder[x]) == 'off'){
			document.getElementById("wide_divider_" + x).style.display = "none";
			continue;
		}

		if((!iStatPro.isLaptop() && !iStatPro.hasBTMouse() && !iStatPro.hasBTKeyboard()) && this.sortOrder[x] == 'battery'){
			document.getElementById("wide_divider_" + x).style.display = "none";
			continue;
		}
		
		if(this.containerWidths[this.sortOrder[x]] == 0) {
			document.getElementById("wide_divider_" + x).style.display = "none";
			continue;
		}		
		
		if(!this.shouldAddDivider(x)){
			document.getElementById("wide_divider_" + x).style.display = "block";
		} else {
			document.getElementById("wide_divider_" + x).style.display = "none";
		}
	}
}

WideSkinController.prototype.isSectionEnabled = function(section){
	if(p.v("section_status_" + section) == 'off'){
		return false;
	}
	if((!iStatPro.isLaptop() && !iStatPro.hasBTMouse() && !iStatPro.hasBTKeyboard()) && section == 'battery'){
		return false;
	}
	if(this.containerWidths[section] == 0){
		return false;
	}
	return true;
}

WideSkinController.prototype.shouldAddDivider = function(pos){
	for(y=pos+1;y<this.sortOrder.length;y++){
		if(p.v("section_status_" + this.sortOrder[y]) == 'off'){
			continue;
		}
		if((!iStatPro.isLaptop() && !iStatPro.hasBTMouse() && !iStatPro.hasBTKeyboard()) && this.sortOrder[y] == 'battery'){
			continue;
		}
		if(this.containerWidths[this.sortOrder[y]] == 0){
			continue;
		}
		
		return false;
	}
	return true;
}

WideSkinController.prototype.updateLayout = function(){
	var offset = 8;
	this.updateDividers()


	if(iStatPro.isLaptop()){
		var wide_bt_offset = -3;
		if(iStatPro.hasBTMouse()) {
			e("wide_mouse_percentage_container").style.display = "block";
			e("wide_mouse_percentage_container").style.left = wide_bt_offset;
			wide_bt_offset += 47;
		} else {
			e("wide_mouse_percentage_container").style.display = "none";
		}
		
		if(iStatPro.hasBTKeyboard()){
			e("wide_kb_percentage_container").style.display = "block";
			e("wide_kb_percentage_container").style.left = wide_bt_offset;
		} else {
			e("wide_kb_percentage_container").style.display = "none";
		}
		this.containerWidths['battery'] = 100;
	} else {
		var wide_bt_offset = 22;
		if(iStatPro.hasBTMouse()) {
			e("wide_mouse_percentage_container").style.display = "block";
			e("wide_mouse_percentage_container").style.top = wide_bt_offset;
			wide_bt_offset += 22;
		} else {
			e("wide_mouse_percentage_container").style.display = "none";
		}
		
		if(iStatPro.hasBTKeyboard()){
			e("wide_kb_percentage_container").style.display = "block";
			e("wide_kb_percentage_container").style.top = wide_bt_offset;
		} else {
			e("wide_kb_percentage_container").style.display = "none";
		}
		this.containerWidths['battery'] = 70;
	}	

	for(x=0;x<this.sortOrder.length;x++){
		if(p.v("section_status_" + this.sortOrder[x]) == 'off' || ((!iStatPro.isLaptop() && !iStatPro.hasBTMouse() && !iStatPro.hasBTKeyboard()) && this.sortOrder[x] == 'battery') || this.containerWidths[this.sortOrder[x]] == 0){
			e("wide_" + this.sortOrder[x]).style.display = "none";
			e("wide_" + this.sortOrder[x]).style.left = offset + "px";
		} else {
			e("wide_" + this.sortOrder[x]).style.display = "block";
			e("wide_" + this.sortOrder[x]).style.left = offset + "px";
			e("wide_" + this.sortOrder[x]).style.width = this.containerWidths[this.sortOrder[x]] + "px";
			offset += this.containerWidths[this.sortOrder[x]];
			
			if(!this.shouldAddDivider(x)){
				document.getElementById("wide_divider_" + x).style.left = offset;
				offset += 12;
			}
		}
	}
	
	document.getElementById("wideContentContainer").style.width = offset + "px"
	document.getElementById("wide_right_cap").style.left = offset + 29 + "px";
	
	this.sectionSize = offset + 172;
	
	if(this.active)
		resizeFront(offset + 172, 130);
}

WideSkinController.prototype.updateCPU = function(){
	data = iStatPro.cpuUsage()
	
	document.getElementById("wide_cpu_user").innerHTML = data[0][1];	
	document.getElementById("wide_cpu_system").innerHTML = data[0][0];	
	document.getElementById("wide_cpu_nice").innerHTML = data[0][2];	
	document.getElementById("wide_cpu_idle").innerHTML = data[0][3];	

	if(p.v("cpu_graph_mode") == 0){
		if(data[1].length <= 4){
			for(x=0;x<data[1].length;x++){
				e("wide_cpu_4bar_" + x).style.width = data[1][x][0] * 0.8;
			}
		} else if(data[1].length == 8) {
			for(x=0;x<8;x++){
				e("wide_cpu_8bar_" + x).style.width = data[1][x][0] * 0.38;
			}
		} else if(data[1].length == 16) {
			for(x=0;x<8;x++){
				e("wide_cpu_16bar_" + x).style.width = data[1][x][0] * 0.19;
			}
		}
	}

	for(x=79;x > 0;x--) {
		this.cpuHistory[x] = this.cpuHistory[x - 1];
	}
	this.cpuHistory[0] = 100 - data[0][3];

	if(p.v("cpu_graph_mode") == 0){
		return;
	}

    var canvas = document.getElementById("wide_cpu_canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, 80, 37);
	context.save();
	context.translate (80, 37);
	context.rotate(3.14159265359)

	context.moveTo(0, 0);
				
	for(x=0;x<80;x++){
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

WideSkinController.prototype.updateMemory = function(){
	var data = iStatPro.memoryUsage();
		
	document.getElementById("wide_memory_wired").innerHTML = data[4];
	document.getElementById("wide_memory_active").innerHTML = data[2];
	document.getElementById("wide_memory_inactive").innerHTML = data[3];
	document.getElementById("wide_memory_free").innerHTML = data[0];

	for(x=81;x > 0;x--) {
		this.memoryHistory[x] = this.memoryHistory[x - 1];
	}
	this.memoryHistory[0] = data[5];

	
	if(p.v("memory_detail_mode") == '1'){
		document.getElementById("wide_memory_swap").innerHTML = data[9];
		document.getElementById("wide_memory_pageins").innerHTML = data[6][0];
		document.getElementById("wide_memory_pageouts").innerHTML = data[7][0];
		document.getElementById("wide_memory_bar").style.width = Math.round(data[5]) * 1.05;
		return;
	}

    var canvas = document.getElementById("memory_canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, 82, 37);
	context.save();
	context.translate (82, 37);
	context.rotate(3.14159265359)

	context.moveTo(0, 0);
				
	for(x=0;x<82;x++){
		context.lineTo(x, this.memoryHistory[x] * 0.37);
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

WideSkinController.prototype.updateDisks = function(){
	var data = iStatPro.diskUsage();

	var filteredData = Array();
	for(x=0;x<data.length;x++) {
		if(!p.isDiskFiltered(data[x][6]))
			filteredData.push(data[x]);
	}

	if(this.disks.length != filteredData.length){
		this.disks.length = 0;
		
		while (document.getElementById("wide_disk_container").hasChildNodes())
			document.getElementById("wide_disk_container").removeChild(document.getElementById("wide_disk_container").firstChild);
			
		var width = 0;
		var container;
		for(x=0;x<filteredData.length;x++) {
			var container;
			if((x % 2) == 0){
				container = document.createElement('div');
				container.setAttribute ("style", "overflow:hidden;height:90px;width:82px;left:" + width + "px;position:absolute;top:20px");
				document.getElementById("wide_disk_container").appendChild(container);				
				width += 82;
			}
			if((x + 1) != filteredData.length && x % 2) {
				var divider = document.createElement('div');
				divider.setAttribute ("class", "inlinedivider");
				divider.setAttribute ("style", "left:" + width + "px");
				document.getElementById("wide_disk_container").appendChild(divider);
				width += 14;
			}

			var disk = new WideDiskObject(container, filteredData[x]);
			this.disks.push(disk);
		}
				
		if(filteredData.length == 0)
			this.containerWidths['disks'] = 0;
		else
			this.containerWidths['disks'] = width;

		this.updateLayout();
	}
	
	for(x=0;x<filteredData.length;x++) {
		this.disks[x].updateWithData(filteredData[x]);
	}
}

WideSkinController.prototype.updateNetwork = function(update){
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

	if(update == true || forceNetworkLayout == true){
		forceNetworkLayout = false;

		var hasPPP = false;
		var extIndex = -1;
		for(z=0;z<filteredData.length;z++) {
			var serviceExists = false;
			for(y=0;y<this.networkInterfaces.length;y++){
				if(this.networkInterfaces[y].service == filteredData[z][0]){
					serviceExists = true;
					break;
				}
			}
			if(serviceExists == false){
				var ifn = new WideNetworkObject(filteredData[z]);
				ifn.updateWithData(filteredData[z]);
				this.networkInterfaces.push(ifn);
			}
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
				document.getElementById("wide_network_container").removeChild(this.networkInterfaces[x].container);
				document.getElementById("wide_network_container").removeChild(this.networkInterfaces[x].divider);
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

		offset = 0;			
		for(x=0;x<this.networkInterfaces.length;x++){			
			this.networkInterfaces[x].container.style.left = offset + "px";
			if(this.networkInterfaces[x].isPPP)
				hasPPP = true;
			else {
				if(extIndex == -1)
					extIndex = offset;
			}
			offset += 116;
				
			if((x + 1) < this.networkInterfaces.length){
				this.networkInterfaces[x].divider.style.left = offset + "px"
				this.networkInterfaces[x].divider.style.display = "block";
				offset += 14;
			} else
				this.networkInterfaces[x].divider.style.display = "none";
		}
		
		offset += 5;

		if(filteredData.length == 0)
			this.containerWidths['network'] = 0;
		else
			this.containerWidths['network'] = offset;

		if(hasPPP && extIndex < 0){
			document.getElementById("wide_extip_container").style.display = "none";
		} else {
			document.getElementById("wide_extip_container").style.display = "block";
			if(extIndex >= 0)
				document.getElementById("wide_extip_container").style.left = extIndex + "px"
		}
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

WideSkinController.prototype.updateUptime = function(){
	document.getElementById("wide_uptimevalue").innerHTML = iStatPro.uptime();
	document.getElementById("wide_loadavg").innerHTML = iStatPro.load();
	document.getElementById("wide_process_count").innerHTML = iStatPro.processCount();
}

WideSkinController.prototype.updateTemperatures = function(){
	var basedata = iStatPro.temps(p.v("degrees_type"));
	var longestWidth = 30;

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
				if(parseInt(basedata[x][2]) > longestWidth)
					longestWidth = parseInt(basedata[x][2])
			}
		} else {
			filteredData.push(basedata[x]);
			if(parseInt(basedata[x][2]) > longestWidth)
				longestWidth = parseInt(basedata[x][2])
		}
		if(filteredData.length == 8)
			break;
	}
	
	if(longestWidth > 90)
		longestWidth = 90;

	if(this.temperateSectionWidth != longestWidth){
		this.temperateSectionWidth = longestWidth;
		for(x=0;x<8;x++){
			document.getElementById("wide_temp_sensor" + x + "_name").innerHTML = '';
			document.getElementById("wide_temp_sensor" + x + "_value").innerHTML = '';
			document.getElementById("wide_temp_sensor" + x + "_name").style.width = this.temperateSectionWidth + 5;
			document.getElementById("wide_temp_sensor" + x + "_value").style.left = this.temperateSectionWidth + 10;
		}

		if(filteredData.length == 0)
			this.containerWidths['temps'] = 0;
		else
			this.containerWidths['temps'] = this.temperateSectionWidth + 40;
		
		this.updateLayout();
	}
	
	for(x=0;x<filteredData.length;x++) {
		document.getElementById("wide_temp_sensor" + x + "_name").innerHTML = filteredData[x][0];
		document.getElementById("wide_temp_sensor" + x + "_value").innerHTML = filteredData[x][1];
	}

}

WideSkinController.prototype.updateFans = function(){
	var basedata = iStatPro.fans();

	var longestWidth = 40;

	var filteredData = Array();
	for(x=0;x<basedata.length;x++) {
		if(widget.preferenceForKey("fans_" + basedata[x][0])){
			if(widget.preferenceForKey("fans_" + basedata[x][0]) == "off"){
			} else {
				filteredData.push(basedata[x]);
				if(parseInt(basedata[x][2]) > longestWidth)
					longestWidth = parseInt(basedata[x][2])
			}
		} else {
			filteredData.push(basedata[x]);
			if(parseInt(basedata[x][2]) > longestWidth)
				longestWidth = parseInt(basedata[x][2])
		}
		if(filteredData.length == 8)
			break;
	}

	if(longestWidth > 70)
		longestWidth = 70;

	if(this.fanSectionWidth != longestWidth){
		this.fanSectionWidth = longestWidth;
		for(x=0;x<8;x++){
			document.getElementById("wide_fan_sensor" + x + "_name").style.width = longestWidth + 5;
			document.getElementById("wide_fan_sensor" + x + "_value").style.left = longestWidth + 15;;
		document.getElementById("wide_fan_sensor" + x + "_name").innerHTML = "";
		document.getElementById("wide_fan_sensor" + x + "_value").innerHTML = "";
		}

		if(filteredData.length == 0)
			this.containerWidths['fans'] = 0;
		else
			this.containerWidths['fans'] = longestWidth + 65;

		this.updateLayout();
	}
	
	for(x=0;x<filteredData.length;x++) {
		document.getElementById("wide_fan_sensor" + x + "_name").innerHTML = filteredData[x][0];
		document.getElementById("wide_fan_sensor" + x + "_value").innerHTML = filteredData[x][1];
	}
}

WideSkinController.prototype.updateProcesses = function(){
	var _self = this;
	var exclude = "";
	if(p.v("processes_excludewidgets") == 'on')
		exclude = " grep -v DashboardClient | ";
	
	if(p.v("processes_sort_mode") == 'cpu')
		widget.system('ps -arcwwwxo "pid %cpu command" | egrep "PID| $1" | grep -v grep | ' + exclude + ' head -7 | tail -6 | awk \'{print "<pid>"$1"</pid><cpu>"$2"</cpu><name>"$3,$4,$5"</name></item>"}\'', function(data){ _self.updateProcessesOut(data);});
	else
		widget.system('ps -amcwwwxo "pid rss command"  | egrep "PID| $1" | grep -v grep | ' + exclude + ' head -7 | tail -6 | awk \'{print "<pid>"$1"</pid><cpu>"$2"</cpu><name>"$3,$4,$5"</name></item>"}\'', function(data){ _self.updateProcessesOut(data);});
}

WideSkinController.prototype.updateProcessesOut = function(data){
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
	
		e("wide_process_name" + y).innerHTML = name;
		if(p.v("processes_sort_mode") == 'cpu')
			e("wide_process_cpu" + y).innerHTML = this.processSubstring(processes[x], "<cpu>", "</cpu>") + "%";
		else
			e("wide_process_cpu" + y).innerHTML = convert_mb(Math.round(parseInt(this.processSubstring(processes[x], "<cpu>", "</cpu>")) / 1024));
		e("wide_process_icon" + y).src = icon;
		y++;
		if(y == 5)
			return;
	}
}

WideSkinController.prototype.processSubstring = function(input, start, end){
	return input.substring(input.indexOf(start) + start.length, input.indexOf(end));
}

WideSkinController.prototype.updateBattery = function(){
	if(iStatPro.isLaptop()){
		var data = iStatPro.battery();
		
		document.getElementById("wide_battery_percentage").innerHTML = data[1];
		document.getElementById("wide_battery_time").innerHTML = data[0];
		
		if(this.lastBatterySource != data[2] || this.lastBatteryState != data[3]){
			this.lastBatterySource = data[2];
			this.lastBatteryState = data[3];
			if(this.lastBatteryState == "Charging")
				document.getElementById("wide_battery_source").src = "./images/battery_charging.png";
			else if(this.lastBatterySource == "Battery")
				document.getElementById("wide_battery_source").src = "./images/battery_nomains.png";
			else
				document.getElementById("wide_battery_source").src = "./images/battery_mains.png";
		}
		
		document.getElementById("wide_battery_health").innerHTML = data[5];
		document.getElementById("wide_battery_cycles").innerHTML = data[4];
		document.getElementById("wide_battery_bar").style.width = parseInt(data[1]) * 0.94;
	}

	var ms = iStatPro.getMouseLevel();
	var kb = iStatPro.getKbLevel();

	if(iStatPro.hasBTMouse()){
		e("wide_mouse_percentage").innerHTML = ms;
	}
	
	if(iStatPro.hasBTKeyboard()){
		e("wide_kb_percentage").innerHTML = kb;
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

WideSkinController.prototype.copyIP = function(){
	if(this.ipAnimator.active)
		return;
	this.ipAnimator.purge();
	var fade = new AnimationObject(e("wide_ipcopied"));
	fade.setOptions(kAnimateOptionsHide, 10);
	fade.pushPhase(kAnimateOpacity, 1, 0, 10, 0, null)
	
	this.ipAnimator.pushGroup(Array(fade));
	this.ipAnimator.prepare(300, 10);
	this.ipAnimator.run();
}

function wideShowPPPDisconnect(element){
	document.getElementById("pppdisconnectcontrol-" + element).style.display = "block";
}

function wideHidePPPDisconnect(element){
	document.getElementById("pppdisconnectcontrol-" + element).style.display = "none";
}

function convert_mb(mb_in) {
	var suffix = 0;
	var mb_suffixes = Array("MB", "GB", "TB");
	while(mb_in > 1024){
		mb_in = mb_in / 1024;
		suffix++;
	}
	if(suffix > 2)
		return "0<span class='size'>MB</span>";	
	return mb_in + "<span class='size'>" + mb_suffixes[suffix] + "</span>";
}