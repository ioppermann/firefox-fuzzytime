var fuzzytime_display = null;
var fuzzytime_stringbundle = null;

var fuzzytime_mode = 0;
var fuzzytime_timeout = null;

var fuzzytime_transition = 0;
var fuzzytime_order = 0;
var fuzzytime_switch_order = 0;

var fuzzytime_languages = new Array("default", "af", "ar", "cs", "da", "de", "de-BY", "de-CH", "de-CH2", "de-CH3", "de-HES", "de-THU", "el", "en", "es-CA", "es-CL", "es-ES", "es-GL", "fa", "fi", "fr", "fy-NL", "hu-HU", "hu-HU2", "id", "il", "it", "it-FUR", "nl", "nl2", "no", "pl", "pt-BR", "pt-PT", "ro", "ru", "ru2", "ru3", "sk", "sv-SE", "tr", "zh-CN");

function fuzzytimeInit() {
	fuzzytimePrefObserver.register();

	fuzzytime_stringbundle = document.getElementById("fuzzytime-stringbundle");
	fuzzytime_display = document.getElementById("fuzzytime-display");

	fuzzytime_transition = parseInt(fuzzytime_stringbundle.getString("fuzzytime.transition"));
	fuzzytime_order = parseInt(fuzzytime_stringbundle.getString("fuzzytime.order"));
	fuzzytime_switch_order = parseInt(fuzzytime_stringbundle.getString("fuzzytime.switch_order_at_transition"));

	fuzzytimeLoadPrefs();

	fuzzytimeUpdate();

	return true;
}

function fuzzytimeClose() {
	fuzzytimePrefObserver.unregister();

	return true;
}

function fuzzytimeUpdate() {
	var datum = new Date();
	var stunde = datum.getHours();
	var minute = datum.getMinutes();
	var order = fuzzytime_order;
	var label = "";

	if(fuzzytime_mode == 1) {
		/* Very fuzzy mode */

		if(minute <= 15)
			minute = 0;
		else if(minute > 15 && minute <= 45)
			minute = 30;
		else {
			minute = 0;
			stunde++;
		}

		if(minute >= fuzzytime_transition) {
			stunde++;

			if(fuzzytime_switch_order == 1)
				order = fuzzytime_order == 0 ? 1 : 0;
		}

		var h = fuzzyStunde(stunde, minute);
		var m = fuzzyMinute(minute);

		if(order == 0)
			label = m + " " + h;
		else
			label = h + " " + m;

		if(minute == 0) {
			var prefix = fuzzytimeGetFix("prefix", stunde, minute);
			var suffix = fuzzytimeGetFix("suffix", stunde, minute);

			if(prefix.length != 0)
				label = prefix + " " + label;

			if(suffix.length != 0)
				label = label + " " + suffix;
		}	
	}
	else if(fuzzytime_mode == 2) {
		/* extremely fuzzy mode */

		label = fuzzyStundeExtreme(stunde);
	}
	else {
		/* normal fuzzy mode */

		if(minute >= fuzzytime_transition) {
			stunde++;

			if(fuzzytime_switch_order == 1)
				order = fuzzytime_order == 0 ? 1 : 0;
		}

		if(minute > 56 || minute < 3)
			minute = 0;

		var h = fuzzyStunde(stunde, minute);
		var m = fuzzyMinute(minute);

		if(order == 0) {
			if(m.length != 0)
				label = m + " " + h;
			else
				label = h;
		}
		else {
			if(h.length != 0)
				label = h + " " + m;
			else
				label = m;
		}

		if(minute == 0) {
			var prefix = fuzzytimeGetFix("prefix", stunde, minute);
			var suffix = fuzzytimeGetFix("suffix", stunde, minute);

			if(prefix.length != 0)
				label = prefix + " " + label;

			if(suffix.length != 0)
				label = label + " " + suffix;
		}
	}

	fuzzytime_display.label = label;

	fuzzytime_timeout = setTimeout("fuzzytimeUpdate()", 60000);

	return;
}

