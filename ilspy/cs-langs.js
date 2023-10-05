document.addEventListener("DOMContentLoaded", function(){

	const selector = document.querySelector("#file-select");
	const decompView = document.querySelector("code-view #file-code.decomp");
	const sourceView = document.querySelector("code-view #file-code.source");
	var storeTexts = {};

	async function getSelection(){
		var file = selector.value;
		if(storeTexts[file] == null){
			storeTexts[file] = {
				decomp: await SulvicIO.getFileText(`deobf/${file}`),
				source: await SulvicIO.getFileText(`orig/${file}`)
			}
		}
		decompView.innerText = storeTexts[file].decomp;
		sourceView.innerText = storeTexts[file].source;
		hljs.highlightBlock(document.querySelector("code-view #file-code.decomp"));
		hljs.highlightBlock(document.querySelector("code-view #file-code.source"));
	}

	selector.addEventListener("change", function(){ getSelection(); });
	getSelection();

});