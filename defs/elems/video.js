class SulvicVideoElement extends HTMLElement{

	constructor(){
		super();
		this.attachShadow({mode: 'open'});
		const style = document.createElement('style');
		style.innerHTML = `:host{
	display: flex;
	flex-direction: column;
	height: 405px;
	width: 720px;
}

video{
	background-color: black;
	height: 100%;
	width: 100%;
}

.controls{
	background-color: var(--video-controls-bg-color);
	grid-row: 2;
	height: 3em;
}`;
		const vidBase = document.createElement("video");
		const ctrlBase = document.createElement("div");
		const playBtn = document.createElement("svg", "")
		vidBase.setAttribute("part", "vid-player");
		if(this.hasAttribute("src")) vidBase.src = this.getAttribute("src");
		if(this.hasAttribute("autoplay")) vidBase.autoplay = true;
		if(this.hasAttribute("loop")) vidBase.setAttribute("loop", this.getAttribute("loop"));
		ctrlBase.classList.add("controls");

		vidBase.onclick = function(){
			if(this.paused) this.play();
			else this.pause();
		}

		this.ondblclick = function(){
			if(!document.fullscreenElement) this.requestFullscreen();
			else document.exitFullscreen();
		}

		ctrlBase.setAttribute("part", "vid-controls");
		this.shadowRoot.append(style, vidBase, ctrlBase);
	}

}

customElements.define('sulvic-video', SulvicVideoElement);
