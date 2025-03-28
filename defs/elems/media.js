const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

var mediaCount = 0;

function updateMediaCount(){ return mediaCount++; }

class SulvicVideoElement extends HTMLElement{

	#player = document.createElement("video");
	#stateButton = document.createElementNS(SVG_NAMESPACE, "svg");

	constructor(){
		super();
		const shadow = this.attachShadow({ mode: "closed" }), styles = document.createElement("style");
		styles.textContent = `
:host{
	position: relative;
	outline: none;
}

`;
		if(this.hasAttribute("src" && this.getAttribute("src") != null) ) this.#player.setAttribute("src", this.getAttribute("src"));
		if(this.hasAttribute("poster") && this.getAttribute("poster") != null) this.#player.setAttribute("poster", this.getAttribute("poster"));
		if(this.hasAttribute("loop")) this.#player.toggleAttribute("loop");
		if(this.hasAttribute("preload") && this.getAttribute("preload").isEither("auto", "metadata", "none")) this.#player.setAttribute("preload", this.getAttribute("preload"));
		else if(!this.hasAttribute("preload")) this.#player.setAttribute("preload", "metadata");
		if(this.hasAttribute("volume")){
			var vol = parseFloat(this.getAttribute("volume"));
			vol = isNaN(vol)? 1: Math.clamp(vol, 0, 1);
			this.#player.volume = vol;
		}
		this.tabIndex = updateMediaCount();
		const controlsElem = document.createElement("div");

		this.#stateButton.classList.add("state-buttons");
		this.#stateButton.setAttribute("version", "1.2");
		this.#stateButton.setAttribute("viewBox", "0 0 440 220");
		this.#stateButton.setAttribute("xmlns", SVG_NAMESPACE);
		let playGraphic = document.createElementNS(SVG_NAMESPACE, "g"), playStatePath = document.createElementNS(SVG_NAMESPACE, "path");
		playStatePath.setAttribute("d", "M60,20 380,110, 60,200 Z");
		playGraphic.classList.add("active");
		playGraphic.setAttribute("part", "media-play-image");
		playGraphic.append(playStatePath);
		let pauseGraphic = document.createElementNS(SVG_NAMESPACE, "g"), pauseStatePath = document.createElementNS(SVG_NAMESPACE, "path");
		pauseStatePath.setAttribute("d", "M60,20 H140 V200 H60 Z M300,20 H380 V200 H300 Z")
		pauseGraphic.classList.add("active");
		pauseGraphic.setAttribute("part", "media-pause-image");
		pauseGraphic.append(pauseStatePath);
		this.#stateButton.append(playGraphic, pauseGraphic);
		controlsElem.append(this.#stateButton);

		shadow.append(styles, this.#player, controlsElem);
	}

}

customElements.define('sulvic-video', SulvicVideoElement);
