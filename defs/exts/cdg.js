(() => {
	const DECODER = new TextDecoder();
	let urlPath = location.pathname;

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
}

.download.game-button.disabled,.purchase.game-button{
	background: -webkit-gradient(linear,left top,left bottom,color-stop(0%,#7D7D7D),color-stop(100%,#5F5F5F));
	border: 1px solid #5F5F5F;
}
`;
	document.head.append(univStyleElem);
	if(urlPath == "/") setTimeout(() => { document.querySelector(`.content.welcome > div`).removeAttribute("style"); }, 50);
	else if(urlPath.startsWith("/play/")) waitUntil(`#object[type="application/x-shockwave-flash"`).then(populatePlayPage);
	else if(urlPath.startsWith("/forum/topic/")) setTimeout(() => { document.querySelectorAll(`.topic p.wrap`).forEach(patch); }, 50);
	window.waitFor = waitFor;
	window.waitUntil = waitUntil;
})();
