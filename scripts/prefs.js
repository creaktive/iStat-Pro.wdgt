Array.prototype.toJSON = function() {
    return '[' + this.join(', ') + ']';
}


function PrefsController(){
	this.defaults = {};
	this.defaults['sort_orders'] = "cpu,memory,disks,network,temps,fans,battery,uptime,processes"
	this.defaults['processes_sort_mode'] = 'cpu';
	this.defaults['degrees_type'] = '0';
	this.defaults['skin_color'] = 'blue';
	this.defaults['skin_type'] = 'wide';
	this.defaults['update_check'] = 'on';
	this.defaults['section_status_cpu'] = 'on';
	this.defaults['section_status_memory'] = 'on';
	this.defaults['section_status_disks'] = 'on';
	this.defaults['section_status_network'] = 'on';
	this.defaults['section_status_battery'] = 'on';
	this.defaults['section_status_uptime'] = 'off';
	this.defaults['section_status_temps'] = 'on';
	this.defaults['section_status_fans'] = 'on';
	this.defaults['section_status_processes'] = 'off';
	this.defaults['processes_excludewidgets'] = 'off';
	this.defaults['cpu_graph_mode'] = '1';
	this.defaults['memory_detail_mode'] = '0';
	this.defaults['smart_timer'] = '2';
	
	this.active = false;
	this.selectedTab = 0;
	this.animator = new AnimationController();
	
	this.activeSize = 417;
	this.generalTabHeight = 181;
	this.sectionsTabHeight = 189;
	this.displayTabHeight = 132;

	this.filteredDisks = Array();
	if(widget.preferenceForKey("disk filter")){
		try {
			var tempArray = eval(widget.preferenceForKey("disk filter"));
			this.filteredDisks = tempArray;
		}
		catch(ex){
		}
	}
	for(a=0;a<this.filteredDisks.length;a++){
		this.filteredDisks[a] = this.formatDiskKey(this.filteredDisks[a]);
	}
}

PrefsController.prototype.formatDiskKey = function(key){
	return "'"+key+"'";
}

PrefsController.prototype.isDiskFiltered = function(key){
	for(a=0;a<this.filteredDisks.length;a++){
		if(this.filteredDisks[a] == this.formatDiskKey(key)){
			return true;
		}
	}
	return false;
}

PrefsController.prototype.addDiskToFilter = function(key){
	this.filteredDisks.push(this.formatDiskKey(key));
	widget.setPreferenceForKey(this.filteredDisks.toJSON(), "disk filter");
}

PrefsController.prototype.removeDiskFromFilter = function(key){
	for(x=0;x<this.filteredDisks.length;x++){
		if(this.filteredDisks[x] == this.formatDiskKey(key)){
			this.filteredDisks.splice(x, 1);
			break;
		}
	}
	widget.setPreferenceForKey(this.filteredDisks.toJSON(), "disk filter");
}

PrefsController.prototype.v = function(key){
	if(widget.preferenceForKey(key))
		return widget.preferenceForKey(key);
	if(this.defaults[key])
		return this.defaults[key];
	return null;	
}

PrefsController.prototype.s = function(value, key){
	widget.setPreferenceForKey(value, key);
}

PrefsController.prototype.changeSectionState = function(item, prefKey, nameElement){
	widget.setPreferenceForKey(item.value, "section_status_" + prefKey);
	e(nameElement).innerHTML = item.text;
	
	if(prefKey == 'cpu'){
		wsk.setupCPUBars();
		tsk.setupCPUBars();
	}

	if(prefKey == 'memory'){
		wsk.setupMemoryMode();
		tsk.setupMemoryMode();
	}

	tsk.updateLayout();
	wsk.updateLayout();
}