function fuzzytimeGetFix(fix, stunde, minute) {
	var s = "";

	if(fix != "suffix" && fix != "prefix")
		return s;

	var exception = fuzzytime_stringbundle.getString("fuzzytime.fullhour_no" + fix).split(",").indexOf(stunde + "");

	if(exception != -1)
		return s;

	if(stunde == 1 || stunde == 13)
		s = fuzzytime_stringbundle.getString("fuzzytime.fullhour_" + fix + "_singular");
	else
		s = fuzzytime_stringbundle.getString("fuzzytime.fullhour_" + fix + "_plural");

	return s;
}
		
function fuzzyStunde(h, m) {
	if(h == 0 || h == 24)
		h = 0;

	var s = fuzzytime_stringbundle.getString("fuzzytime.h." + h);

	try {
		s = fuzzytime_stringbundle.getString("fuzzytime.h." + h + "." + fuzzyCondenseMinute(m));
	} catch(e) {}

	return s;
}

function fuzzyStundeExtreme(h) {
	switch(h) {
		case 23:
		case 0:
		case 1:
			return fuzzytime_stringbundle.getString("fuzzytime.extreme.midnight");
		case 2:
		case 3:
		case 4:
		case 5:
			return fuzzytime_stringbundle.getString("fuzzytime.extreme.earlymorning");
		case 6:
		case 7:
		case 8:
			return fuzzytime_stringbundle.getString("fuzzytime.extreme.morning");
		case 9:
		case 10:
			return fuzzytime_stringbundle.getString("fuzzytime.extreme.latemorning");
		case 11:
		case 12:
			return fuzzytime_stringbundle.getString("fuzzytime.extreme.noon");
		case 13:
		case 14:
			return fuzzytime_stringbundle.getString("fuzzytime.extreme.earlyafternoon");
		case 15:
		case 16:
			return fuzzytime_stringbundle.getString("fuzzytime.extreme.afternoon");
		case 17:
		case 18:
			return fuzzytime_stringbundle.getString("fuzzytime.extreme.lateafternoon");
		case 19:
		case 20:
			return fuzzytime_stringbundle.getString("fuzzytime.extreme.evening");
		case 21:
		case 22:
			return fuzzytime_stringbundle.getString("fuzzytime.extreme.lateevening");
	}

	return "";
}
		
function fuzzyMinute(m) {
	var t = fuzzyCondenseMinute(m);

	return fuzzytime_stringbundle.getString("fuzzytime.m." + t);
}

function fuzzyCondenseMinute(m) {
	if(m == 3 || m == 4 || m == 5 || m == 6)
		return 5;

	if(m == 7 || m == 8 || m == 9 || m == 10 || m == 11)
		return 10;

	if(m == 12 || m == 13 || m == 14 || m == 15 || m == 16)
		return 15;

	if(m == 17 || m == 18 || m == 19 || m == 20 || m == 21)
		return 20;

	if(m == 22 || m == 23 || m == 24 || m == 25 || m == 26)
		return 25;

	if(m == 27 || m == 28 || m == 29 || m == 30 || m == 31)
		return 30;

	if(m == 32 || m == 33 || m == 34 || m == 35 || m == 36)
		return 35;

	if(m == 37 || m == 38 || m == 39 || m == 40 || m == 41)
		return 40;

	if(m == 42 || m == 43 || m == 44 || m == 45 || m == 46)
		return 45;

	if(m == 47 || m == 48 || m == 49 || m == 50 || m == 51)
		return 50;

	if(m == 52 || m == 53 || m == 54 || m == 55 || m == 56)
		return 55;

	return 0;
}


/** Statusbar popup **/

function fuzzytimeSwitch(mode) {
	fuzzytimeSetIntPref("mode", mode);
}

function fuzzytimeLanguageSwitch(lang) {
	if(fuzzytime_languages.indexOf(lang) == -1)
		lang = "default";

	fuzzytimeSetCharPref("language", lang);
}

function fuzzytimePopup(e) {
	var statusbar = document.getElementById("fuzzytime-display");
	var context = document.getElementById("fuzzytime-contextmenu");
	var x = e.clientX;
	var y = e.clientY;
	document.popupNode = statusbar;
	context.showPopup(statusbar, x, y, "bottomleft", "topleft");
}


/** Preferences **/

