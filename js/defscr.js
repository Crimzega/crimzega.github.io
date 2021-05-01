Math.clamp = (value, min, max) => { return Math.min(Math.max(value, min), max); };
Math.range = (min, max) => { return Math.random() * (max - min) + min; };
Math.roundRange = (min, max) => { return Math.round(Math.range(min, max)); }

Number.prototype.padStart = (maxLength = 2, fillString = '0') => { return this.valueOf().toString(10).padStart(maxLength, fillString); };
Number.prototype.isPrecise = function(){
	var temp = this.valueOf() - Math.floor(this.valueOf());
	return temp > 0 && temp < 1;
}

class SulvicUtils{};

SulvicUtils.convertToTimestamp = (value, keepMiliis = true) => {
	var millis = value % 1000, sec = 0, min = 0, hr = 0;
	value = (value - millis) / 1000;
	sec = value % 60;
	value = (value - sec) / 60;
	min = value % 60;
	hr = (value - min) / 60;
	var result = String.format('{0}.{1}', sec, millis.padStart(3));
	if(min > 0) result = String.format('{0}:{1}.{2}', min, sec.padStart(), millis.padStart(3));
	if(hr > 0) result = String.format('{0}:{1}:{2}.{3}', hr, min.padStart(), sec.padStart(), millis.padStart(3));
	if(!keepMiliis) result = result.substr(0, result.indexOf('.'));
	return result;
};

SulvicUtils.convertToMillis = (timestamp) => {
	timestamp = timestamp.split('.');
	var millis = timestamp[1];
	var time = Number.parseInt(millis);
	var timestamp = timestamp[0].split(':');
	if(timestamp.length == 1) time += Number.parseInt(timestamp[0]) * 1000;
	if(timestamp.length == 2) time += (Number.parseInt(timestamp[0]) * 60000) + (Number.parseInt(timestamp[1]) * 1000);
	if(timestamp.length == 3) time += (Number.parseInt(timestamp[0]) * 3600000) + (Number.parseInt(timestamp[1]) * 60000) + (Number.parseInt(timestamp[2]) * 1000);
	return time;
};

SulvicUtils.getStringFromBytes = (...values) => {
	var temp = '';
	for(var value of values) temp += String.fromCharCode(value);
	return temp;
}

String.format = String.format || function(format, ...args){ return format.replace(/{(\d*)}/g, (match, index) => { return typeof args[index] != undefined? args[index]: match; }); };

String.fromBase64 = (str) => { return atob(str); }

String.toBase64 = (str) => { return btoa(str); }

(() => {
	
	function requestFileData(filePath, requestType = 'text'){
		return new Promise((resolve, reject) => {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', filePath);
			xhr.requestType = requestType;
			xhr.onload = () => {
				if(this.status == 200 && this.readyState == 4) resolve(this.response);
				else reject({status: this.status, statusText: this.statusText});
			};
			xhr.onerror = () => { reject({status: this.status, statusText: this.statusText}); };
			xhr.send();
		});
	}
	
	SulvicUtils.getFile = async function(filePath, requestType = 'text'){
		var result = await requestFileData(filePath, requestType);
		return result;
	}
	
})();