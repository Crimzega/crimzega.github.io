(() => {
	const DECODER = new TextDecoder(), FLASH_MIME = `application/x-shockwave-flash`;
	let urlPath = location.pathname;

	class SulvicIO{

		static fileExists(url){
			var xhr = new XMLHttpRequest();
			xhr.open("HEAD", url, false);
			xhr.send();
			return xhr.status != 404;
		}

		static async getFile(url, type = "blob"){
			var get = () => {
				return new Promise((resolve, reject) => {
					var xhr = new XMLHttpRequest();
					xhr.open('GET', url);
					xhr.responseType = type;
					xhr.onload = function(){ console.log(`Attempting to grab the requested file content.`); };
					xhr.onreadystatechange = function(){
						if(this.readyState == XMLHttpRequest.DONE){
							if(this.status >= 200 && this.status < 300) resolve(type === 'text'? this.responseText: this.response);
							else reject({ info: "An error has occured", message: this.statusText, response: this.status });
						}
					};
					xhr.onerror = function(){ reject({i nfo: "An error has occured", message: this.statusText, response: this.status }); };
					xhr.send();
				});
			};
			return await get();
		}
		static downloadFile(url, fileName = null, type = "blob"){
			SulvicIO.getFile(url, type).then(data => {
				console.log(`Attempting to download the requested contents.`);
				var dl = document.createElement("a");
				dl.setAttribute("download", fileName);
				dl.href = URL.createObjectURL(new Blob([data], { type: "application/octet-stream" }));
				dl.click();
				setTimeout(() => { dl.remove(); }, 100);
			});
		}

	}

	function assert(check, msg){ if(!check) throw new Error(msg || "Assertion failed"); }

	function waitFor(sel, timeout = 10000, interval = 1000){
		assert(sel != null && sel.length > 0, "There is no valid selector query.");
		var die = Date.now() + timeout;
		return new Promise((resolve, reject) => {
			var check = setInterval(() => {
				if(Date.now() >= die) reject({ reason:`The selector ${ sel } could not be found within ${timeout / 1000} seconds.` });
				var elem = document.querySelector(sel);
				if(elem != null){
					clearInterval(check);
					resolve(elem);
				}
			}, interval);
		});
	}

	function waitUntil(sel, interval = 1000){
		assert(sel != null && sel.length > 0, "There is no valid selector query.");
		return new Promise(resolve => {
			var check = setInterval(() => {
				var elem = document.querySelector(sel);
				if(elem != null){
					clearInterval(check);
					resolve(elem);
				}
			}, interval);
		});
	}

	function toAnsiCode(cc){
		switch(cc){
			case 0x0152: return 0x8C;
			case 0x0153: return 0x9C;
			case 0x0160: return 0x8A;
			case 0x0161: return 0x9A;
			case 0x0178: return 0x9F;
			case 0x017D: return 0x8E;
			case 0x0192: return 0x83;
			case 0x02C6: return 0x88;
			case 0x02DC: return 0x98;
			case 0x2013: return 0x96;
			case 0x2014: return 0x97;
			case 0x2018: return 0x91;
			case 0x2019: return 0x92;
			case 0x201A: return 0x82;
			case 0x201C: return 0x93;
			case 0x201D: return 0x94;
			case 0x201E: return 0x84;
			case 0x2020: return 0x86;
			case 0x2021: return 0x87;
			case 0x2022: return 0x95;
			case 0x2026: return 0x85;
			case 0x2030: return 0x89;
			case 0x2039: return 0x8B;
			case 0x203A: return 0x9B;
			case 0x20AC: return 0x80;
			case 0x2122: return 0x99;
			default: return cc;
		}
	}

	function ansiToUtf8(str){
		var arr = [];
		for(var ch of str) arr.push(toAnsiCode(ch.charCodeAt()));
		return DECODER.decode(new Uint8Array(arr));
	}

	function fixText(elem){
		for(var node of elem.childNodes){
			switch(node.nodeName){
				case "#text": node.data = ansiToUtf8(node.data);
				break;
			}
		}
	}

	function patch(elem){
		var showElem = elem.querySelector(`span[onclick]`);
		if(showElem == null) fixText(elem);
		else{
			var origFn = showElem.getAttribute("onclick");
			showElem.removeAttribute("onclick");
			showElem.addEventListener("click", function(){
				setTimeout(() => { fixText(elem); },50);
				eval(origFn)();
			});
		}
	}

	var univStyleElem = document.createElement(`style`);
	univStyleElem.innerHTML = `:root{
	--background-color: hsl(0, 0%, 100%);
	--footer-link-color: hsl(0, 0%, 31%);
	--game-background-color: hsl(0, 0%, 80%);
	--game-link-color: hsl(210, 100%, 40%);
	--game-thumb-background-color: hsl(0, 0%, 100%);
	--link-color: hsl(210, 67%, 40%);
	--main-border-color: hsl(0, 0%, 100%);
	--text-color: hsl(0, 0%, 0%);
}

a{
	color: var(--link-color);
}

body{
	background-color: var(--background-color);
}

main{
	background: var(--background-color);
	border-bottom: var(--main-border-color);
}

footer .links a{
	color: var(--footer-link-color);
}

.games .game{
	background-color: hsl(--game-link-color);
}

.games .game a{
	color: hsl(--game-link-color);
}

.games .game .thumb{
	background: var(--game-thumb-background-color) no-repeat center center;
}

.content.welcome > div{
	background: var(--background-color);
	border-bottom-right-radius: 5px;
	padding-bottom: 40px;
	padding-left: 10px;
	padding-right: 10px;
	padding-top: 40px;
}`;

	if(urlPath.startwWith("/") document.querySelector(`.content.welcome > div`).removeAttribute("style");
	else if(urlPath.startsWith("/play/")){
		var objPath = null, objSel = `ruffle-object#object`, cleaned = false;
		if(document.querySelector(`#toggle-flash`).href.includes("ruffle")) objSel = objSel.substring(7);
		function build(elem){
			var baseElem = elem.querySelector(`param[name="base"]`);
			if(baseElem != null){
				self.downloadChildSWF = function(subUrl){
					var swfUrl = `${baseElem.getAttribute("value")}${subUrl}.swf`;
					var swfName = `${subUrl.substr(subUrl.lastIndexOf("/") + 1)}.swf`;
					if(SulvicIO.fileExists(swfUrl)){
						SulvicIO.downloadFile(swfUrl, swfName, FLASH_MIME);
					}
				}
			}
			objPath = elem.getAttribute("data");
			if(objPath != null) dlBtn.classList.remove("disabled");
		}
		var dlStyle = document.createElement("style");
		dlStyle.innerText = `#download.game-button{
		border-style: solid;
		border-width: 1px;
	}
	#download.game-button:not(.disabled){
		background-image: linear-gradient(to bottom, #00AA00, #006600);
		border-color: #0A0;
	}
	#download.game-button.disabled{
		background-image: linear-gradient(to bottom, #666666, #444444);
		border-color: #666;
	}
`;
		let dlBtn = document.createElement("span");
		dlBtn.classList.add("left", "game-button", "disabled");
		dlBtn.id = "download";
		dlBtn.innerText = "Download";
		dlBtn.onclick = function(){
			if(!this.classList.contains("disabled")){
				var gameNameElem = document.querySelector(".game-title a");
				var dlName = `${ gameNameElem }.swf`;
				SulvicIO.downloadFile(objPath, dlName, FLASH_MIME);
			}
		}
		document.head.append(dlStyle);
		document.querySelector(".game-buttons > .left").appendChild(dlBtn);
		document.querySelector(`#toggle-comments.game-button`).addEventListener("click", function(){
			if(!cleaned){
				setTimeout(() => { document.querySelectorAll(`#comments .comments p.wrap`).forEach(patch)}, 50);
				cleaned = true;
			}
		});
		waitUntil(`#dprerollstatus .clickable`).then(elem => { elem.addEventListener("click", function(){ waitFor(objSel, 200, 50).then(build); }); });
		waitUntil(objSel).then(build);
	}
	else if(urlPath.startsWith("/forum/topic/")) setTimeout(() => { document.querySelectorAll(`.topic p.wrap`).forEach(patch); }, 50);
})();