PrefsController.prototype.selectTab = function(tab){
	upd.hide();
	
	if(tab == this.selectedTab || this.animator.active)
		return;	

	var fromHeight = 0;
	var oldElement;
	if(this.selectedTab == 0){
		 tab_image0.src = "./images/back/tabs_general.png";
		 oldElement = document.getElementById("tab_general");
		 fromHeight = this.generalTabHeight;
	} else if(this.selectedTab == 1){
		 tab_image1.src = "./images/back/tabs_sections.png"
		 oldElement = document.getElementById("tab_sections");
		 fromHeight = this.sectionsTabHeight;
	} else if(this.selectedTab == 2){	
		 tab_image2.src = "./images/back/tabs_display.png"
		 oldElement = document.getElementById("tab_display");
		 fromHeight = this.displayTabHeight;
	}

	this.selectedTab = tab;

	var toHeight = 0;
	var newElement;
	if(tab == 0){
		 newElement = document.getElementById("tab_general");
		 toHeight = this.generalTabHeight;
	} else if(tab == 1){
		 newElement = document.getElementById("tab_sections");
		 toHeight = this.sectionsTabHeight;
	} else if(tab == 2){
		 newElement = document.getElementById("tab_display");
		 toHeight = this.displayTabHeight;
	}
	
	oldElement.style.zIndex = 2;
	newElement.style.zIndex = 1;
	newElement.style.opacity = 1;
	newElement.style.display = "block";

	this.animator.purge();
	this.animator.purgeCallbacks();
	
	var _self = this;
	var resize = new AnimationObject(document.getElementById("backMiddleContainer"));

	var fadeOut = new AnimationObject(oldElement);
	
	if(toHeight > fromHeight){
		fadeOut.setOptions(kAnimateOptionsHide, 10);
		fadeOut.pushPhase(kAnimateOpacity, 1, 0, 10, 0, null)

		resize.setOptions(0, 20);
		resize.pushPhase(kAnimatorResizeHeight, parseInt(document.getElementById("backMiddleContainer").style.height), toHeight, 10, 10, null)
	} else {
		fadeOut.setOptions(kAnimateOptionsHide, 20);
		fadeOut.pushPhase(kAnimateOpacity, 1, 0, 10, 10, null)

		resize.setOptions(0, 10);
		resize.pushPhase(kAnimatorResizeHeight, parseInt(document.getElementById("backMiddleContainer").style.height), toHeight, 10, 0, null)
	}

	this.animator.pushGroup(Array(resize, fadeOut));
	this.animator.prepare(400, 20);


	this.activeSize = toHeight + 63 + 139 + 30;
	if(window.outerHeight < this.activeSize)
		window.resizeTo(376, this.activeSize);

	var _self = this;
	this.animator.pushCallback(function(){ _self.resizeBackAfterAnimation() });
	this.animator.run();


	dc.scrollarea.verticalScrollTo(0)
   	dc.scrollarea.refresh()
   	dc.scrollbar.refresh()
}

PrefsController.prototype.resizeBackAfterAnimation = function(){
	window.resizeTo(376, this.activeSize);
}

PrefsController.prototype.showFront = function(){
	forceNetworkLayout = true;
	upd.hide();
	
	tsk.updateLayout();
	wsk.updateLayout();

	updateCPU();
	updateMemory();	
	updateDisks();
	updateNetwork();
	updateTemps();
	updateFans();
	updateUptime();
	updateBattery();
	updateProcesses();
	
	if(p.v("skin_type") == 'tall') {
		if(window.outerHeight < tsk.sectionSize)
			window.resizeTo(376, tsk.sectionSize);
	} else {
		if(window.outerWidth < wsk.sectionSize){
			window.resizeTo(wsk.sectionSize, window.outerHeight);
		}
	}		
	
	var front = document.getElementById("front");
	var back = document.getElementById("behind");

	if (window.widget)
		widget.prepareForTransition("ToFront");
		front.style.display="block";
		back.style.display="none";
	if (window.widget)
		setTimeout ('widget.performTransition();', 0);


	backside = false;
		
	p.active = false;
	onshow();

	if(p.v("skin_type") == 'tall'){
		tsk.updateLayout();
	} else {
		wsk.updateLayout();
	}
}

