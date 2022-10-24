$(function(){

	const selector = $('#file-select');
	var storeTexts = {};

	async function getSelection(){
		var file = selector.val();
		if(storeTexts[file] == null){
			storeTexts[file] = {
				decomp: await SulvicIO.getFile(`deobf/${file}`, 'text'),
				source: await SulvicIO.getFile(`orig/${file}`, 'text')
			};
		}
		hljs.highlightBlock($('code-view #file-code.decomp').text(storeTexts[file].decomp)[0]);
		hljs.highlightBlock($('code-view #file-code.source').text(storeTexts[file].source)[0]);
	}

	selector.change(function(){ getSelection(); });
	$(this).ready(function(){ getSelection(); });

});
