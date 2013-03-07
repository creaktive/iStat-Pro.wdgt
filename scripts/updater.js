function UpdateController(){
	this.updateAvailable = false;
	this.version = 4.92;
	this.newVersion = 0.0;
}

UpdateController.prototype.check = function(silent){
	if(p.v("update_check") == "off" && silent == 0)
		return

	url = 'http://islayer.com/index.php?op=version&id=7&type=1&random=' + new Date().getTime();
	versionCheckRequest=new XMLHttpRequest();
	versionCheckRequest.open("GET",url,true);
	versionCheckRequest.onreadystatechange=function() {
		if(versionCheckRequest.readyState == 4) {
			var skip = p.v("skip");
			if(skip == null)
				skip = 0.0;
			if(versionCheckRequest.status == 200 && versionCheckRequest.responseText > upd.version && skip != versionCheckRequest.responseText){
				upd.updateAvailable = true;
				upd.newVersion = versionCheckRequest.responseText;
				if(silent == 0){
					document.getElementById('tall_update_window_new').style.display = 'block';
					document.getElementById('wide_update_window_new').style.display = 'block';
					upd.reposition();
					if(p.v("skin_type") == 'tall')
						resizeFront(304, tsk.sectionSize);
					else
						resizeFront(wsk.sectionSize, 130);
				} else {
					document.getElementById('back_update_window_new').style.display = 'block';
				}					
			} else {
				if(silent == 1){
					document.getElementById('back_update_window_current').style.display = 'block';
				}
			}	
		}
	}
	versionCheckRequest.send(null);
}

UpdateController.prototype.reposition = function(){
	var tallContainerHeight = parseInt(document.getElementById("tallContentContainer").style.height);
	offset = (tallContainerHeight - 131) / 2;
	if(offset < 0)
		offset = 0;
	document.getElementById('tall_update_window_new').style.top = offset + 'px';

	var wideContainerWidth = parseInt(document.getElementById("wideContentContainer").style.width);
	offset = (wideContainerWidth - 218) / 2;
	if(offset < 0)
		offset = 0;
	document.getElementById('wide_update_window_new').style.left = offset + 'px';
}

UpdateController.prototype.skip = function(){
	p.s(""+this.newVersion+"", "skip");
	this.hide();
}

UpdateController.prototype.hide = function(){
	this.updateAvailable = false;
	h("tall_update_window_new");
	h("wide_update_window_new");
	h("back_update_window_new");
	h("back_update_window_current");
}
