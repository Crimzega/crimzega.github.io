document.addEventListener("DOMContentLoaded", () => {
	const selector = document.querySelector(`#file-select`);
	const decompView = document.querySelector(`code-view #file-code.decomp`);
	const sourceView = document.querySelector(`code-view #file-code.source`);
	let storeTexts = {};

	async function getData(){
		let file = selector.value;
		let check = storeTexts[file] != null;
		var data = check? storeTexts[file]: {
			decomp: await SulvicIO.getFileText(`deobf/${file}`),
			source: await SulvicIO.getFileText(`orig/${file}`)
		};
		if(!check) storeTexts[file] = data;
		return await data;
	}

	function setData(data){
		decompView.innerText = data.decomp;
		sourceView.innerText = data.source;
		setTimeout(() => {
			hljs.highlightBlock(decompView);
			hljs.highlightBlock(sourceView);
		}, 40);
	}

	selector.addEventListener("change", () => { getData().then(setData) });
	getData().then(setData);

});
