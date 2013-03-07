function TallNetworkObject(data){
	this.service = data[0];
	this.isPPP = false;
	this.bsdName = data[1];
	if(data[5].length > 0){
		this.isPPP = true;
		this.lastPPPStatus = -1
	}
	
	var _self = this;

	this.container = document.createElement('div');
	if(this.isPPP)
		this.container.setAttribute ("style", "top:0px;left:20px;position:absolute;height:96px;width:125px;overflow:hidden;");
	else
		this.container.setAttribute ("style", "top:0px;left:20px;position:absolute;height:85px;width:125px;overflow:hidden");
	document.getElementById("tall_network_container").appendChild(this.container);
	
	this.name = document.createElement('div');
	this.name.setAttribute ("class", "ellipsis");
	this.name.setAttribute ("style", "position:absolute;top:0px;color:white;margin-left:27px;color:white;width:95px;");
	if(data[1])
		this.name.innerHTML = data[4] + " - " + data[1];
	else
		this.name.innerHTML = data[4]
	this.container.appendChild(this.name);

	this.ipContainer;
	if(this.isPPP){
		this.container.onmouseout = function(){ _self.hideDisconnect();}
		this.ipContainer = document.createElement('div');
		this.ipContainer.setAttribute ("style", "width:125px;position:absolute;top:27px;color:white;margin-left:0px;color:white;");
		this.ipContainer.setAttribute ("class", "ellipsis");
		this.container.appendChild(this.ipContainer);

		var ip_title = document.createElement('span');
		ip_title.setAttribute ("style", "color:#838383;");
		ip_title.innerHTML = 'IP:&nbsp;';
		this.ipContainer.appendChild(ip_title);

	}

	this.ip = document.createElement('span');
	if(this.isPPP){
		this.ip.setAttribute ("style", "color:white;");
		this.ipContainer.appendChild(this.ip);
	} else {
		this.ip.setAttribute ("style", "width:95px;position:absolute;top:11px;color:white;margin-left:27px;color:white;");
		this.container.appendChild(this.ip);
	}
	
	this.rxContainer = document.createElement('div');
	if(this.isPPP > 0)
		this.rxContainer.setAttribute ("style", "width:125px;position:absolute;top:52px;color:white;margin-left:0px;color:white;");
	else
		this.rxContainer.setAttribute ("style", "width:125px;position:absolute;top:27px;color:white;margin-left:0px;color:white;");
	this.rxContainer.setAttribute ("class", "ellipsis");
	this.container.appendChild(this.rxContainer);

	var rx_title = document.createElement('span');
	rx_title.setAttribute ("style", "color:#838383;");
	rx_title.innerHTML = 'In:&nbsp;';
	this.rxContainer.appendChild(rx_title);

	this.rxCurrent = document.createElement('span');
	this.rxCurrent.innerHTML = '0kb/s';
	this.rxContainer.appendChild(this.rxCurrent);

	var rx_total_pre = document.createElement('span');
	rx_total_pre.innerHTML = ' (';
	this.rxContainer.appendChild(rx_total_pre);

	this.rxTotal = document.createElement('span');
	this.rxTotal.innerHTML = '0mb';
	this.rxContainer.appendChild(this.rxTotal);
	
	var rx_total_suf = document.createElement('span');
	rx_total_suf.innerHTML = ')';
	this.rxContainer.appendChild(rx_total_suf);
				
	this.txContainer = document.createElement('div');
	this.txContainer.setAttribute ("class", "ellipsis");
	if(this.isPPP)
		this.txContainer.setAttribute ("style", "width:125px;position:absolute;top:63px;color:white;margin-left:0px;color:white;");
	else
		this.txContainer.setAttribute ("style", "width:125px;position:absolute;top:38px;color:white;margin-left:0px;color:white;");
	this.container.appendChild(this.txContainer);

	var tx_title = document.createElement('span');
	tx_title.setAttribute ("style", "color:#838383;");
	tx_title.innerHTML = 'Out:&nbsp;';
	this.txContainer.appendChild(tx_title);

	this.txCurrent = document.createElement('span');
	this.txCurrent.innerHTML = '0kb/s';
	this.txContainer.appendChild(this.txCurrent);

	var tx_total_pre = document.createElement('span');
	tx_total_pre.innerHTML = ' (';
	this.txContainer.appendChild(tx_total_pre);

	this.txTotal = document.createElement('span');
	this.txTotal.innerHTML = '0mb';
	this.txContainer.appendChild(this.txTotal);
	
	var tx_total_suf = document.createElement('span');
	tx_total_suf.innerHTML = ')';
	this.txContainer.appendChild(tx_total_suf);

	if(this.isPPP){
		this.pppToggle = document.createElement('div');
		this.pppToggle.setAttribute("class", "pppconnect");
		this.pppToggle.setAttribute ("style", "top:30px;left:4px;");
		this.pppToggle.onclick = function(){ _self.toggle();};
		this.container.appendChild(this.pppToggle);
		
		this.pppStatusContainer = document.createElement('div');
		this.pppStatusContainer.setAttribute ("style", "margin-left:27px;width:70px;");
		this.pppStatusContainer.setAttribute ("class", "line line1 ellipsis");
		this.container.appendChild(this.pppStatusContainer);

		this.pppTimeContainer = document.createElement('div');
		this.pppTimeContainer.setAttribute ("style", "width:110px;top:38px");
		this.pppTimeContainer.setAttribute ("class", "line ellipsis");
		this.container.appendChild(this.pppTimeContainer);

		var ppptime_title = document.createElement('span');
		ppptime_title.setAttribute ("style", "color:#838383;");
		ppptime_title.innerHTML = 'Time:&nbsp;';
		this.pppTimeContainer.appendChild(ppptime_title);

		this.pppTime = document.createElement('span');
		this.pppTimeContainer.appendChild(this.pppTime);
	}
	
	var icon = document.createElement('img');
	icon.setAttribute ("style", "height:20px;width:22px;position:absolute;top:2px;left:0px;z-index:10;");
	this.container.appendChild(icon);
	var the_icon;
	if(network_icons[data[2].toLowerCase()]) {
		the_icon = network_icons[data[2].toLowerCase()]
	} else {
		the_icon = network_icons['ethernet']
	}
	icon.src = the_icon;

	if(this.isPPP){
		this.iconDisconnect = document.createElement('div');
		this.iconDisconnect.setAttribute ("style", "display:none;left:-1px;height:21px;width:24px;position:absolute;top:2px;z-index:10;");
		this.container.appendChild(this.iconDisconnect);
		this.iconDisconnect.onclick = function(){ _self.toggle();};
		this.iconDisconnect.setAttribute ("class", "pppdisconnectOverlay");
	}

	this.canvas = document.createElement('canvas');
	if(this.isPPP)
		this.canvas.setAttribute ("style", "width:126px;height:27px;display:block;left:0px;position:absolute;top:80px;z-index:10;");
	else
		this.canvas.setAttribute ("style", "width:126px;height:27px;display:block;left:0px;position:absolute;top:55px;z-index:10;");
	this.canvas.width = 126;
	this.canvas.height = 27;
	this.canvas.setAttribute ("class", "smallcanvas");
	this.container.appendChild(this.canvas);

	this.divider = document.createElement('div');
	this.divider.setAttribute ("class", "inlinedivider");
	document.getElementById("tall_network_container").appendChild(this.divider);
}

