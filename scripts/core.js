function onshow(){
	core.onshow();
}

function onhide(){
	core.onhide();
}

function ISPCore(){
	this.cpuTimer = null;
	this.memoryTimer = null;
	this.disksTimer = null;
	this.networkTimer = null;
	this.uptimeTimer = null;
	this.batteryTimer = null;
	this.tempsTimer = null;
	this.fansTimer = null;
	this.processesTimer = null;
	this.smartTimer = null;
	this.ipTimer = null;
}

ISPCore.prototype.onshow = function(){
	if(p.active){
		return;
	}

	this.startCPUTimer();
	this.startMemoryTimer();
	this.startDisksTimer();
	this.startNetworkTimer();
	this.startUptimeTimer();
	this.startBatteryTimer();
	this.startTempsTimer();
	this.startFansTimer();
	this.startProcessesTimer();
	if(!this.ipTimer)
		this.ipTimer = setInterval("checkExtIPStatus()", 5000);
}

ISPCore.prototype.onhide = function(){
	clearInterval(this.cpuTimer);
	clearInterval(this.memoryTimer);
	clearInterval(this.disksTimer);
	clearInterval(this.networkTimer);
	clearInterval(this.uptimeTimer);
	clearInterval(this.batteryTimer);
	clearInterval(this.tempsTimer);
	clearInterval(this.fansTimer);
	clearInterval(this.processesTimer);
	clearInterval(this.ipTimer);
	
	this.cpuTimer = null;
	this.memoryTimer = null;
	this.disksTimer = null;
	this.networkTimer = null;
	this.uptimeTimer = null;
	this.batteryTimer = null;
	this.tempsTimer = null;
	this.fansTimer = null;
	this.processesTimer = null;
	this.ipTimer = null;
}

ISPCore.prototype.isSectionEnabled = function(section){
	if(p.v("section_status_" + section) == 'off')
		return false;
	return true;
}


ISPCore.prototype.startCPUTimer = function(){
	if(this.isSectionEnabled('cpu')){
		if(!this.cpuTimer){
			this.cpuTimer = setInterval("updateCPU()",1200);
		}
		updateCPU();
	}
}

ISPCore.prototype.startMemoryTimer = function(){
	if(this.isSectionEnabled('memory')){
		if(!this.memoryTimer){
			this.memoryTimer = setInterval("updateMemory()",4000);
		}
		updateMemory();
	}
}

ISPCore.prototype.startDisksTimer = function(){
	if(this.isSectionEnabled('disks')){
		if(!this.disksTimer){
			this.disksTimer = setInterval("updateDisks()",15000);
			updateDisks();
		}
	}
}

ISPCore.prototype.startNetworkTimer = function(){
	if(this.isSectionEnabled('network')){
		if(!this.networkTimer){
			this.networkTimer = setInterval("updateNetwork()",1000);
		}
		updateNetwork();
	}
}

ISPCore.prototype.startUptimeTimer = function(){
	if(this.isSectionEnabled('uptime')){
		if(!this.uptimeTimer){
			this.uptimeTimer = setInterval("updateUptime()",7000);
			updateUptime();
		}
	}
}

ISPCore.prototype.startBatteryTimer = function(){
	if(this.isSectionEnabled('battery')){
		if(!this.batteryTimer){
			this.batteryTimer = setInterval("updateBattery()",4000);
			updateBattery();
		}
	}
}

ISPCore.prototype.startTempsTimer = function(){
	if(this.isSectionEnabled('temps')){
		if(!this.tempsTimer){
			this.tempsTimer = setInterval("updateTemps()",6000);
			updateTemps();
		}
	}
}

ISPCore.prototype.startFansTimer = function(){
	if(this.isSectionEnabled('fans')){
		if(!this.fansTimer){
			this.fansTimer = setInterval("updateFans()",6000);
			updateFans();
		}
	}
}

