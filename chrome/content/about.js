
function fillCredits(prefix, aID, creatorStr, errStr) {
	var attribName = 'value';
	var trueVersion = null;
	
	function versionCallback(v) {
		document.getElementById("addonversion").setAttribute(attribName, v);
	}
	try {
	var has_EM = "@mozilla.org/extensions/manager;1" in Components.classes;
	if (has_EM) {
		var rdfs = Components.classes["@mozilla.org/rdf/rdf-service;1"]
			.getService(Components.interfaces.nsIRDFService);
		var ds = Components.classes["@mozilla.org/extensions/manager;1"]
			.getService(Components.interfaces.nsIExtensionManager).datasource;
		
		trueVersion = ds.GetTarget(rdfs.GetResource("urn:mozilla:item:"+aID),
		   rdfs.GetResource("http://www.mozilla.org/2004/em-rdf#version"), true)
		   .QueryInterface(Components.interfaces.nsIRDFLiteral).Value.toString();
		versionCallback(trueVersion + creatorStr);

	} else {
		// akkor valaminagyon uj van
		if (typeof Components.utils["import"] !== 'undefined') {
			
			try {
				Components.utils["import"]("resource://gre/modules/AddonManager.jsm");
			} catch (e)
			{
				logger("fillCredits: no EM, "+e.message, prefix);
				versionCallback(errStr);
			}
			trueVersion = AddonManager.getAddonByID(aID,function(aAddon) {
				// Here aAddons is an array of {{AMInterface("Addon")}} objects
				//logger(aAddon.version, prefix);
				versionCallback( aAddon.version + creatorStr);
			});
		} else {
			versionCallback(errStr);
		}
		// This code is likely to execute before the code inside the callback
	}
	} catch (ex){
		report(ex);
	}
}

function fuzzyinit() {
	const aID = "fuzzytime@oppermann.ch";
	
	try {
	var has_EM = "@mozilla.org/extensions/manager;1" in Components.classes;
	if (has_EM) {
		var rdfs = Components.classes["@mozilla.org/rdf/rdf-service;1"]
			.getService(Components.interfaces.nsIRDFService);
		var ds = Components.classes["@mozilla.org/extensions/manager;1"]
			.getService(Components.interfaces.nsIExtensionManager).datasource;
		
		var wargs = [];
		//window.arguments[]
		wargs[0] = "urn:mozilla:item:"+aID;
		wargs[1] = ds;
		window.arguments = wargs;
		
		var grooveseparator = document.getElementById("groove");
		grooveseparator.hidden = true;
		
		init();

	} else {
		// akkor valaminagyon uj van
		if (typeof Components.utils["import"] !== 'undefined') {
			
			try {
				Components.utils["import"]("resource://gre/modules/AddonManager.jsm");
			} catch (e)
			{
				Components.utils.reportError(ex);
			}
			//trueVersion = AddonManager.getAddonByID(aID,function(aAddon) {
				// Here aAddons is an array of {{AMInterface("Addon")}} objects
				//logger(aAddon.version, prefix);
			//	versionCallback( aAddon.version + creatorStr);
			//});
			
			//no wrapping needed
			
			init();
			
			var extension = "urn:mozilla:item:"+aID;
			function EM_NS(aProperty)
			{
				return "http://www.mozilla.org/2004/em-rdf#" + aProperty;
			}
			
			var sectionProps = [["developersBox", "developer", "extensionDevelopers"],
									 ["translatorsBox", "translator", "extensionTranslators"],
									 ["contributorsBox", "contributor", "extensionContributors"]];

			for (var i = 0; i < sectionProps.length; ++i) {
				var node = document.getElementById(sectionProps[i][0]);
				var arc = rdfs.GetResource(EM_NS(sectionProps[i][1]));
				var targets = gExtensionDB.GetTargets(extension, arc, true);
				if (!(targets.hasMoreElements()))
					document.getElementById(sectionProps[i][2]).hidden = true;
				else {
					while (targets.hasMoreElements()) {
						var literalValue = targets.getNext().QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
						var label = document.createElement("label");
						label.setAttribute("value", literalValue);
						label.setAttribute("class", "contributor");
						node.appendChild(label);
					}
				}
			}
  
		} else {
			Components.utils.reportError("No Components.utils.import and EM!!");
		}
		// This code is likely to execute before the code inside the callback
	}
	} catch (ex){
		Components.utils.reportError(ex);
	}
} 