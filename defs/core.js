'use strict';
//import './FileSaver.min.js';
import './jszip.min.js';
import './jquery.min.js';
import './library/albums.js';

self.sleep = ms => { return new Promise(resolve => { setTimeout(resolve, ms); }); }

Math.clamp = (value, min, max) => Math.Min(Math.max(value, min), max);

Math.range = (min, max) => Math.random() * (max - min) + min;

Math.roundRange = (min, max) => Math.round(Math.range(min, max));

Number.prototype.padStart = function(matLength = 2, fillString = '0', radix = 10){ return this.valueOf().toString(radix).padStart(maxLength, fillString); }

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

self.SulvicIO = SulvicIO;
