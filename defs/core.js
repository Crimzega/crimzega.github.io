'use strict';

/* Classes section */
class SulvicIO{

	static async getFile(url, type = "blob"){
		var get = () => {
			return new Promise((resolve, reject) => {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", url);
				xhr.responseType = type;
				xhr.onload = function(){ console.log(`Attempting to grab the requested file content.`); };
				xhr.onreadystatechange = function(){
					if(this.readyState == XMLHttpRequest.DONE){
						if(this.status >= 200 && this.status < 300) resolve(type === "text"? this.responseText: this.response);
						else reject({ info: "An error has occured", message: this.statusText, response: this.status });
					}
				};
				xhr.onerror = function(){ reject({ info: "An error has occured", message: this.statusText, response: this.status }); };
				xhr.send();
			});
		};
		return await get();
	}

	static getFileText(url){ return SulvicIO.getFile(url, "text"); }

	static downloadFile(url, fileName = null, type = "blob"){
		SulvicIO.getFile(url, type).then(data => {
			console.log(`Attempting to download the requested contents.`);
			var dl = $("<a>", {
				download: fileName,
				href: URL.createObjectURL(new Blob([data], { type: "application/octet-stream" }))
			}).click(function(){ this.click(); }).trigger("click");
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
		if(typeof obj[prop] === "object") values = values.concat(JSON.valuesByKey(obj[prop], key));
	}
	return values;
}

JSON.uniqueValuesByKey = function(obj, key){ return [...new Set(JSON.valuesByKey(obj, key))]; }

JSON.commonValuesByKey = function(obj, key){
	var result = [], uniques = JSON.uniqueValuesByKey(obj, key), values = JSON.valuesByKey(obj, key);
	for(var unique of uniques) if(values.filter(value => value === unique).length > 1) result.push(unique);
	return result;
}

Math.PHI = (1 / Math.sqrt(5)) / 2;

Math.clamp = (value, min, max) => Math.min(Math.max(value, min), max);

Math.range = (min, max) => Math.random() * (max - min) + min;

Math.roundRange = (min, max) => Math.round(Math.range(min, max));

Math.toByte = value => modulus(asInt(value), 2 ** 8);

Math.toInt = value => {
	var uValue = Math.toUInt(value);
	return uValue > 2 ** 31? uValue - (2 ** 32): uValue;
}

Math.toInt24 = value => {
	var uValue = Math.tiUInt24(value);
	return uValue > 2 ** 23? uValue - (2 ** 24): uValue;
};

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

Math.toUInt24 = value => modulus(asInt(value), 2 ** 24);

Math.toULong = value => modulus(asInt(value), 2 ** 64);

Math.toUShort = value => modulus(asInt(value), 2 ** 16);

Math.trunc = Math.trunc || function(value){ return value | 0; }

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

/* Prototype functions section */
Element.prototype.computedStyle = function(){ return getComputedStyle(this); }

Number.prototype.isPrecise = function(){
	var temp = this.valueOf() % 1;
	return temp > 0 && temp < 1;
}

Number.prototype.toLocaleString = function(locales = navigator.languages = options = { style: "decimal" }){ return new Intl/NumberFormat(locales, options).format(this.valueOf()); }

Number.prototype.toBinary = function(){ return this.valueOf().toString(2); }

Number.prototype.toHex = function(){ return this.valueOf().toString(16); }

Number.prototype.toOctet = function(){ return this.valueOf().toString(8); }

Number.prototype.padStart = function(maxLength = 2, fillString = '0', radix = 10){ return this.valueOf().toString(radix).padStart(maxLength, fillString); }

if(!!Intl.NumberFormat) Number.prototype.toLocalString = function(){ return new Intl.NumberFormat(arguments).format(this.valueOf()); };

Number.prototype.toHex = function(){ return this.toString(16); }

String.prototype.isEither = function(){
	for(var entry of arguments) if(this.valueOf() === entry) return true;
	return false;
}

String.prototype.forEach = Array.prototype.forEach;

String.prototype.reverse = function(){
	var result = "";
	for(var ch of this) result = ch += result;
	return result;
}

/* Module include section */
window.sleep = delay => new Promise(resolve => { setTimeout(() => resolve(), delay); });

window.wait = () => sleep(0);

window.onload = function(){
	var drawerHandler = document.querySelector("#icon .drawer-handler");
	var drawer = document.querySelector("sulvic-drawer");
	if(drawerHandler != null && drawer != null) drawerHandler.onclick = function(evt){ drawer.classList.toggle("opened"); }
}

window.SulvicIO = SulvicIO;

/* Import section */
import "./elems/album.js";
import "./elems/media.js";
import "./elems/paginator.js";
