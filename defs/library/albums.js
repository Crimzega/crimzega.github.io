'use strict';

jQuery.fn.insertAt = function(index, elem){
	var lastIndex = $(this).children().length;
	if(index < 0) index = Math.max(0, lastIndex + 1 - index);
	this.append(elem);
	if(index < lastIndex) this.children().eq(index).before(this.children());
	return this;
}

$(function(){

	const container = $('<sulvic-list>').attr('type', 'albums');
	var loadedAlbums = {}, currAlbum, currJson;

	async function openAlbum(elem, json){
		$('modal-container').addClass('opened');
		$('modal-container album-modal .album-title').text(json.album);
		$('modal-container album-modal .album-image').css('background-image', `url(crimzega-sulvic/${elem.data('album')}/folder.png)`);
		var list = $('modal-container album-modal .the-list');
		var album = elem.data('album');
		if(loadedAlbums[album] == null) loadedAlbums[album] = {};
		for(var i = 0; i < json.songs.length; i++){
			var song = json.songs[i];
			var url = `crimzega-sulvic/${album}/${song.file}.mp3`;
			if(Object.entries(loadedAlbums[album]).length < json.songs.length){
				loadedAlbums[album][song.file] = {
					index: i,
					data: await SulvicIO.getFile(url),
					name: song.name
				};
			}
			var currSong = loadedAlbums[album][song.file];
			list.insertAt(i, $('<div>').addClass('song').append(
				$('<span>').addClass('song-title').text(currSong.name),
				$('<audio>').attr('controls', '').attr('controlsList', 'nodownload noplaybackrate').attr('src', url)
			));
		}
		loadedAlbums[album].albumArt = await SulvicIO.getFile(`crimzega-sulvic/${album}/album-art-small.png`),
		loadedAlbums[album].folderArt = await SulvicIO.getFile(`crimzega-sulvic/${album}/folder.png`)
		currAlbum = loadedAlbums[album];
		currJson = json;
		$('modal-container album-modal').addClass('loaded');
	};

	async function downloadAlbum(album, json){
		if(album == null && json == null) throw new Error('No album is currently selected');
		var archive = new JSZip();
		archive.file('AlbumArtSmall.png', currAlbum.albumArt);
		archive.file('Folder.png', currAlbum.folderArt);
		for(var i = 0; i < json.songs.length; i++){
			var song = json.songs[i];
			archive.file(`${song.name}.mp3`, currAlbum[song.file].data);
		}
		archive.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } }).then(zipBlob => {
			saveAs(zipBlob, `${json.album}.zip`);
		});
	};

	async function getJson(jsonFile){ return JSON.parse(await SulvicIO.getFile(jsonFile, 'text')); }

	async function populatePage(entry, index){
		var json = await getJson(`crimzega-sulvic/${entry}.json`);
		var imgUrl = `url('crimzega-sulvic/${entry}/folder.png')`;
		container.insertAt(index, $('<album-viewer>').data('album', entry).attr('title', json.album).css('background-image', imgUrl).click(function(){
			openAlbum($(this), json);
		}));
	};

	$('button.runner').click(function(){
		var self = $(this);
		var parent = self.parent();
		getJson('album-list.json').then(json => { for(var i = 0; i < json.length; i++) populatePage(json[i], i); });
		parent.append($('<h1>').text('Complete album list'), container);
		self.remove();
	});

	$('#download-album').click(() => { downloadAlbum(currAlbum, currJson); });

	$('modal-closer').click(function(){
		var parent = $(this).parent();
		parent.removeClass('opened');
		parent.find('album-modal').removeClass('loaded');
		currAlbum = null;
		currJson = null;
		$('modal-container album-modal .the-list').empty();
	})

});
