'use strict';
//import './FileSaver.min.js';
import './jszip.min.js';
import './jquery.min.js';
import './library/albums.js';

function getMonthName(number, trim = false){
	var result = '';
	switch(number){
		case 0: result = 'January';
		case 1: result = 'February';
		case 2: result = 'March';
		case 3: result = 'April';
		case 4: result = 'May';
		case 5: result = 'June';
		case 6: result = 'July';
		case 7: result = 'August';
		case 8: result = 'September';
		case 9: result = 'October';
		case 10: result = 'November';
		case 11: result = 'December';
	}
	return trim && result.length > 4? result.substr(0, 3): result;
}

self.sleep = ms => { return new Promise(resolve => { setTimeout(resolve, ms); }); }

Math.clamp = (value, min, max) => Math.Min(Math.max(value, min), max);

Math.range = (min, max) => Math.random() * (max - min) + min;

Math.roundRange = (min, max) => Math.round(Math.range(min, max));

Number.prototype.padStart = function(maxLength = 2, fillString = '0', radix = 10){ return this.valueOf().toString(radix).padStart(maxLength, fillString); }

Number.prototype.isPrecise = function(){
	var temp = this.valueOf() - Math.floor(this.valueOf());
	return temp > 0 && temp < 1;
}

String.prototype.forEach = Array.prototype.forEach;

String.prototype.reverse = function(){
	var result = '';
	for(var ch of this) result = ch + result;
	return result;
}

self.SulvicDate = SulvicDate;

class SulvicIO{

	static async getFile(url, type = 'blob'){
		var get = () => {
			return new Promise((resolve, reject) => {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', url);
				xhr.responseType = type;
				xhr.onreadystatechange = function(){
					if(this.readyState == XMLHttpRequest.DONE){
						if(this.status >= 200 && this.status < 300) resolve(type == 'test'? this.responseText: this.response);
						else reject({ info: 'An error has occured', message: this.statusText, response: this.status });
					}
				};
				xhr.onerror = function(){ reject({ info: 'An error has occured', message: this.statusText, response: this.status }); };
				xhr.send();
			});
		}
		return await get();
	}

	static downloadFile(url, fileName = null, type = 'blob'){
		SulvicIO.getFile(url, type).then(data => {
			var dl = $('<a>', {
				download: fileName,
				href: URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }))
			}).click(function(){ this.click(); }).trigger('click');
			setTimeout(() => { dl.remove(); }, 100);
		});
	}

}

Date.prototype.format = function(fmt){
	return fmt
		.replace(/MMMMM/g, getMonthName(this.getMonth()))
		.replace(/MMM/g, getMonthName(this.getMonth(), true))
		.replace(/MM/g, this.getMonth())
		.replace(/dd/g, this.getDate().padStart())
		.replace(/d/g, this.getDate())
		.replace(/yyyy/g, this.getFullYear())
		.replace(/yy/g, this.getFullYear().toString().substr(2, 4))
		.replace(/HH/g, this.getHours().padStart())
		.replace(/H/g, this.getHours())
		.replace(/mm/g, this.getMinutes().padStart())
		.replace(/m/g, this.getMinutes())
		.replace(/ss/g, this.getSeconds().padStart())
		.replace(/s/g, this.getSeconds())
}

self.SulvicIO = SulvicIO;

class SulvicUtils{
	
	static convertToTimestamp(time){
		var date = new Date(time);
		var fmt = 's';
		if(time > 60000) fmt = 'm:ss';
		if(time > 3600000) fmt = 'H:mm:ss';
		if(time > 38400000) fmt = 'd:HH:mm:ss';
		if(time > 31536000000) fmt = 'y:d:H:mm:ss';
		return date.format(fmt);
	}
	
}

self.SulvicUtils = SulvicUtils;