TallNetworkObject.prototype.updateWithData = function(data){
	this.ip.innerText = data[3];
	this.rxCurrent.innerHTML = data[6][0];	
	this.txCurrent.innerHTML = data[6][1];	
	this.rxTotal.innerHTML = data[6][2];	
	this.txTotal.innerHTML = data[6][3];	
	

	var historyData = iStatPro.historyForInterface(this.bsdName);
	if(historyData.length > 0){
		var peak = 0;
		for(x=0;x<73;x++){
			var rx = historyData[historyData.length - x - 1][0] * 1;
			if(rx > peak)
				peak = rx;
		}
		
		if(peak == 0){
			for(x=0;x<73;x++){
				var tx = historyData[historyData.length - x - 1][1] * 1;
				if(tx > peak)
					peak = tx;
			}
		}
		
	    var context = this.canvas.getContext("2d");
	 	context.lineWidth = 1.5;
	  	context.clearRect(0, 0, 126, 27);
						
		context.save();
		context.translate (126, 27);
		context.rotate(3.14159265359)
		context.moveTo(0, 0);
		for(x=0;x<73;x++){
			var tx = historyData[historyData.length - x - 1][1] * 1;
			tx = tx / peak;
			context.lineTo(x * 2, tx * 25);
		}
					
		context.lineTo (x * 2, 0);
	
		try {
			context.strokeStyle = "#838383";
			context.stroke
			context.stroke();
		}
		catch(ex){ }
		context.restore();
		
		
		
		context.save();
		context.translate (126, 27);
		context.rotate(3.14159265359)
		context.moveTo(0, 0);
		
		for(x=0;x<73;x++){
			var rx = historyData[historyData.length - x - 1][0] * 1;
			rx = rx / peak;
			context.lineTo(x * 2, rx * 25);
		}
					
		context.lineTo (x * 2, 0);
	
		try {
			context.strokeStyle = graph_colors[p.v("skin_color")][2];
			context.stroke
			context.stroke();
		}
		catch(ex){ }
		context.restore();
	}

	if(!this.isPPP)
		return;
		
	this.pppTime.innerHTML = data[5][1];

	var _self = this;

	var newPPPStatus = data[5][0];
	if(newPPPStatus == this.lastPPPStatus)
		return;
	
	this.lastPPPStatus = newPPPStatus;
	var status = ""
	switch(this.lastPPPStatus){
		case 0:
			status = "Idle";
		break;
		case 1:
		case 2:
		case 3:
		case 6:
		case 7:
		case 9:
		case 11:
		case 12:
		case 13:
			status = "Connecting";
		break;
		case 4:
			status = "Establishing";
		break;
		case 5:
			status = "Authenticating";
		break;
		case 8:
			status = "Connected";
		break;
		case 10:
			status = "Disconnecting";
		break;
		default:
			status = "Unknown";
		break;
	}
	this.pppStatusContainer.innerText = status;
	if(this.lastPPPStatus == 8){
		this.pppTimeContainer.style.display = "block";
		this.ipContainer.style.display = "block";
		this.rxContainer.style.display = "block";
		this.txContainer.style.display = "block";
		this.container.style.height = "107px"
		this.pppToggle.style.display = "none";
		this.container.onmouseover = function(){ _self.showDisconnect();}
	} else {
		this.pppTimeContainer.style.display = "none";
		this.ipContainer.style.display = "none";
		this.rxContainer.style.display = "none";
		this.txContainer.style.display = "none";
		this.container.style.height = "45px"
		this.pppToggle.style.display = "block";
		this.container.onmouseover = function(){ }
		this.hideDisconnect();
	}

	if(this.lastPPPStatus != 8){
		if(this.lastPPPStatus == 0)
			this.pppToggle.setAttribute("class", "pppconnect");
		else
			this.pppToggle.setAttribute("class", "pppdisconnect");
	}
}