ISPCore.prototype.startProcessesTimer = function(){
	if(this.isSectionEnabled('processes')){
		if(!this.processesTimer){
			this.processesTimer = setInterval("updateProcesses()",5000);
			updateProcesses();
		}
	}
}

var tooltipAnimator = new AnimationController();

function showTooltip(element){
	if(tooltipAnimator.active)
		tooltipAnimator.cancel();
	document.getElementById(element).style.display = "block";	
	document.getElementById(element).style.opacity = 1;	
}

function hideTooltip(element){
	var fade = new AnimationObject(document.getElementById(element));
	fade.setOptions(kAnimateOptionsHide, 5);
	fade.pushPhase(kAnimateOpacity, 1, 0, 5, 0, null)
	
	tooltipAnimator.purge();
	tooltipAnimator.pushGroup(Array(fade));
	tooltipAnimator.prepare(200, 5);
	tooltipAnimator.run();
}


var valid_ip = false;

var display_prefs_scollarea;
var display_prefs_scollbar;

var extipUpdateNeeded = true;
var forceNetworkLayout = false;


function e(id) {
	return document.getElementById(id);
}

function h(id) {
	e(id).style.display = 'none';
}

var network_icons = Array();
network_icons['ethernet'] = './images/net_icon_ethernet.png';
network_icons['modem'] = './images/net_icon_modem.png';
network_icons['firewire'] = './images/net_icon_firewire.png';
network_icons['bluetooth'] = './images/net_icon_bluetooth.png';
network_icons['airport'] = './images/net_icon_airport4.png';
network_icons['vpn'] = './images/net_icon_vpn.pdf';


var isIntel = iStatPro.isIntel();
var updateCheckerTimer = null;

var setupComplete = false;

var skin_sheets = Array();
var wide_sheets = Array();
wide_sheets['blue'] = './css/wide/blue.css'
wide_sheets['graphite'] = './css/wide/graphite.css'
wide_sheets['green'] = './css/wide/green.css'
wide_sheets['grey'] = './css/wide/grey.css'
wide_sheets['pink'] = './css/wide/pink.css'
wide_sheets['putty'] = './css/wide/putty.css'
wide_sheets['red'] = './css/wide/red.css'
wide_sheets['fire'] = './css/wide/fire.css'
wide_sheets['purple'] = './css/wide/purple.css'

var tall_sheets = Array();
tall_sheets['blue'] = './css/tall/blue.css'
tall_sheets['graphite'] = './css/tall/graphite.css'
tall_sheets['green'] = './css/tall/green.css'
tall_sheets['grey'] = './css/tall/grey.css'
tall_sheets['pink'] = './css/tall/pink.css'
tall_sheets['putty'] = './css/tall/putty.css'
tall_sheets['red'] = './css/tall/red.css'
tall_sheets['fire'] = './css/tall/fire.css'
tall_sheets['purple'] = './css/tall/purple.css'

skin_sheets['wide'] = wide_sheets;
skin_sheets['tall'] = tall_sheets;

var graph_colors = Array();
graph_colors['blue'] = Array("#1B67FA", "#287AFC", "#3690FD", "#3C99FD");
graph_colors['pink'] = Array("#FF45F0", "#FF5BF2", "#FF70F3", "#FE7AF3");
graph_colors['graphite'] = Array("#7C87AA", "#8892B2", "#929BB8", "#969FBB");
graph_colors['grey'] = Array("#ABABAB", "#C2C2C2", "#D8D8D8", "#E2E2E2");
graph_colors['red'] = Array("#9E001E", "#AF0021", "#C60025", "#CD0026");
graph_colors['putty'] = Array("#AB9F84", "#B4A88F", "#BCB29B", "#C0B6A0");
graph_colors['green'] = Array("#84BC00", "#8AC500", "#91CF00", "#92D100");
graph_colors['fire'] = Array("#FF6F0F", "#FA4F0C", "#F62F1F", "#FF081F");
graph_colors['purple'] = Array("#850de1", "#7e04da", "#7700d2", "#7400cd");


