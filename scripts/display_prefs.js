function FilterItem(callback, key, displayname, enabled){
	this.callback = callback;
	this.key = key
	var _self = this;
	this.isDisk = false;
	
	var container = document.createElement("div");
	container.setAttribute("style", 'clear:both;position:relative;height:17px;overflow:hidden;width:149px;');
	document.getElementById("display_scrollarea").appendChild(container);
	
	var name = document.createElement("div");
	name.innerText = displayname;
	name.setAttribute("class", 'ellipsis');
	name.setAttribute("style", 'position:absolute;left:18px;top:2px;height:17px;width:107px;');
	container.appendChild(name);

	this.checkboxFaux = document.createElement("div");
	if(enabled)
		this.checkboxFaux.setAttribute("style", 'background-image:url(./images/back/checkbox_on.png);height:15px;width:15px;position:absolute;left:1px;top:1px;');
	else
		this.checkboxFaux.setAttribute("style", 'background-image:url(./images/back/checkbox_off.png);height:15px;width:15px;position:absolute;left:1px;top:1px;');
	container.appendChild(this.checkboxFaux);

	this.checkbox = document.createElement("input");
	this.checkbox.type = "checkbox";
	this.checkbox.setAttribute("style", '');
	this.checkbox.onclick = function(){ _self.toggle();}
	this.checkbox.checked = enabled;
	container.appendChild(this.checkbox);
}

FilterItem.prototype.toggle = function(){
	if(this.isDisk){
		if(this.checkbox.checked == true) {
			p.removeDiskFromFilter(this.key);
			this.checkboxFaux.style.background = 'url(./images/back/checkbox_on.png)';	
		} else {
			p.addDiskToFilter(this.key);
			this.checkboxFaux.style.background = 'url(./images/back/checkbox_off.png)';	
		}
		return;
	}
	
	if(this.checkbox.checked == true) {
		widget.setPreferenceForKey('on', this.key);
		this.checkboxFaux.style.background = 'url(./images/back/checkbox_on.png)';	
	} else {
		widget.setPreferenceForKey('off', this.key);
		this.checkboxFaux.style.background = 'url(./images/back/checkbox_off.png)';	
	}
}

function DisplayPreferenceController(){
	this.selectedFilter = 0;
}

DisplayPreferenceController.prototype.setup = function(part){
    this.scrollbar = new AppleVerticalScrollbar(document.getElementById("display_scroller"));
    this.scrollarea = new AppleScrollArea(document.getElementById("display_scrollarea"));
    this.scrollarea.addScrollbar(this.scrollbar);
}

DisplayPreferenceController.prototype.changeFromPlugin = function(part){
	if(p.selectedTab != 2 || !p.active)
		return;
	
	if(part == 0 && this.selectedFilter == 0)
		this.buildDisksFilter();	

	if(part == 1 && this.selectedFilter == 1)
		this.buildNetworkFilter();

	if(part == 2 && this.selectedFilter == 2)
		this.buildTempsFilter();

	if(part == 3 && this.selectedFilter == 3)
		this.buildFansFilter();

   this.scrollarea.refresh()
   this.scrollbar.refresh()
}

DisplayPreferenceController.prototype.changeFilterMode = function(filter){
	if(this.selectedFilter == filter)
		return;	

	if(this.selectedFilter == 0)
		 disks_filter.setAttribute("class", "ellipsis");
	else if(this.selectedFilter == 1)	
		 network_filter.setAttribute("class", "ellipsis");
	else if(this.selectedFilter == 2)	
		 temps_filter.setAttribute("class", "ellipsis");
	else if(this.selectedFilter == 3)	
		 fans_filter.setAttribute("class", "ellipsis");
	else if(this.selectedFilter == 4)	
		 processes_filter.setAttribute("class", "ellipsis");

	this.selectedFilter = filter;

	if(filter == 0){
		 disks_filter.setAttribute("class", "ellipsis filternamesel");
		 this.buildDisksFilter();
	} else if(filter == 1){
		 network_filter.setAttribute("class", "ellipsis filternamesel");
		 this.buildNetworkFilter();
	} else if(filter == 2){
		 temps_filter.setAttribute("class", "ellipsis filternamesel");
		 this.buildTempsFilter();
	} else if(filter == 3){
		 fans_filter.setAttribute("class", "ellipsis filternamesel");
		 this.buildFansFilter();
	} else if(filter == 4){
		 processes_filter.setAttribute("class", "ellipsis filternamesel");
		 this.buildProcessesFilter();
	}
	
	this.scrollarea.verticalScrollTo(0)
  	this.scrollarea.refresh()
  	this.scrollbar.refresh()
}