PrefsController.prototype.showBack = function(){
	upd.hide();
	this.active = true;
	
	if(p.v("skin_type") == 'wide'){
		back = document.getElementById("behind");
		back.style.left = "120px";
	} else {
		back = document.getElementById("behind");
		back.style.left = "65px";
	}
	
	setup_degrees_menu();
	setup_processes_sort_menu();
	setup_skin_color_menu();
	setup_skin_type_menu();
	setup_smart_timer_menu();
	
	if(window.outerHeight < this.activeSize){
		if(p.v("skin_type") == 'tall') 
			window.resizeTo(376, this.activeSize);
		else
			window.resizeTo(wsk.sectionSize, this.activeSize);
	}
	
	if(window.outerWidth < 376)
		window.resizeTo(376, window.outerHeight);

	if(p.v("update_check") == "on"){
		updateMenuText.innerHTML = "Daily";
		updateCheckerMenu.selectedIndex = 0;
	} else { 
		updateMenuText.innerHTML = "Off";
		updateCheckerMenu.selectedIndex = 1;
	}

	switch(p.v("section_status_cpu")){
		case "on":
			if(p.v("cpu_graph_mode") == "0"){
				cpuModeMenuText.innerHTML = "Bars";
				cpuModeMenu.selectedIndex = 0;
			} else {
				cpuModeMenuText.innerHTML = "Graph";
				cpuModeMenu.selectedIndex = 1;
			}
		break	
		case "off":
			cpuModeMenuText.innerHTML = "Off";
			cpuModeMenu.selectedIndex = 2;
		break	
	}

	switch(p.v("section_status_memory")){
		case "on":
			if(p.v("memory_detail_mode") == "0"){
				memoryModeMenuText.innerHTML = "Simple";
				memoryModeMenu.selectedIndex = 0;
			} else {
				memoryModeMenuText.innerHTML = "Advanced";
				memoryModeMenu.selectedIndex = 1;
			}
		break	
		case "off":
			memoryModeMenuText.innerHTML = "Off";
			memoryModeMenu.selectedIndex = 3;
		break	
	}

	this.updateSectionMenu("section_status_disks", "diskModeMenuText", "diskModeMenu");
	this.updateSectionMenu("section_status_battery", "batteryModeMenuText", "batteryModeMenu");
	this.updateSectionMenu("section_status_network", "networkModeMenuText", "networkModeMenu");
	this.updateSectionMenu("section_status_uptime", "uptimeModeMenuText", "uptimeModeMenu");
	this.updateSectionMenu("section_status_processes", "processesModeMenuText", "processedModeMenu");
	this.updateSectionMenu("section_status_temps", "tempsModeMenuText", "tempsModeMenu");
	this.updateSectionMenu("section_status_fans", "fansModeMenuText", "fansModeMenu");

	if (window.widget)
		widget.prepareForTransition("ToBack");
	
	document.getElementById("front").style.display="none";
	document.getElementById("behind").style.display="block";

	if (window.widget)		
		setTimeout ('widget.performTransition();', 0);	

	window.resizeTo(376, this.activeSize);
	
	if(this.selectedTab == 2)
		setTimeout("dc.changeFromPlugin(dc.selectedFilter);", 1000);

   	dc.scrollarea.refresh()
   	dc.scrollbar.refresh()

	document.getElementById("wideSettingsButton").style.display = "none";
	document.getElementById("wideHelpButton").style.display = "none";
	document.getElementById("wideActivityMonButton").style.display = "none";
	document.getElementById("tallSettingsButton").style.display = "none";
	document.getElementById("tallHelpButton").style.display = "none";
	document.getElementById("tallActivityMonButton").style.display = "none";
}

PrefsController.prototype.updateSectionMenu = function(key, label, menu){
	switch(p.v(key)){
		case "on":
			document.getElementById(label).innerHTML = "On";
			document.getElementById(menu).selectedIndex = 0;
		break	
		case "off":
			document.getElementById(label).innerHTML = "Off";
			document.getElementById(menu).selectedIndex = 1;
		break
	}	
}




function changeProcessesSortMode(item) {
	widget.setPreferenceForKey(item.value,"processes_sort_mode");
	processesMenuText.innerHTML = item.text;	
}
	
function changeDegrees(pref) {
	widget.setPreferenceForKey(pref,"degrees_type");
	if(widget.preferenceForKey("degrees_type") == 0)
		degreesMenuText.innerHTML = "Celsius";
	else if(widget.preferenceForKey("degrees_type") == 1)
		degreesMenuText.innerHTML = "Fahrenheit";
	else if(widget.preferenceForKey("degrees_type") == 2)
		degreesMenuText.innerHTML = "Kelvin";
}

function changeUpdateChecker(item) {
	widget.setPreferenceForKey(item.value,"update_check");
	updateMenuText.innerHTML = item.text;		
}

function changeSmartTimer(newTimer) {
	widget.setPreferenceForKey(newTimer.value, "smart_timer");
	setup_smart_timer_menu();
	clearInterval(smart_timer);
	smart_timer = null;
	switch(p.v("smart_timer")){
		case "1":
			smart_timer = setInterval("updateSMART()",300000);
		break	
		case "2":
			smart_timer = setInterval("updateSMART()",900000);
		break	
		case "3":
			smart_timer = setInterval("updateSMART()",3600000);
		break	
	}	

	if(p.v("smart_timer") != '0')
		iStatPro.setShouldMonitorSMARTTemps(1)
	else
		iStatPro.setShouldMonitorSMARTTemps(0)
}

