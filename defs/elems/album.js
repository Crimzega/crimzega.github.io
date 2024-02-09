class SulvicAlbumHandlerElement extends HTMLElement{
	constructor(){
		super();
		if(!this.hasAttribute("src") || this.getAttribute("src") === "") console.error("Uncaught TypeError: \"src\" is not defined.");
		console.log(SulvicIO.getFileText(this.getAttribute("src")));
	}
}

customElements.define("album-handler", SulvicAlbumHandlerElement);