function getExtIP(){
	ipURL = 'http://whatsmyip.islayer.com/?random='+new Date().getTime();
	ipConnection = new XMLHttpRequest();
	ipConnection.open("GET",ipURL,true);
	ipConnection.onreadystatechange = function() {
		if(ipConnection.readyState == 4 && ipConnection.responseText != null && ipConnection.responseText.length > 0) {
			extIP = ipConnection.responseText;
			if(extIP.length < 20 && ipConnection.status == 200 && extIP.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)){
				e("wide_extip").innerHTML = extIP;
				e("tall_extip").innerHTML = extIP;
				valid_ip = true;
			} else {
				valid_ip = false;
				e("wide_extip").innerHTML = "Unknown";
				e("tall_extip").innerHTML = "Unknown";
			}
		}
	}
	ipConnection.send(null);
}	

function keyUp(event) {
	if(p.v("skin_type") == 'tall'){
		if(tsk.inDrag)
			return;
	} else {
		if(wsk.inDrag)
			return;
	}

	if(p.active)
		return;
					
	if (event.metaKey || event.altKey)
		return; 
					
	event.stopPropagation();
	event.preventDefault();
	var realKey = String.fromCharCode(event.charCode).toLowerCase();

	if(realKey == "1") {
		widget.setPreferenceForKey("blue","skin_color");
		e("color_sheet").href = skin_sheets[p.v("skin_type")][widget.preferenceForKey("skin_color")];
		updateCPU();
		updateMemory();
		updateNetwork();
	} else if(realKey == "2") {
		widget.setPreferenceForKey("fire","skin_color");
		e("color_sheet").href = skin_sheets[p.v("skin_type")][widget.preferenceForKey("skin_color")];
		updateCPU();
		updateMemory();
		updateNetwork();
	} else if(realKey == "3") {
		widget.setPreferenceForKey("graphite","skin_color");
		e("color_sheet").href = skin_sheets[p.v("skin_type")][widget.preferenceForKey("skin_color")];
		updateCPU();
		updateMemory();
		updateNetwork();
	} else if(realKey == "4") {
		widget.setPreferenceForKey("green","skin_color");
		e("color_sheet").href = skin_sheets[p.v("skin_type")][widget.preferenceForKey("skin_color")];
		updateCPU();
		updateMemory();
		updateNetwork();
	} else if(realKey == "5") {
		widget.setPreferenceForKey("grey","skin_color");
		e("color_sheet").href = skin_sheets[p.v("skin_type")][widget.preferenceForKey("skin_color")];
		updateCPU();
		updateMemory();
		updateNetwork();
	} else if(realKey == "6") {
		widget.setPreferenceForKey("pink","skin_color");
		e("color_sheet").href = skin_sheets[p.v("skin_type")][widget.preferenceForKey("skin_color")];
		updateCPU();
		updateMemory();
		updateNetwork();
	} else if(realKey == "7") {
		widget.setPreferenceForKey("putty","skin_color");
		e("color_sheet").href = skin_sheets[p.v("skin_type")][widget.preferenceForKey("skin_color")];
		updateCPU();
		updateMemory();
		updateNetwork();
	} else if(realKey == "8") {
		widget.setPreferenceForKey("red","skin_color");
		e("color_sheet").href = skin_sheets[p.v("skin_type")][widget.preferenceForKey("skin_color")];
		updateCPU();
		updateMemory();
		updateNetwork();
	} else if(realKey == "9") {
		widget.setPreferenceForKey("purple","skin_color");
		e("color_sheet").href = skin_sheets[p.v("skin_type")][widget.preferenceForKey("skin_color")];
		updateCPU();
		updateMemory();
		updateNetwork();
	} else if(realKey == "c") {
		if(p.v("section_status_cpu") == 'on') {
			clearInterval(core.cpuTimer);
			core.cpuTimer = null;
			widget.setPreferenceForKey("off", "section_status_cpu");
		} else {
			widget.setPreferenceForKey("on", "section_status_cpu");
			core.startCPUTimer();
		}
		updateActiveLayout();
	} else if(realKey == "m") {
		if(p.v("section_status_memory") == 'on') {
			clearInterval(core.memoryTimer);
			core.memoryTimer = null;
			widget.setPreferenceForKey("off", "section_status_memory");
		} else {
			widget.setPreferenceForKey("on", "section_status_memory");
			core.startMemoryTimer();
		}
		updateActiveLayout();
	} else if(realKey == "d") {
		if(p.v("section_status_disks") == 'on') {
			clearInterval(core.disksTimer);
			core.disksTimer = null;
			widget.setPreferenceForKey("off", "section_status_disks");
		} else {
			widget.setPreferenceForKey("on", "section_status_disks");
			core.startDisksTimer();
		}
		updateActiveLayout();
	} else if(realKey == "n") {
		if(p.v("section_status_network") == 'on') {
			clearInterval(core.networkTimer);
			core.networkTimer = null;
			widget.setPreferenceForKey("off", "section_status_network");
		} else {
			widget.setPreferenceForKey("on", "section_status_network");
			core.startNetworkTimer();
		}
		updateActiveLayout();
	} else if(realKey == "p") {
		if(p.v("section_status_processes") == 'on') {
			clearInterval(core.processesTimer);
			core.processesTimer = null;
			widget.setPreferenceForKey("off", "section_status_processes");
		} else {
			widget.setPreferenceForKey("on", "section_status_processes");
			core.startProcessesTimer();
		}
		updateActiveLayout();
	} else if(realKey == "u") {
		if(p.v("section_status_uptime") == 'on') {
			clearInterval(core.uptimeTimer);
			core.uptimeTimer = null;
			widget.setPreferenceForKey("off", "section_status_uptime");
		} else {
			widget.setPreferenceForKey("on", "section_status_uptime");
			core.startUptimeTimer();
		}
		updateActiveLayout();
	} else if(realKey == "b") {
	//	if(iStatPro.isLaptop()){
			if(p.v("section_status_battery") == 'on') {
				clearInterval(core.batteryTimer);
				core.batteryTimer = null;
				widget.setPreferenceForKey("off", "section_status_battery");
			} else {
				widget.setPreferenceForKey("on", "section_status_battery");
				core.startBatteryTimer();
			}
	//	}
		updateActiveLayout();
	} else if(realKey == "f") {
		if(p.v("section_status_fans") == 'on') {
			clearInterval(core.fansTimer);
			core.fansTimer = null;
			widget.setPreferenceForKey("off", "section_status_fans");
		} else {
			widget.setPreferenceForKey("on", "section_status_fans");
			core.startFansTimer();
		}
		updateActiveLayout();
	} else if(realKey == "t") {
		if(p.v("section_status_temps") == 'on') {
			clearInterval(core.tempsTimer);
			core.tempsTimer = null;
			widget.setPreferenceForKey("off", "section_status_temps");
		} else {
			widget.setPreferenceForKey("on", "section_status_temps");
			core.startTempsTimer();
		}
		updateActiveLayout();
	} else if(realKey == "i") {
		if(valid_ip == true){
			iStatPro.copyTextToClipboard(extIP);
			if(p.v("skin_type") == 'tall'){
				e("tall_ipcopied").style.display = "block"
				e("tall_ipcopied").style.opacity = 1;
				setTimeout(function(){tsk.copyIP()}, 1000);
			} else {
				e("wide_ipcopied").style.display = "block"
				e("wide_ipcopied").style.opacity = 1;
				setTimeout(function(){wsk.copyIP()}, 1000);
			}
		}
		return;
	} else if(realKey == "g") {
		getExtIP();
	} else if(realKey == "s") {
		onhide();
		forceNetworkLayout = true;
		switch(p.v("skin_type")){
			case "tall":
				widget.setPreferenceForKey("wide", "skin_type");
				document.getElementById("tall_window").style.display = 'none';
				document.getElementById("wide_window").style.display = 'block';
				widget.setCloseBoxOffset(128, 10)
				tsk.active = false;
				wsk.active = true;
			break	
			case "wide":
				widget.setPreferenceForKey("tall", "skin_type");
				document.getElementById("tall_window").style.display = 'block';
				document.getElementById("wide_window").style.display = 'none';
				widget.setCloseBoxOffset(142, 23)
				wsk.active = false;
				tsk.active = true;
			break	
		}

		e("skin_sheet").href = "./css/" + p.v("skin_type") + ".css";
		e("color_sheet").href = skin_sheets[p.v("skin_type")][p.v("skin_color")];
		onshow();
		updateActiveLayout();
	} else if(realKey == "z") {
		iStatPro.resetBandwidth();
		updateNetwork();
	} 

	
	event.stopPropagation();
	event.preventDefault();
}