function changeSkinColor(item) {
	widget.setPreferenceForKey(item.value,"skin_color");
	skinColorMenuText.innerHTML = item.text;		
	e("color_sheet").href = skin_sheets[p.v("skin_type")][widget.preferenceForKey("skin_color")];
}

function changeSkinType(item) {
	widget.setPreferenceForKey(item.value,"skin_type");
	e("skin_sheet").href = "./css/" + p.v("skin_type") + ".css";
	e("color_sheet").href = skin_sheets[p.v("skin_type")][p.v("skin_color")];
	skinTypeMenuText.innerHTML = item.text;		
	switch(p.v("skin_type")){
		case "tall":
			document.getElementById("tall_window").style.display = 'block';
			document.getElementById("wide_window").style.display = 'none';
			widget.setCloseBoxOffset(142, 23)
			wsk.active = false;
			tsk.active = true;
		break	
		case "wide":
			document.getElementById("tall_window").style.display = 'none';
			document.getElementById("wide_window").style.display = 'block';
			widget.setCloseBoxOffset(128, 10)
			wsk.active = true;
			tsk.active = false;
		break	
	}
}	

function setup_processes_sort_menu() {
	if(p.v("processes_sort_mode") == "cpu")
		e("processesMenuText").innerHTML = "CPU Usage";
	else {
		e("processesMenuText").innerHTML = "Memory Usage";
		e("processesMenu").selectedIndex = 1;
	}
}

function setup_degrees_menu() {
	if(p.v("degrees_type") == 0)
		e("degreesMenuText").innerHTML = "Celsius";
	else if(p.v("degrees_type") == 1)
		e("degreesMenuText").innerHTML = "Fahrenheit";
	else if(p.v("degrees_type") == 2)
		e("degreesMenuText").innerHTML = "Kelvin";
			
	e("degreesMenu").selectedIndex = p.v("degrees_type");
}

function setup_skin_color_menu() {
	switch(p.v("skin_color")){
		case "blue":
			e("skinColorMenuText").innerHTML = "Blue";
			e("skinColorMenu").selectedIndex = 0;
		break	
		case "fire":
			e("skinColorMenuText").innerHTML = "Fire";
			e("skinColorMenu").selectedIndex = 1;
		break	
		case "graphite":
			e("skinColorMenuText").innerHTML = "Graphite";
			e("skinColorMenu").selectedIndex = 2;
		break	
		case "green":
			e("skinColorMenuText").innerHTML = "Green";
			e("skinColorMenu").selectedIndex = 3;
		break	
		case "grey":
			e("skinColorMenuText").innerHTML = "Grey";
			e("skinColorMenu").selectedIndex = 4;
		break	
		case "pink":
			e("skinColorMenuText").innerHTML = "Pink";
			e("skinColorMenu").selectedIndex = 5;
		break
		case "putty":
			e("skinColorMenuText").innerHTML = "Putty";
			e("skinColorMenu").selectedIndex = 7;
		break
		case "red":
			e("skinColorMenuText").innerHTML = "Red";
			e("skinColorMenu").selectedIndex = 8;
		break
		case "purple":
			e("skinColorMenuText").innerHTML = "Purple";
			e("skinColorMenu").selectedIndex = 6;
		break
	}
}

function setup_skin_type_menu() {
	switch(p.v("skin_type")){
		case "tall":
			e("skinTypeMenuText").innerHTML = "Tall";
			e("skinTypeMenu").selectedIndex = 0;
		break	
		case "wide":
			e("skinTypeMenuText").innerHTML = "Wide";
			e("skinTypeMenu").selectedIndex = 1;
		break	
	}
}

function setup_smart_timer_menu() {
	switch(p.v("smart_timer")){
		case "0":
			e("smartTimerMenuText").innerHTML = "Off";
			e("smartTimerMenu").selectedIndex = 0;
		break	
		case "1":
			e("smartTimerMenuText").innerHTML = "5 mins";
			e("smartTimerMenu").selectedIndex = 1;
		break	
		case "2":
			e("smartTimerMenuText").innerHTML = "15 mins";
			e("smartTimerMenu").selectedIndex = 2;
		break	
		case "3":
			e("smartTimerMenuText").innerHTML = "60 mins";
			e("smartTimerMenu").selectedIndex = 3;
		break	
	}
}