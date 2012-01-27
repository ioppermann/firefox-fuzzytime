
function fuzzyinit() {
	window.removeEventListener("load", fuzzyinit, false);
	
	try {
		const aID = "fuzzytime@oppermann.ch";
		
		const wargs = window.arguments[0];
		const isOurExtension = "@mozilla.org/extensions/manager;1" in Components.classes 
				&& "urn:mozilla:item:"+aID == wargs;
		
		const isOurAddon = wargs.id && aID == wargs.id;
		
		if ( isOurExtension || isOurAddon ) {
			var extensionVersionLabel = document.getElementById("extensionVersion");
			var buildfromBox = document.getElementById("fuzzytime-buildfrom");
			
			buildfromBox.parentNode.removeChild(buildfromBox);
			extensionVersionLabel.parentNode.insertBefore(buildfromBox, extensionVersionLabel);
			buildfromBox.parentNode.removeChild(extensionVersionLabel);
			buildfromBox.parentNode.insertBefore(extensionVersionLabel, buildfromBox);
			
			buildfromBox.hidden = false;
			document.getElementById("extensionBuildFromLink").blur();
			
			Components.utils.reportError(buildfromBox.previousSibling.id);
			
		}
	
	} catch (ex){
		Components.utils.reportError(ex);
	}
}

window.addEventListener("load", fuzzyinit, false);
 