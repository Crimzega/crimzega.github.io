var SulvicAPI = {};

(function(){
	
	//class SulvicGame{}
	
	//class SulvicVideo{}
	
	class SulvicUtils{}
	
	function padNumber(value, padding){
		padding = padding || 2;
		return ("00" + value).slice(-padding);
	}
	
	SulvicUtils.clampValue = function(value, min, max){ return value < min? min: value > max? max: value; }
	
	SulvicUtils.convertToTimestamp = function(value){
		var ms = value % 1000;
		value = (value - ms) / 1000;
		var s = value % 60;
		value = (value - s) / 60;
		var m = value % 60;
		var h = (value - m) / 60;
		return String.format("{0}:{1}:{2}.{3}", padNumber(h), padNumber(m), padNumber(s), padNumber(ms, 3));
	}
	
	SulvicAPI.Utils = SulvicUtils;
	if(!String.prototype.format){
		String.prototype.format = function(){
			var args = arguments;
			return this.replace(/{(\d+)}/g, function(match, number){ return typeof args[number] != 'undefined'? args[number]: match; });
		};
	}
	if(!String.format){
		String.format = function(format){
			var args = Array.prototype.slice.call(arguments, 1);
			return format.replace(/{(\d+)}/g, function(match, number){ return typeof args[number] != 'undefined'? args[number]: match; });
		};
	}
	
})();