TallNetworkObject.prototype.showDisconnect = function(){
	this.iconDisconnect.style.display = "block";
}

TallNetworkObject.prototype.hideDisconnect = function(){
	this.iconDisconnect.style.display = "none";
}

TallNetworkObject.prototype.toggle = function(){
	iStatPro.togglePPP(this.service);
	this.hideDisconnect();
}

function WideNetworkObject(data){
	this.service = data[0];
	this.bsdName = data[1];
	this.isPPP = false;
	if(data[5].length > 0){
		this.isPPP = true;
		this.lastPPPStatus = -1
	}
	
	var _self = this;

	this.container = document.createElement('div');
	this.container.setAttribute ("style", "position:absolute;top:0px;height:115px;width:116px;overflow:hidden");
	document.getElementById("wide_network_container").appendChild(this.container);
		
	this.name = document.createElement('div');
	this.name.setAttribute ("style", "margin-left:27px;width:83px");
	this.name.setAttribute ("class", "line line1 ellipsis");
	if(data[1])
		this.name.innerHTML = data[4] + " - " + data[1];
	else
		this.name.innerHTML = data[4]
	this.container.appendChild(this.name);

	if(this.isPPP){
		this.container.onmouseout = function(){ _self.hideDisconnect();}
		this.pppToggle = document.createElement('div');
		this.pppToggle.setAttribute ("class", "pppconnect");
		this.pppToggle.setAttribute ("style", "position:absolute;top:65px;");
		this.pppToggle.onclick = function(){ _self.toggle();};
		this.container.appendChild(this.pppToggle);
	}
				
	this.ip;
		this.ip = document.createElement('div');
		this.ip.setAttribute ("style", "margin-left:27px;width:90px;");
		this.ip.setAttribute ("class", "line line2 ellipsis");
		this.ip.innerHTML = data[3];
		this.container.appendChild(this.ip);
	
	this.rxContainer = document.createElement('div');
	this.rxContainer.setAttribute ("style", "width:110px;");
	this.rxContainer.setAttribute ("class", "line line3 ellipsis");
	this.container.appendChild(this.rxContainer);

	var rx_title = document.createElement('span');
	rx_title.setAttribute ("style", "color:#838383;");
	rx_title.innerHTML = 'In:&nbsp;';
	this.rxContainer.appendChild(rx_title);

	this.rxCurrent = document.createElement('span');
	this.rxCurrent.innerHTML = '0kb/s';
	this.rxContainer.appendChild(this.rxCurrent);

	this.txContainer = document.createElement('div');
	this.txContainer.setAttribute ("style", "width:110px;");
	this.txContainer.setAttribute("class", "line line4 ellipsis");
	this.container.appendChild(this.txContainer);

	var tx_title = document.createElement('span');
	tx_title.setAttribute ("style", "color:#838383;");
	tx_title.innerHTML = 'Out:&nbsp;';
	this.txContainer.appendChild(tx_title);

	this.txCurrent = document.createElement('span');
	this.txCurrent.innerHTML = '0kb/s';
	this.txContainer.appendChild(this.txCurrent);
	
	var rxtotal_bandwidth;
	var txtotal_bandwidth;

		var rxtotal_title = document.createElement('span');
		rxtotal_title.innerHTML = '&nbsp;(';
		this.rxContainer.appendChild(rxtotal_title);

		this.rxTotal = document.createElement('span');
		this.rxTotal.innerHTML = '0kb/s';
		this.rxContainer.appendChild(this.rxTotal);

		var rxtotal_end = document.createElement('span');
		rxtotal_end.innerHTML = ')';
		this.rxContainer.appendChild(rxtotal_end);

		var txtotal_title = document.createElement('span');
		txtotal_title.innerHTML = '&nbsp;(';
		this.txContainer.appendChild(txtotal_title);

		this.txTotal = document.createElement('span');
		this.txTotal.innerHTML = '0kb/s';
		this.txContainer.appendChild(this.txTotal);

		var txtotal_end = document.createElement('span');
		txtotal_end.innerHTML = ')';
		this.txContainer.appendChild(txtotal_end);

	if(this.isPPP){

		this.pppTimeContainer = document.createElement('div');
		this.pppTimeContainer.setAttribute ("style", "width:110px;");
		this.pppTimeContainer.setAttribute ("class", "line line5 ellipsis");
		this.container.appendChild(this.pppTimeContainer);

		var ppptime_title = document.createElement('span');
		ppptime_title.setAttribute ("style", "color:#838383;");
		ppptime_title.innerHTML = 'Time:&nbsp;';
		this.pppTimeContainer.appendChild(ppptime_title);

		this.pppTime = document.createElement('span');
		this.pppTimeContainer.appendChild(this.pppTime);
	} else {
	}
	
	var icon = document.createElement('img');
	icon.setAttribute ("style", "left:0px;height:20px;width:22px;position:absolute;top:22px;z-index:10;");
	this.container.appendChild(icon);
	var the_icon;
	if(network_icons[data[2].toLowerCase()]) {
		the_icon = network_icons[data[2].toLowerCase()]
	} else {
		the_icon = network_icons['ethernet']
	}
	icon.src = the_icon;
	
	if(this.isPPP){
		this.iconDisconnect = document.createElement('div');
		this.iconDisconnect.setAttribute ("style", "display:none;left:-1px;height:21px;width:24px;position:absolute;top:22px;z-index:10;");
		this.container.appendChild(this.iconDisconnect);
		this.iconDisconnect.onclick = function(){ _self.toggle();};
		this.iconDisconnect.setAttribute ("class", "pppdisconnectOverlay");
	}

	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute ("style", "width:116px;height:27px;display:block;left:0px;position:absolute;top:80px;z-index:10;");
	this.canvas.width = 116;
	this.canvas.height = 27;
	this.canvas.setAttribute ("class", "smallcanvas");
	this.container.appendChild(this.canvas);

	this.divider = document.createElement('div');
	this.divider.setAttribute ("class", "inlinedivider");
	document.getElementById("wide_network_container").appendChild(this.divider);
}

