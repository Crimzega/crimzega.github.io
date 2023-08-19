class SulvicAlbumHandlerElement extends HTMLElement{
	constructor(){
		if(!this.hasAttribute("src")) console.err("Uncaught LinkError: \"src\" is not defined.");
	}
}

customElements.define("album-handler", SulvicAlbumHandlerElement);
