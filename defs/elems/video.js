const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

class SulvicVideoElement extends HTMLElement{

	#video;
	#playButton;

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
	height: 3em;
	flex-shrink: 0;
	position: relative;
	top: -3em;
}

.controls .play-btn{
	fill: var(--video-controls-state-color);
	height: 2.2em;
	width: 4.4em;
	margin-bottom: 0.4em;
	margin-top: 0.4em;
}

.controls .play-btn g:not(.active){
	display: none;
}`;
		const vidBase = document.createElement("video");
		const ctrlBase = document.createElement("div");
		
		function buildPlayButton(){
			var btn = document.createElementNS(SVG_NAMESPACE, "svg");
			btn.viewBox.baseVal.x = 0;
			btn.viewBox.baseVal.y = 0;
			btn.viewBox.baseVal.width = 440;
			btn.viewBox.baseVal.height = 220;
			var playSegment = document.createElementNS(SVG_NAMESPACE, "g");
			playSegment.classList.add("active", "play-segment");
			var playSvg = document.createElementNS(SVG_NAMESPACE, "path");
			playSvg.setAttribute("d", "M60,20 380,110 60,200 Z");
			playSegment.appendChild(playSvg);
			var pauseSegment = document.createElementNS(SVG_NAMESPACE, "g");
			pauseSegment.classList.add("pause-segment");
			var pauseSvg = document.createElementNS(SVG_NAMESPACE, "path");
			pauseSvg.setAttribute("d", "M60,20 140,20 140,200 60,200 Z M380,20 300,20 300,200 380,200 Z");
			pauseSegment.appendChild(pauseSvg);
			btn.append(playSegment, pauseSegment);
			return btn;
		}
		const playBtn = buildPlayButton();
		
		vidBase.setAttribute("part", "vid-player");
		if(this.hasAttribute("src")) vidBase.src = this.getAttribute("src");
		if(this.hasAttribute("autoplay")){
			vidBase.autoplay = true;
			playBtn.querySelectorAll("g").forEach(elem => { elem.classList.toggle("active"); });
		}
		if(this.hasAttribute("loop")) vidBase.setAttribute("loop", this.getAttribute("loop"));
		ctrlBase.classList.add("controls");
		playBtn.classList.add("play-btn");
		this.#video = vidBase;
		this.#playButton = playBtn;
		let selfElem = this;

		vidBase.addEventListener("click", () => { selfElem.playVideo(); });

		playBtn.addEventListener("click", () => { selfElem.playVideo(); });

		this.addEventListener("dblclick", this.toggleFullscreen);

		ctrlBase.setAttribute("part", "vid-controls");
		ctrlBase.append(playBtn);
		this.shadowRoot.append(style, this.#video, ctrlBase);
	}

	playVideo(){
		if(this.#video.paused) this.#video.play();
		else this.#video.pause();
		this.#playButton.querySelectorAll("g").forEach(elem => { elem.classList.toggle("active"); });
	}

	toggleFullscreen(){
		if(!document.fullscreenElement) this.requestFullscreen();
		else document.exitFullscreen();
		this.classList.toggle("in-fullscreen");
	}

}

customElements.define('sulvic-video', SulvicVideoElement);