DisplayPreferenceController.prototype.buildDisksFilter = function(){
	while (document.getElementById("display_scrollarea").hasChildNodes())
		document.getElementById("display_scrollarea").removeChild(document.getElementById("display_scrollarea").firstChild);
	
	var data = iStatPro.diskUsage();
	for(z=0;z<data.length;z++){
		var filterKey = data[z][6];
		var enabled = true;
		if(p.isDiskFiltered(filterKey)){
			enabled = false;
		}
		var item = new FilterItem(function(){}, filterKey, data[z][0], enabled);
		item.isDisk = true;
	}
}

DisplayPreferenceController.prototype.buildNetworkFilter = function(){
	while (document.getElementById("display_scrollarea").hasChildNodes())
		document.getElementById("display_scrollarea").removeChild(document.getElementById("display_scrollarea").firstChild);
	
	iStatPro.hasNetworkSetupChanged();
	var data = iStatPro.network();
	for(x=0;x<data.length;x++){
		var name;
		if(data[x][1])
			name = data[x][4] + " - " + data[x][1];
		else
			name = data[x][4]

		var filterKey = "network_" + data[x][0];
		var enabled = true;
		if(widget.preferenceForKey(filterKey)){
			if(widget.preferenceForKey(filterKey) == 'off')
				enabled = false;
		} else if(data[x][5].length > 0)
			enabled = false;

		var item = new FilterItem(function(){},filterKey, name, enabled);
	}
}

DisplayPreferenceController.prototype.buildTempsFilter = function(){
	while (document.getElementById("display_scrollarea").hasChildNodes())
		document.getElementById("display_scrollarea").removeChild(document.getElementById("display_scrollarea").firstChild);
	
	var data = iStatPro.temps(0);
	for(x=0;x<data.length;x++){
		var name = data[x][0];

		var filterKey;
		if(data[x].length == 4)
			filterKey = "temps_" + data[x][3];
		else
			filterKey = "temps_" + data[x][0];

		var enabled = true;
		if(widget.preferenceForKey(filterKey)){
			if(widget.preferenceForKey(filterKey) == 'off')
				enabled = false;
		}

		var item = new FilterItem(function(){},filterKey, name, enabled);
	}
}

DisplayPreferenceController.prototype.buildFansFilter = function(){
	while (document.getElementById("display_scrollarea").hasChildNodes())
		document.getElementById("display_scrollarea").removeChild(document.getElementById("display_scrollarea").firstChild);
	
	var data = iStatPro.fans();
	for(x=0;x<data.length;x++){
		var name = data[x][0];

		var filterKey = "fans_" + data[x][0];

		var enabled = true;
		if(widget.preferenceForKey(filterKey)){
			if(widget.preferenceForKey(filterKey) == 'off')
				enabled = false;
		}

		var item = new FilterItem(function(){},filterKey, name, enabled);
	}
}

DisplayPreferenceController.prototype.buildProcessesFilter = function(){
	while (document.getElementById("display_scrollarea").hasChildNodes())
		document.getElementById("display_scrollarea").removeChild(document.getElementById("display_scrollarea").firstChild);

	var enabled = true;
	if(p.v("processes_excludewidgets")){
		if(p.v("processes_excludewidgets") == 'off')
			enabled = false;
	}

	var item = new FilterItem(function(){}, "processes_excludewidgets", "Exclude Widgets", enabled);
}