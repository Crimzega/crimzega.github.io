HTMLCanvasElement.prototype.toBase64 = function(type = 'image/png',quality = 1.0){ return this.toDataURL(type, quality).replace('data:' + type + ';base64,', ''); }

Number.prototype.toHex = function(maxPadding){
	var padding;
	for(var i = 0; i < maxPadding; i++) padding += '0';
	return (padding+this.toString(16)).substr(maxPadding);
}

window.saveFusion = function(zipName){
	var zip = new JSZip(), curr = document.querySelector('canvas#canvas_CHARCurrent');
	curr.getContext('2d');
	zip.file(zipName + '.png', curr.toBase64('image/png'), {base64: true});
	zip.generateAsync({
		type: 'blob',
		compression: 'DEFLATE',
		compressionOptions: {
			level: 6
		}
	}).then(function(content){
		saveAs(content, zipName);
	});
}