function fuzzytimeGetIntPref(name, defval) {
	var pref = defval;

	var prefservice = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var prefs = prefservice.getBranch("fuzzytime.");

	if(prefs.getPrefType(name) == prefs.PREF_INT)
		pref = prefs.getIntPref(name);

	return pref;
}

function fuzzytimeSetIntPref(name, value) {
	var prefservice = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var prefs = prefservice.getBranch("fuzzytime.");

	prefs.setIntPref(name, value);

	return true;
}

function fuzzytimeGetCharPref(name, defval) {
	var pref = defval;

	var prefservice = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var prefs = prefservice.getBranch("fuzzytime.");

	if(prefs.getPrefType(name) == prefs.PREF_STRING)
		pref = prefs.getCharPref(name);

	return pref;
}

function fuzzytimeSetCharPref(name, value) {
	var prefservice = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var prefs = prefservice.getBranch("fuzzytime.");

	prefs.setCharPref(name, value);

	return true;
}

function fuzzytimeLoadPrefs() {
	var m;

	/* Language */

	var fuzzytime_lang = fuzzytimeGetCharPref("language", "default");

	for(var i = 0; i < fuzzytime_languages.length; i++) {
		//alert("fuzzytime-language-" + fuzzytime_languages[i]);
		m = document.getElementById("fuzzytime-language-" + fuzzytime_languages[i]);
		if(fuzzytime_lang == fuzzytime_languages[i])
			m.setAttribute("checked", "true");
		else
			m.removeAttribute("checked");
	}

	if(fuzzytime_lang == "default")
		fuzzytime_stringbundle.src = "chrome://fuzzytime/locale/fuzzytime.properties";
	else
		fuzzytime_stringbundle.src = "chrome://fuzzytime/content/locale/" + fuzzytime_lang + "/fuzzytime.properties";

	fuzzytime_transition = parseInt(fuzzytime_stringbundle.getString("fuzzytime.transition"));
	fuzzytime_order = parseInt(fuzzytime_stringbundle.getString("fuzzytime.order"));
	fuzzytime_switch_order = parseInt(fuzzytime_stringbundle.getString("fuzzytime.switch_order_at_transition"));

	document.getElementById("fuzzytime-languagemenu").setAttribute("label", fuzzytime_stringbundle.getString("fuzzytime.languagemenu"));

	document.getElementById("fuzzytime-modus-extreme").label = fuzzytime_stringbundle.getString("fuzzytime.modus.extreme");
	document.getElementById("fuzzytime-modus-very").label = fuzzytime_stringbundle.getString("fuzzytime.modus.very");
	document.getElementById("fuzzytime-modus-normal").label = fuzzytime_stringbundle.getString("fuzzytime.modus.normal");

	/* Mode */

	fuzzytime_mode = fuzzytimeGetIntPref("mode", 0);

	m = document.getElementById("fuzzytime-modus-very");
	if(fuzzytime_mode == 1)
		m.setAttribute("checked", "true");
	else
		m.removeAttribute("checked");

	m = document.getElementById("fuzzytime-modus-extreme");
	if(fuzzytime_mode == 2)
		m.setAttribute("checked", "true");
	else
		m.removeAttribute("checked");

	m = document.getElementById("fuzzytime-modus-normal");
	if(fuzzytime_mode == 0)
		m.setAttribute("checked", "true");
	else
		m.removeAttribute("checked");

	return;
}

var fuzzytimePrefObserver = {
	prefs: null,

	register: function() {
		var prefservice = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		this.prefs = prefservice.getBranch("fuzzytime.");

		var internal = this.prefs.QueryInterface(Components.interfaces.nsIPrefBranchInternal);
		internal.addObserver("", this, false);
	},

	unregister: function() {
		if(!this.prefs)
			return;

		var internal = this.prefs.QueryInterface(Components.interfaces.nsIPrefBranchInternal);
		internal.removeObserver("", this);
	},

	observe: function(subject, topic, data) {
		if(topic != "nsPref:changed")
			return;

		fuzzytimeLoadPrefs();

		if(fuzzytime_timeout != null)
			clearTimeout(fuzzytime_timeout);

		fuzzytimeUpdate();
	}
}


/** Register global callbacks **/

window.addEventListener("load", fuzzytimeInit, false);
window.addEventListener("close", fuzzytimeClose, false);