function updateActiveLayout(){
	if(p.v("skin_type") == 'tall'){
		tsk.updateLayout();
	} else {
		wsk.updateLayout();
	}
}

function keyDown(event){
	if (event.metaKey)
		return;

	event.stopPropagation();
	event.preventDefault();
}

function checkForUpdate(mode) {
} 

function resizeFront(w, h){
	if(p.active)
		return;	

	if(upd.updateAvailable){
		upd.reposition();
		if(p.v("skin_type") == 'tall'){
			if(h < 160)
				h = 160;
		} else {
			if(w < 350)
				w = 350;
		}
	}
	
	if(document.getElementById("tall_iphone_window").style.display == "block"){
		var tallContainerHeight = parseInt(document.getElementById("tallContentContainer").style.height);
		offset = (tallContainerHeight - 131) / 2;
		if(offset < 0)
			offset = 0;
		document.getElementById('tall_iphone_window').style.top = offset + 'px';

		if(h < 160)
			h = 160;
	}

	if(document.getElementById("wide_iphone_window").style.display == "block"){
		var wideContainerWidth = parseInt(document.getElementById("wideContentContainer").style.width);
		offset = (wideContainerWidth - 218) / 2;
		if(offset < 0)
			offset = 0;
		document.getElementById('wide_iphone_window').style.left = offset + 'px';

		if(w < 350)
			w = 350;
	}
	
	window.resizeTo(w, h);
}


