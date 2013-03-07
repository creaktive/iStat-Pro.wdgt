function setup() {
	tdc.setup();
	wdc.setup();
	dc.setup();
	iStatPro.readyForNotifications();
	
	if(p.v("smart_timer") != '0')
		iStatPro.setShouldMonitorSMARTTemps(1)

	e("skin_sheet").href = "./css/" + p.v("skin_type") + ".css";
	e("color_sheet").href = skin_sheets[p.v("skin_type")][p.v("skin_color")];

	if(p.v("skin_type") == 'tall'){
		tsk.active = true;
		document.getElementById("tall_window").style.display = 'block';
		widget.setCloseBoxOffset(128, 4)
	} else {
		wsk.active = true;
		document.getElementById("wide_window").style.display = 'block';
		widget.setCloseBoxOffset(8, 5)
	}
	
	if(!p.v("showniphone")){
		if(p.v("skin_type") == 'tall')
			document.getElementById("tall_iphone_window").style.display = "block";
		else
			document.getElementById("wide_iphone_window").style.display = "block";
	} else {
		upd.check(0);
		updateCheckerTimer = setInterval("upd.check(0)",86400000);
	}
	
	if(!iStatPro.isLaptop() && !iStatPro.hasBTMouse() && !iStatPro.hasBTKeyboard()){
		e("wide_battery").style.display = "none";
		e("wide_battery").style.width = 0;
	}
	
	if(!iStatPro.isLaptop()){
		e("wide_battery").style.width = 65;
		e("tall_battery_container").style.display = "none";
		e("wide_battery_container").style.display = "none";
		e("wide_mouse_percentage_container").style.left = -3;	
		e("wide_kb_percentage_container").style.left = -3;
		e("tall_bt_container").style.top = 14;
	} else {
		e("wide_mouse_percentage_container").style.top = 89;	
		e("wide_kb_percentage_container").style.top = 89;
	}
	
		
	tsk.setup();
	tsk.setupCPUBars();
	tsk.setupMemoryMode();
	tsk.updateLayout();

	wsk.setup();
	wsk.setupCPUBars();
	wsk.setupMemoryMode();
	wsk.updateLayout();

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
	
	forceNetworkLayout = true;
	onshow();
	
	if(p.v("skin_type") == 'tall'){
		tsk.updateLayout();
		widget.setCloseBoxOffset(142, 23)
	} else {
		wsk.updateLayout();
		widget.setCloseBoxOffset(128, 10)
	}
	setupComplete = true;


	if(!widget.onhide)
		widget.onhide = onhide;
	if(!widget.onshow)
		widget.onshow = onshow;

	setTimeout("checkExtIPStatus()", 2000);
	document.addEventListener("keyup", keyUp, true);
	document.addEventListener("keydown", keyDown, true);

	dc.buildDisksFilter();
	
	var preloader = document.createElement('img');
	preloader.src = "./images/button_netdisconnect.png";
	
	document.getElementById("behind").style.display = "none";
	document.getElementById("behind").style.opacity = 1;
}

function updateCPU() {
	if(p.v("skin_type") == 'tall')
		tsk.updateCPU();
	else
		wsk.updateCPU();
}

function updateMemory() {
	if(p.v("skin_type") == 'tall')
		tsk.updateMemory();
	else
		wsk.updateMemory();
}

function updateDisks() {
	if(p.v("skin_type") == 'tall')
		tsk.updateDisks();
	else
		wsk.updateDisks();
}

function updateNetwork() {
	var needsUpdate = false;
	if(iStatPro.hasNetworkSetupChanged()){
		needsUpdate = true;
		extipUpdateNeeded = true;
	}

	if(p.v("skin_type") == 'tall')
		tsk.updateNetwork(needsUpdate);
	else
		wsk.updateNetwork(needsUpdate);
}

function updateTemps() {
	if(p.v("skin_type") == 'tall')
		tsk.updateTemperatures();
	else
		wsk.updateTemperatures();
}

function updateFans() {
	if(p.v("skin_type") == 'tall')
		tsk.updateFans();
	else
		wsk.updateFans();
}

function updateUptime() {
	if(p.v("skin_type") == 'tall')
		tsk.updateUptime();
	else
		wsk.updateUptime();
}

function updateBattery() {
	if(iStatPro.hasBtSetupChanged()) {
		if(p.v("skin_type") == 'tall')
			tsk.updateLayout();
		else
			wsk.updateLayout();
	}
		
	if(p.v("skin_type") == 'tall')
		tsk.updateBattery();
	else
		wsk.updateBattery();
}

function updateProcesses() {
	if(p.v("skin_type") == 'tall')
		tsk.updateProcesses();
	else
		wsk.updateProcesses();
}

function updateSMART() {
	iStatPro.setNeedsSMARTUpdate();
}