WideNetworkObject.prototype.toggle = function(){
	iStatPro.togglePPP(this.service);
	this.hideDisconnect();
}

WideNetworkObject.prototype.updateWithData = function(data){
	if(this.isPPP == false || (this.isPPP == true && this.lastPPPStatus == 8))
		this.ip.innerText = data[3];
	this.rxCurrent.innerHTML = data[6][0];	
	this.txCurrent.innerHTML = data[6][1];	
	this.rxTotal.innerHTML = data[6][2];	
	this.txTotal.innerHTML = data[6][3];	



	var historyData = iStatPro.historyForInterface(this.bsdName);
	if(historyData.length > 0){
		var peak = 0;
		for(x=0;x<58;x++){
			var rx = historyData[historyData.length - x - 1][0] * 1;
			if(rx > peak)
				peak = rx;
		}
		
		if(peak == 0){
			for(x=0;x<58;x++){
				var tx = historyData[historyData.length - x - 1][1] * 1;
				if(tx > peak)
					peak = tx;
			}
		}
		
	    var context = this.canvas.getContext("2d");
	 	context.lineWidth = 1.5;
	    context.clearRect(0, 0, 116, 27);
						
		context.save();
		context.translate (116, 27);
		context.rotate(3.14159265359)
		l = 0;
		for(x=0;x<58;x++){
			var tx = historyData[historyData.length - x - 1][1] * 1;
			tx = tx / peak;
			if(x == 0)
				context.moveTo(0, tx * 25);
			context.lineTo(x * 2, tx * 25);
			l = tx * 25;
		}
					
		context.lineTo (x * 2, l);
	
		try {
			context.strokeStyle = "#838383";
			context.stroke
			context.stroke();
		}
		catch(ex){ }
		context.restore();
		
		
		
		context.save();
		context.translate (116, 27);
		context.rotate(3.14159265359)
		
		l = 0;
		for(x=0;x<58;x++){
			var rx = historyData[historyData.length - x - 1][0] * 1;
			rx = rx / peak;
			if(x == 0)
				context.moveTo(0, rx * 25);
			context.lineTo(x * 2, rx * 25);
			l = rx * 25;
		}
					
		context.lineTo (x * 2, l);
	
		try {
			context.strokeStyle = graph_colors[p.v("skin_color")][2];//lingrad;
			context.stroke
			context.stroke();
		}
		catch(ex){ }
		context.restore();
	}

	
	if(!this.isPPP)
		return;

	this.pppTime.innerHTML = data[5][1];

	var _self = this;

	var newPPPStatus = data[5][0];
	if(newPPPStatus == this.lastPPPStatus)
		return;
	
	this.lastPPPStatus = newPPPStatus;
	var status = ""
	switch(this.lastPPPStatus){
		case 0:
			status = "Idle";
		break;
		case 1:
		case 2:
		case 3:
		case 6:
		case 7:
		case 9:
		case 11:
		case 12:
		case 13:
			status = "Connecting";
		break;
		case 4:
			status = "Establishing";
		break;
		case 5:
			status = "Authenticating";
		break;
		case 8:
			status = "Connected";
		break;
		case 10:
			status = "Disconnecting";
		break;
		default:
			status = "Unknown";
		break;
	}
	if(this.lastPPPStatus != 8)
		this.ip.innerText = status;
	
	if(this.lastPPPStatus == 8){
		this.pppTimeContainer.style.display = "block";
		this.canvas.style.display = "block";
		this.rxContainer.style.display = "block";
		this.txContainer.style.display = "block";
		this.pppToggle.style.display = "none";
		this.container.onmouseover = function(){ _self.showDisconnect();}
	} else {
		this.pppTimeContainer.style.display = "none";
		this.canvas.style.display = "none";
		this.rxContainer.style.display = "none";
		this.txContainer.style.display = "none";
		this.pppToggle.style.display = "block";
		this.container.onmouseover = function(){ }
		this.hideDisconnect();
	}

	if(this.lastPPPStatus != 8){
		if(this.lastPPPStatus == 0)
			this.pppToggle.setAttribute("class", "pppconnect");
		else
			this.pppToggle.setAttribute("class", "pppdisconnect");
	}
}

WideNetworkObject.prototype.showDisconnect = function(){
	this.iconDisconnect.style.display = "block";
}

WideNetworkObject.prototype.hideDisconnect = function(){
	this.iconDisconnect.style.display = "none";
}