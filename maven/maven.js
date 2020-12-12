class Maven{}
	
Maven.loadMavenPath = function(reqGroup, opName = '', opVersion = ''){
	var group, name, version;
	if(reqGroup.indexOf(':') != -1){
		var temp = reqGroup.split(':');
		group = temp[0];
		name = temp[1];
		version = temp[2];
	}
	else{
		group = reqGroup;
		name = opName;
		version = opVersion;
	}
	console.log(`Attempting to gather contents from ${group}:${name}:${version}`);
}