(function(){
var savers = document.querySelectorAll('.album-saver');
var container = document.querySelector('.album-container');
var jsons = {};

var jsonFile = '.json';
var mp3File = '.mp3'
var baseSongEnd = '_crimzegaSulvic' + mp3File;

function createAlbumElements(name, path, songs){
	var album = document.createElement('div');
	album.classList = 'album';
	
	var albumName = document.createElement('span');
	albumName.classList = 'name';
	albumName.innerText = name;
	album.appendChild(albumName);
	
	for(var j = 0; j < songs.length; j++){
		var song = songs[j];
		var songContainer = document.createElement('div');
		songContainer.classList = 'song';
		var songName = document.createElement('span');
		songName.classList = 'song-name';
		songName.innerText = song.name;
		songContainer.appendChild(songName);
		
		var songPlayer = document.createElement('audio');
		songPlayer.classList = 'song-player';
		songPlayer.src = path + '/' + song.file + baseSongEnd;
		songPlayer.setAttribute('controls', '');
		songPlayer.volume = 0.5;
		songContainer.appendChild(songPlayer);
		
		album.appendChild(songContainer);
	}
	return album;
}

function grabContents(path){
	var result = null;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){ if(this.status == 200 && this.readyState == 4) result = this.response; }
	xhr.open('GET', path);
	xhr.send();
	return result;
}

function createArchive(name, path, songs){
	var archive = new JSZip();
	archive.file('AlbumArtSmall.png', grabContents(path + '/AlbumArtSmall.png'));
	archive.file('Folder.png', grabContents(path + '/Folder.png'));
	for(var i = 0; i < songs.length; i++){
		var song = songs[i];
		archive.file(song.name + mp3File, path + '/' + song.file + baseSongEnd);
	}
	return archive;
}

function downloadAlbum(albumJson){
	var archive = createArchive(albumJson.album, albumJson.path, albumJson.songs);
	archive.generateAsync({type: 'blob'}).then(function(content){ saveAs(content, albumJson.album + '.zip'); });
}

function loadJson(elem){
	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', elem.dataset.json + jsonFile);
		xhr.onload = function(){
			if(this.status >= 200 && this.status < 300) resolve(JSON.parse(this.response));
			else reject({ status: this.status, statusText: this.statusText });
		};
		xhr.onerror = function(){ reject({ status: this.status, statusText: this.statusText }); }
		xhr.send();
	});
}

async function fillContents(elem){
	var json = await loadJson(elem);
	jsons[elem.dataset.json] = json;
	elem.onclick = function(){ downloadAlbum(jsons[this.dataset.json]); }
	document.querySelector('.album-container').appendChild(createAlbumElements(json.album, json.path, json.songs));
}

for(var i = 0; i < savers.length; i++) {
	var temp = savers[i];
	fillContents(temp).then(function(){ temp.onclick = function(){ downloadAlbum(jsons[this.dataset.json]); } });
}
console.log(jsons);
})();