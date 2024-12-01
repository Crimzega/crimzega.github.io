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
		return await file;
	}

	async function setData(data){
		decompView.innerText = data.decomp;
		sourceView.innerText = data.source;
	}

	function highlight(){
		setTimeout(() => { hljs.highlightBlock(decompView); }, 20);
		setTimeout(() => { hljs.highlightBlock(sourceView); }, 40);
	}

	selector.addEventListener("change", () => { getData().then(data => { setData(data).then(() => { highlight(); }); }); });
	getData().then(data => { setData(data).then(() => { highlight(); }); });

});
