"use strict";

class ElementHelper {

	/**
	 * @param {Element} elem 
	 * @returns {CSSStyleDeclaration}
	 */
	static computedStyle(elem) { return getComputedStyle(elem); }

}

class StringHelper {

	/**
	 * @param {string} format 
	 * @param  {...any} args 
	 * @returns {string}
	 */
	static format = (format, ...args) => format.replace(/{(\d*)}/g, (match, index) => typeof args[index] !== undefined ? args[index] : match);

	/**
	 * @param {string} value
	 * @param {...string} args
	 * @returns {boolean}
	 */
	static isEither(value, ...args) {
		return args.includes(value);
	}

	/**
	 * @param {string} value
	 * @returns {string}
	 */
	static reverse(value) {
		var result = "";
		for (var ch of value) result = ch + result;
		return result;
	}

}

class SulvicMath {

	static PHI = (1 + Math.sqrt(5)) / 2;

	/**
	 * @param {number} a 
	 * @param {number} b 
	 * @returns {number}
	 */
	static #modulus(a, b) { return a - Math.floor(a / b) * b; }

	/**
	 * @param {number|string} value 
	 * @returns {number}
	 */
	static #asInt(value) {
		value = Number(value);
		return value < 0 ? Math.ceil(value) : Math.floor(value);
	}

	/**
	 * @param {number} value 
	 * @param {number} min 
	 * @param {number max 
	 * @returns {number}
	 */
	static clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

	/**
	 * @param {number} value
	 * @returns {boolean}
	 */
	static isPrecise(value) {
		var temp = value % 1;
		return temp > 0 && temp < 1;
	}

	/**
	 * @param {number} value
	 * @param {number} maxLength 
	 * @param {number} fillString 
	 * @param {number} radix 
	 * @returns {string}
	 */
	static padEnd(value, maxLength = 2, fillString = '0', radix = 10) { return value.toString(radix).padEnd(maxLength, fillString); }

	/**
	 * @param {number} value
	 * @param {number} maxLength 
	 * @param {number} fillString 
	 * @param {number} radix 
	 * @returns {string}
	 */
	static padStart(value, maxLength = 2, fillString = '0', radix = 10) { return value.toString(radix).padStart(maxLength, fillString); }

	/**
	 * @param {number} min 
	 * @param {number} max 
	 * @returns {number}
	 */
	static range(min, max) { return Math.random() * (max - min) + min; }

	/**
	 * @param {number} value 
	 * @param {number} min 
	 * @param {number} max 
	 * @param {number} min1 
	 * @param {number} max1 
	 * @returns {number}
	 */
	static remap(value, min, max, min1, max1) {
		let tmp = Math.max(min, max), tmp1 = Math.max(min1, max1);
		min = Math.min(min, max);
		min1 = Math.min(min1, max1);
		max = tmp;
		max1 = tmp1;
		return (((value - min) / (max - min)) * (max1 - min1)) + min1;
	}

	/**
	 * @param {number} min 
	 * @param {number} max 
	 * @returns {number}
	 */
	static roundRange(min, max) { return Math.round(range(min, max)); }

	/**
	 * @param {number} value
	 * @returns {string}
	 */
	static toBinary(value) { return value.toString(2); }

	/**
	 * @param {number|string} value 
	 * @returns {number}
	 */
	static toByte(value) { return SulvicMath.#modulus(SulvicMath.#asInt(value), 2 ** 8); }

	/**
	 * @param {number} rad 
	 * @returns {number}
	 */
	static toDegrees(rad) { return rad * (180 / Math.PI); }

	/**
	 * @param {number} value
	 * @returns {string}
	 */
	static toHex() { return this.valueOf().toString(16); }

	/**
	 * @param {number} value
	 * @param {string|string[]|undefined} locales 
	 * @param {Intl.NumberFormatOptions|undefined} options 
	 * @returns {string}
	 */
	static toLocaleString(value, locales = navigator.languages, options = { style: "decimal" }) { return new Intl.NumberFormat(locales, options).format(value); }

	/**
	 * @param {number} value
	 * @returns {string}
	 */
	static toOctet(value) { return value.toString(8); }

	/**
	 * @param {number} rad 
	 * @returns {number}
	 */
	static toRadians(rad) { return rad * (Math.PI / 180); }

	/**
	 * @param {number|string} value 
	 * @returns {number}
	 */
	static toUInt(value) { return SulvicMath.#modulus(SulvicMath.#asInt(value), 2 ** 32); }

	/**
	 * @param {number|string} value 
	 * @returns {number}
	 */
	static toUInt24(value) { return SulvicMath.#modulus(SulvicMath.#asInt(value), 2 ** 24); }

	/**
	 * @param {number|string} value 
	 * @returns {number}
	 */
	static toULong(value) { return SulvicMath.#modulus(SulvicMath.#asInt(value), 2 ** 32); }

	/**
	 * @param {number|string} value 
	 * @returns {number}
	 */
	static toUShort(value) { return SulvicMath.#modulus(SulvicMath.#asInt(value), 2 ** 16); }

	/**
	 * @param {number|string} value 
	 * @returns {number}
	 */
	static toInt(value) {
		var uValue = toUInt(value);
		return value > 2 ** 31 ? uValue - (2 ** 32) : uValue;
	}

	/**
	 * @param {number|string} value 
	 * @returns {number}
	 */
	static toInt24(value) {
		var uValue = toUInt24(value);
		return value > 2 ** 23 ? uValue - (2 ** 24) : uValue;
	}

	/**
	 * @param {number|string} value 
	 * @returns {number}
	 */
	static toLong(value) {
		var uValue = toULong(value);
		return value > 2 ** 63 ? uValue - (2 ** 64) : uValue;
	}

	/**
	 * @param {number|string} value 
	 * @returns {number}
	 */
	static toSByte(value) {
		var uValue = toByte(value);
		return value > 2 ** 7 ? uValue - (2 ** 8) : uValue;
	}

	/**
	 * @param {number|string} value 
	 * @returns {number}
	 */
	static toShort(value) {
		var uValue = toUShort(value);
		return value > 2 ** 15 ? uValue - (2 ** 16) : uValue;
	}

	/**
	 * @param {number} value 
	 * @returns {number}
	 */
	static trunc(value) { return value | 0 }

	/**
	 * @param {number} value 
	 * @param {number} min 
	 * @param {number} max 
	 * @returns {number}
	 */
	static wrap(value, min, max) { return (((value - min) % (max + 1 - min)) + (max + 1 - min)) % (max + 1 - min) + min; }

}

class SulvicIO {

	/**
	 * @param {string|URL} url
	 * @param {XMLHttpRequestResponseType} type?
	 * @returns {any}
	 */
	static async getFile(url, type = "blob") {
		var get = () => {
			return new Promise((resolve, reject) => {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", url);
				xhr.responseType = type;
				xhr.onload = function () { console.log(`Attempting to grab the file content: ${url}`); }
				xhr.onreadystatechange = function () {
					if (this.readyState == XMLHttpRequest.DONE) {
						if (this.status >= 200 && this.status < 300) resolve(type === "text" ? this.responseText : this.response);
						else reject({ info: "An error has occured.", message: this.statusText, status: this.status });
					}
				}
				xhr.onerror = function () { reject({ info: "An error has occured.", message: this.statusText, status: this.status }); }
				xhr.send()
			});
		};
		return await get();
	}

	/**
	 * @param {string|URL} url
	 * @returns {string}
	 */
	static getFileText(url) { return SulvicIO.getFile(url, "text"); }

	/**
	 * @param {string|URL} url
	 * @param {XMLHttpRequestResponseType} type?
	 */
	static downloadFile(url, type = "blob") { SulvicIO.getFile(url, type, null); }

	/**
	 * @param {string|URL} url
	 * @param {XMLHttpRequestResponseType} type?
	 * @param {string|undefined} fileName?
	 */
	static downloadFile(url, type = "blob", fileName = null) {
		SulvicIO.getFile(url, type).then(data => {
			console.log(`Attempting to download the requested contents to file: ${fileName}`);
			var dl = document.createElement("a");
			const objectUrl = URL.createObjectURL(new Blob([data], { type: "application/octet-stream" }));
			if (fileName !== null) dl.setAttribute("download", fileName);
			dlhref = objectUrl;
			dl.onclick = function () {
				setTimeout(() => { dl.remove(); }, 100);
				setTimeout(() => { URL.revokeObjectURL(); }, 1500)
			}
			dl.click();
		})
	}

}

/**
 * @param {number} delay 
 * @returns {Promise<any>}
 */
const sleep = (delay) => new Promise(resolve => { setTimeout(() => resolve(), delay); })

/**
 * @returns {Promise<any>}
 */
const waitFn = sleep(0);

window.onload = function () {
	var drawerHandler = document.querySelector("#icon .drawer-handler");
	var drawer = document.querySelector("sulvic-container sulvic-drawer");
	if (drawerHandler != null && drawer != null) drawerHandler.onclick = function (evt) { drawer.classList.toggle("opened"); }
}
