'use strict';

/* Import section */
import './elems/paginator.js';
import './elems/album.js';
import './elems/video.js';

/* Classes section */
class SulvicIO{

	static async getFile(url, type = 'blob'){
		var get = () => {
			return new Promise((resolve, reject) => {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', url);
				xhr.responseType = type;
				xhr.onload = function(){ console.log(`Attempting to grab the requested file content.`); };
				xhr.onreadystatechange = function(){
					if(this.readyState == XMLHttpRequest.DONE){
						if(this.status >= 200 && this.status < 300) resolve(type === 'text'? this.responseText: this.response);
						else reject({ info: 'An error has occured', message: this.statusText, response: this.status });
					}
				};
				xhr.onerror = function(){ reject({ info: 'An error has occured', message: this.statusText, response: this.status }); };
				xhr.send();
			});
		};
		return await get();
	}

	static getFileText(url, type = 'blob'){ return SulvicIO.getFile(url, type).then(blob => { blob.text().then(txt => { console.log(txt); }); }); }

	static downloadFile(url, fileName = null, type = 'blob'){
		SulvicIO.getFile(url, type).then(data => {
			console.log(`Attempting to download the requested contents.`);
			var dl = $('<a>', {
				download: fileName,
				href: URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }))
			}).click(function(){ this.click(); }).trigger('click');
			setTimeout(() => { dl.remove(); }, 100);
		});
	}

}

/* Hidden functions section */
const modulus = (a, b) => { return a - Math.floor(a / b) * b; };

const asInt = value => {
	value = Number(value);
	return value < 0? Math.ceil(value): Math.floor(value);
};

/* Static functions section */
JSON.valuesByKey = function(obj, key){
	let values = [];
	for(let prop in obj) if(obj.hasOwnProperty(prop)){
		if(prop === key) values.push(obj[prop]);
		if(typeof obj[prop] === 'object') values = values.concat(JSON.valuesByKey(obj[prop], key));
	}
	return values;
}

JSON.uniqueValuesByKey = function(obj, key){ return [...new Set(JSON.valuesByKey(obj, key))]; }

JSON.commonValuesByKey = function(obj, key){
	var result = [], uniques = JSON.uniqueValuesByKey(obj, key), values = JSON.valuesByKey(obj, key);
	for(var unique of uniques) if(values.filter(value => value === unique).length > 1) result.push(unique);
	return result;
}

Math.clamp = (value, min, max) => Math.min(Math.max(value, min), max);

Math.range = (min, max) => Math.random() * (max - min) + min;

Math.roundRange = (min, max) => Math.round(Math.range(min, max));

Math.toByte = value => modulus(asInt(value), 2 ** 8);

Math.toInt = value => {
	var uValue = Math.toUInt(value);
	return uValue > 2 ** 31? uValue - (2 ** 32): uValue;
}

Math.toLong = value => {
	var uValue = Math.toUInt(value);
	return uValue > 2 ** 63? uValue - (2 ** 64): uValue;
}

Math.sByte = value => {
	var sValue = Math.toUInt(value);
	return sValue > 2 ** 7? sValue - (2 ** 8): sValue;
}

Math.toShort = value => {
	var uValue = Math.toUInt(value);
	return uValue > 2 ** 15? uValue - (2 ** 16): uValue;
}

Math.toUInt = value => modulus(asInt(value), 2 ** 32);

Math.toULong = value => modulus(asInt(value), 2 ** 64);

Math.toUShort = value => modulus(asInt(value), 2 ** 16);

Math.wrap = (value, min, max) => (((value - min) % (max + 1 - min)) + (max + 1 - min)) % (max + 1 - min) + min;

Math.toDegrees = function(rad){ return rad * (180 / Math.PI); }

Math.toRadians = function(deg){ return deg * (Math.PI / 180); }

Math.remap = function(value, min, max, min1, max1){
	min = Math.min(min, max);
	max = Math.max(min, max);
	min1 = Math.min(min1, max1);
	max1 = Math.max(min1, max1);
	return (((value - min) / (max - min)) * (max1 - min1)) + min1;
}

String.format = String.format || function(format, ...args){ return format.replace(/{(\d*)}/g, (match, index) => { return typeof args[index] != undefined? args[index]: match }); }

/* Custom Function Section */
function getGBAColor(clr){
	return {
		r: (clr[0] / 255) * 31,
		g: (clr[1] / 255) * 31,
		b: (clr[2] / 255) * 31
	};
}

function getClosestGBAColor(clr){

}

function getImagePalette(imgSrc, count){
	return new Promise((resolve, reject) => {
		var img = new Image();
		img.crossOrigin = 'Anonymous';
		img.src = imgSrc;
		img.onload = function(){
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var width = img.width;
			var height = img.height;
			ctx.drawImage(img, 0, 0, width, height);
			var imgData = ctx.getImageData(0, 0, width, height).data;
			var pixelCount = imgData.length / 4;
			var clrMap = {}
			for(var i = 0; i < pixelCount; i++){
				var offset = i * 4;
				var clr = {
					r: imgData[offset],
					g: imgData[offset + 1],
					b: imgData[offset + 2],
					a: imgData[offset + 3],
				}
				var rgb = `${clr.r},${clr.g},${clr.b},${clr.a}`;
				if(rgb in clrMap) clrMap[rgb]++;
				else clrMap[rgb] = 1;
			}
			var clrs = Object.keys(clrMap).sort((a, b) => { return clrMap[b] - clrMap[a]; });
			resolve(clrs.slice(0, count).map(clr => { return clr.split(',').map(val => parseInt(val)); }));
		}
		img.onerror = function(){ reject(new Error(`Failed to load image: ${imgSrc}`)); }
	});
}

/* Prototype functions section */
Element.prototype.computedStyle = function(){ return getComputedStyle(this); }

Number.prototype.padStart = function(maxLength = 2, fillString = '0', radix = 10){ return this.valueOf().toString(radix).padStart(maxLength, fillString); }

Number.prototype.isPrecise = function(){
	var temp = this.valueOf() - Math.floor(this.valueOf());
	return temp > 0 && temp < 1;
}

if(!!Intl.NumberFormat) Number.prototype.toLocalString = function(){ return new Intl.NumberFormat(arguments).format(this.valueOf()); };

Number.prototype.toHex = function(){ return this.toString(16); }

String.prototype.forEach = Array.prototype.forEach;

String.prototype.reverse = function(){
	var result = '';
	for(var ch of this) result = ch += result;
	return result;
}

/* Module include section */
window.sleep = delay => new Promise(resolve => { setTimeout(() => resolve(), delay); });

window.wait = () => sleep(0);

window.onload = function(){
	var drawerHandler = document.querySelector('#icon .drawer-handler');
	var drawer = document.querySelector('sulvic-drawer');
	drawerHandler.onclick = function(evt){ drawer.classList.toggle('opened'); }
}

window.SulvicIO = SulvicIO;