function bt_change_from_plugin() {
	if(p.v("skin_type") == 'tall')
		tsk.updateLayout();
	else
		wsk.updateLayout();
	
	if(core.isSectionEnabled('battery')){
		updateBattery();
	}
}

function network_change_from_plugin() {
	if(core.isSectionEnabled('network')){
		updateNetwork();
	}
}

function disk_change_from_plugin() {
	if(core.isSectionEnabled('disks')){
		updateDisks();
	}
}

function fans_change_from_plugin() {
	if(core.isSectionEnabled('fans')){
		updateFans();
	}
}

function temps_change_from_plugin() {
	if(core.isSectionEnabled('temps')){
		updateTemps();
	}
}

function checkExtIPStatus(){
	if(extipUpdateNeeded == true)
		getExtIP();
	extipUpdateNeeded = false;
}

function resetBandwidth() {
	iStatPro.resetBandwidth();
}

function hideiPhoneWindow(){
	document.getElementById("tall_iphone_window").style.display = "none";
	document.getElementById("wide_iphone_window").style.display = "none";
	p.s("1", "showniphone");
	upd.check(0);
	updateCheckerTimer = setInterval("upd.check(0)",86400000);
}

function toggleProcessesMode(){
	if(p.v("processes_sort_mode") == "cpu"){
		widget.setPreferenceForKey("mem","processes_sort_mode");
	} else {
		widget.setPreferenceForKey("cpu","processes_sort_mode");
	}
	updateProcesses();
}