const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

class SulvicVideoElement extends HTMLElement {

	static #stateHoldDelayMS = 250;
	static #observed = ["src", "poster", "loop", "preload", "volume", "playback-rate"];

	#player = document.createElement("video");
	#stateButton = document.createElementNS(SVG_NAMESPACE, "svg");

	#playGraphic;
	#pauseGraphic;
	#stateHoldTimer = null;
	#stateChangeHeld = false;
	#stateSpeedActive = false;
	#normalPlaybackRate = 1;
	#statePrior = null;

	#seekTrackBar;
	#seekThumb;
	#seekViewed;
	#seekLoaded;
	#seeking = false;
	#resumeAfterSeek = false;

	#controls;
	#connected = false;

	constructor() {
		super();
		const shadow = this.attachShadow({ mode: "closed" });
		const styleElem = document.createElement("style");
		styleElem.textContent = `:host{
	--bg-color: hsl(0, 0%, 0%);
	--controls-bg-color: hsla(0, 0%, 65%, 0.5);
	--controls-state-color: hsla(0, 0%, 75%, 0.8);
	--state-color: hsla(0, 0%, 75%, 0.8);
	--seek-bg-color: hsla(0, 0%, 100%, 0.35);
	--seek-track-color: hsl(180, 100%, 38%);
	--seek-loaded-color: hsla(0, 0%, 100%, 0.35);
	--seek-thumb-border-color: hsl(0, 0%, 15%);
	background-color: var(--bg-color);
	position: relative;
	display: inline-block;
	outline: none;
}

video{
	display: block;
	height: 100%;
	width: 100%;
}

track-bar{
	background-color: var(--seek-bg-color);
	box-sizing: border-box;
	cursor: pointer;
	height: 4px;
	position: relative;
	touch-action: none;
	width: 100%;
	transition-property: height;
	transition-duration: 0.15s;
}

track-bar:hover{
	height: 8px;
}

track-loaded,
track-current {
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
}

track-loaded {
	background-color: var(--seek-loaded-color);
	width: 0;
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
}

track-current {
	background-color: var(--seek-track-color);
	width: 0;
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
}

track-thumb {
	background-color: var(--seek-track-color);
	border-radius: 50%;
	box-sizing: border-box;
	height: 14px;
	left: 0;
	padding: 0;
	position: absolute;
	top: 50%;
	transform: translateX(-50%) translateY(-50%);
	transition-property: height, width;
	transition-duration: 0.15s;
	width: 14px;
}

track-bar:hover track-thumb{
	height: 20px;
	width: 20px;
}

track-thumb:active {
	cursor: pointer;
}

track-bar:focus-visible {
	outline: 0.15rem solid white;
	outline-offset: 0.15rem;
}

.controls{
	background-color: var(--controls-bg-color);
	bottom: 0;
	display: flex;
	flex-direction: column;
	left: 0;
	position: absolute;
	width: 100%;
}

.control-row{
	display: flex;
	width: 100%;
}

.state-button{
	cursor: pointer;
	padding: 0.7rem;
	pointer-events: auto;
	width: 4rem;
}

.state-icon{
	display: none;
	fill: var(--controls-state-color);
}

.state-icon.active{
	display: block;
}

@media (prefers-color-scheme: dark) {

	:host{
		--controls-bg-color: hsla(0, 0%, 14%, 0.5);
		--controls-state-color: hsla(0, 0%, 35%, 0.8);
	}

}
`;

		this.tabIndex = 0;
		this.setAttribute("role", "application");
		this.setAttribute("aria-label", "Sulvic Video Player");
		this.#configurePlayer();
		this.#createStateButton();
		this.#createSeekBar();
		this.#controls = document.createElement("div");
		this.#controls.classList.add("controls");
		this.#controls.setAttribute("part", "media-control-bar");

		const controlRow = document.createElement("div");
		controlRow.classList.add("control-row");
		controlRow.setAttribute("part", "media-control-row");
		controlRow.append(this.#stateButton);

		this.#controls.append(this.#seekTrackBar, controlRow);
		shadow.append(styleElem, this.#player, this.#controls);
	}

	static get observedAttributes() { return SulvicVideoElement.#observed; }

	#configurePlayer() {
		if (this.hasAttribute("src")) this.#player.src = this.getAttribute("src");
		if (this.hasAttribute("poster")) this.#player.poster = this.getAttribute("poster");
		this.#player.loop = this.hasAttribute("loop") && (this.getAttribute("loop") === "" || this.getAttribute("loop") === "true");
		const preload = this.getAttribute("preload");
		this.#player.preload = StringHelper.isEither(preload, "auto", "metadata", "none") ? preload : "metadata";
		if (this.hasAttribute("volume")) {
			const volume = Number.parseFloat(this.getAttribute("volume"));
			this.#player.volume = Number.isFinite(volume) ? SulvicMath.clamp(volume, 0, 1) : 1;
		}
		if (this.hasAttribute("playback-rate")) {
			const rate = Number.parseFloat(this.getAttribute("playback-rate"));
			this.#player.playbackRate = Number.isFinite(rate) ? SulvicMath.clamp(rate, 0.25, 4) : 1;
		}
	}

	#createSeekBar() {
		this.#seekTrackBar = document.createElement("track-bar");
		this.#seekTrackBar.setAttribute("part", "media-seek-track");
		this.#seekTrackBar.setAttribute("role", "slider");
		this.#seekTrackBar.setAttribute("aria-label", "Video Progress");
		this.#seekTrackBar.setAttribute("aria-valuemin", '0');
		this.#seekTrackBar.setAttribute("aria-valuemax", '0');
		this.#seekTrackBar.setAttribute("aria-valuenow", '0');

		this.#seekLoaded = document.createElement("track-loaded");
		this.#seekLoaded.setAttribute("part", "media-seek-loaded");

		this.#seekViewed = document.createElement("track-current");
		this.#seekViewed.setAttribute("part", "media-seek-viewed");

		this.#seekThumb = document.createElement("track-thumb");
		this.#seekThumb.setAttribute("part", "media-seek-thumb");
		this.#seekThumb.setAttribute("aria-label", "Seek Video");

		this.#seekTrackBar.append(this.#seekLoaded, this.#seekViewed, this.#seekThumb);
	}

	#createStateButton() {
		this.#stateButton.classList.add("state-button");
		this.#stateButton.setAttribute("viewBox", "0 0 440 220");
		this.#stateButton.setAttribute("aria-label", "Play Video");
		this.#stateButton.setAttribute("role", "button");
		this.#playGraphic = document.createElementNS(SVG_NAMESPACE, 'g');
		this.#playGraphic.classList.add("state-icon", "active");
		this.#playGraphic.setAttribute("part", "media-play-image");
		const playPath = document.createElementNS(SVG_NAMESPACE, "path");
		playPath.setAttribute('d', "M60,20 380,110 60,200 Z");
		this.#playGraphic.append(playPath);
		this.#pauseGraphic = document.createElementNS(SVG_NAMESPACE, 'g');
		this.#pauseGraphic.classList.add("state-icon");
		this.#pauseGraphic.setAttribute("part", "media-pause-image");
		const pausePath = document.createElementNS(SVG_NAMESPACE, "path");
		pausePath.setAttribute('d', "M60,20 H140 V200 H60 Z M300,20 H380 V200 H300 Z");
		this.#pauseGraphic.append(pausePath);
		this.#stateButton.append(this.#playGraphic, this.#pauseGraphic);
	}

	#getTime(clientX) {
		const dur = this.duration;
		if (dur === 0) return 0;
		const rect = this.#seekTrackBar.getBoundingClientRect();
		const ratio = SulvicMath.clamp((clientX - rect.left) / rect.width, 0, 1);
		return ratio * dur;
	}

	#handleEnded = () => {
		this.#updatePlaybackState();
		this.dispatchEvent(new Event("ended", { bubbles: true, composed: true }));
	}

	#progressPercentage(time) {
		const dur = this.duration;
		if (dur === 0) return 0;
		return SulvicMath.clamp((time / dur) * 100, 0, 100);
	}

	#lastBufferedEnd() {
		const { buffered } = this.#player;
		return buffered.length === 0 ? 0 : buffered.end(buffered.length - 1);
	}

	#handleError = () => {
		this.dispatchEvent(new CustomEvent("sulvic-media-error", {
			detail: {
				error: this.#player.error
			},
			bubbles: true,
			composed: true
		}));
	}

	#handleKeyDown = (evt) => {
		switch (evt.code) {
			case "Space":
				evt.preventDefault();
				if (evt.repeat || this.#stateChangeHeld) return;
				this.#stateChangeHeld = true;
				this.#stateHoldTimer = window.setTimeout(() => {
					if (!this.#stateChangeHeld) return;
					this.#statePrior = {
						wasPaused: this.paused,
						playbackRate: this.playbackRate
					};
					this.#normalPlaybackRate = this.playbackRate;
					this.playbackRate = 2;
					this.#stateSpeedActive = true;
					this.toggleAttribute("fast-forwarding", true);
					if (this.#statePrior.wasPaused) void this.play();
				}, SulvicVideoElement.#stateHoldDelayMS);
				break;
			case "End":
				evt.preventDefault();
				this.currentTime = this.duration;
				break;
			case "Home":
				evt.preventDefault();
				this.currentTime = 0;
				break;
			case "ArrowLeft":
				evt.preventDefault();
				var newTime = Math.max(this.currentTime - 5, 0)
				this.currentTime = newTime;
				break;
			case "ArrowUp":
				evt.preventDefault();
				this.volume += 0.05;
				break;
			case "ArrowRight":
				evt.preventDefault();
				var newTime = Math.min(this.currentTime + 5, this.duration);
				this.currentTime = newTime;
				break;
			case "ArrowDown":
				evt.preventDefault();
				this.volume -= 0.05;
				break;
			case "KeyM":
				evt.preventDefault();
				this.muted = !this.muted;
				break;
			case "Comma":
				evt.preventDefault();
				if (this.paused) {
					var newTime = Math.max(this.currentTime - (1 / 30), 0)
					this.currentTime = newTime;
				}
				break;
			case "Period":
				evt.preventDefault();
				if (this.paused) {
					var newTime = Math.min(this.currentTime + (1 / 30), this.duration);
					this.currentTime = newTime;
				}
				break;
		}
	}

	#handleKeyUp = (evt) => {
		if (evt.code !== "Space") return;
		evt.preventDefault();
		this.#stateChangeHeld = false;
		if (this.#stateHoldTimer !== null) {
			clearTimeout(this.#stateHoldTimer);
			this.#stateHoldTimer = null;
		}
		if (this.#stateSpeedActive) {
			this.playbackRate = this.#normalPlaybackRate;
			this.#stateSpeedActive = false;
			this.toggleAttribute("fast-forwarding", false);
			if (this.#statePrior?.wasPaused) this.pause();
			this.#statePrior = null;
			return;
		}
		this.togglePlayback();
	}

	#handleLoadedMetadata = () => {
		this.dispatchEvent(new CustomEvent("loadedmetadata", {
			detail: {
				duration: this.duration,
				videoWidth: this.#player.videoWidth,
				videoHeight: this.#player.videoHeight
			},
			bubbles: true,
			composed: true
		}));
	}

	#handlePause = () => {
		this.#updatePlaybackState();
		this.dispatchEvent(new Event("pause", { bubbles: true, composed: true }));
	}

	#handlePlay = () => {
		this.#updatePlaybackState();
		this.dispatchEvent(new Event("play", { bubbles: true, composed: true }));
	}

	#handleSeekHeld = (evt) => {
		if (this.duration === 0) return;
		evt.preventDefault();
		this.#seeking = true;
		this.#resumeAfterSeek = !this.paused;
		this.pause();
		this.#seekTrackBar.setPointerCapture(evt.pointerId);
		this.#seekTo(evt.clientX);
	}

	#handleSeekMove = (evt) => {
		if (!this.#seeking) return;
		evt.preventDefault();
		this.#seekTo(evt.clientX);
	}

	#handleSeekReleased = (evt) => {
		if (!this.#seeking) return;
		this.#seeking = false;
		if (this.#seekTrackBar.hasPointerCapture(evt.pointerId)) this.#seekTrackBar.releasePointerCapture(evt.pointerId);
		if (this.#resumeAfterSeek) void this.play();
		this.#resumeAfterSeek = false;
		this.#updateSeekBar();
	}

	#handleState = (evt) => {
		evt.preventDefault();
		this.togglePlayback();
	}

	#handleThumbHeld = (evt) => {
		evt.preventDefault();
		evt.stopPropagation();
		this.#handleSeekHeld(evt);
	}

	#handleVolumeChange = () => {
		this.toggleAttribute("muted", this.muted);
		this.dispatchEvent(new CustomEvent("volumechange", {
			detail: {
				muted: this.muted,
				volume: this.volume
			},
			bubbles: true,
			composed: true
		}))
	}

	#seekTo(clientX) {
		const time = this.#getTime(clientX);
		this.currentTime = time;
		this.#updateSeekBar();
	}

	#updatePlaybackState() {
		const isPlaying = !this.paused && !this.ended;
		this.#playGraphic.classList.toggle("active", !isPlaying);
		this.#pauseGraphic.classList.toggle("active", isPlaying);
		this.#stateButton.setAttribute("aria-label", isPlaying ? "Pause Video" : "Play Video");
		this.toggleAttribute("playing", isPlaying);
	}

	#updateSeekBar = () => {
		const dur = this.duration;
		if (dur === 0) {
			this.#seekLoaded.style.width = "0%";
			this.#seekViewed.style.width = "0%";
			this.#seekThumb.style.left = "0%";
			this.#seekTrackBar.setAttribute("aria-valuemax", 0);
			this.#seekTrackBar.setAttribute("aria-valuenow", 0);
			this.#seekTrackBar.setAttribute("aria-valuetext", "0:00");
			return;
		}
		const viewedPercent = this.#progressPercentage(this.currentTime);
		const bufferedPercent = this.#progressPercentage(this.#lastBufferedEnd());

		this.#seekLoaded.style.width = `${bufferedPercent}%`;
		this.#seekViewed.style.width = `${viewedPercent}%`;
		this.#seekThumb.style.left = `${viewedPercent}%`;

		this.#seekTrackBar.setAttribute("aria-valuemax", String(this.duration));
		this.#seekTrackBar.setAttribute("aria-valuenow", String(this.currentTime));
		this.#seekTrackBar.setAttribute("aria-valuetext", `${this.#formatTime(this.currentTime)} of ${this.#formatTime(dur)}`);
	}

	#formatTime(time) {
		if (!Number.isFinite(time) || time < 0) return "0:00";
		const timeWhole = Math.floor(time);
		const hrs = Math.floor(timeWhole / 3600);
		const mins = Math.floor((timeWhole % 3600) / 60);
		const secs = timeWhole % 60;
		return hrs > 0 ? `${String(hrs)}:${SulvicMath.padStart(mins, 2, '0')}:${SulvicMath.padStart(secs, 2, '0')}` : `${String(mins)}:${SulvicMath.padStart(secs, 2, '0')}`;
	}

	async play() {
		try {
			await this.#player.play();
		}
		catch (err) {
			this.dispatchEvent(new CustomEvent("sulvic-play-error", { detail: { err }, bubbles: true, composed: true }));
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case "src":
				this.#player.src = newValue ?? "";
				break;
			case "poster":
				this.#player.poster = newValue ?? "";
				break;
			case "loop":
				this.#player.loop = this.hasAttribute("loop") && (this.getAttribute("loop") === "" || this.getAttribute("loop") === "true");
				break;
			case "preload":
				this.#player.preload = ["auto", "metadata", "none"].includes(newValue) ? newValue : "metadata";
				break;
			case "playback-rate":
				this.#player.playbackRate = Number.parseFloat(newValue ?? '1');
				break;
			case "volume":
				this.volume = Number.parseFloat(newValue ?? '1');
				break;
		}
	}

	connectedCallback() {
		if (this.#connected) return;
		this.#connected = true;
		this.#stateButton.addEventListener("click", this.#handleState);
		this.addEventListener("keydown", this.#handleKeyDown);
		this.addEventListener("keyup", this.#handleKeyUp);
		this.#seekTrackBar.addEventListener("pointerdown", this.#handleSeekHeld);
		this.#seekTrackBar.addEventListener("pointermove", this.#handleSeekMove);
		this.#seekTrackBar.addEventListener("pointerup", this.#handleSeekReleased);
		this.#seekTrackBar.addEventListener("pointercancel", this.#handleSeekReleased);
		this.#seekThumb.addEventListener("pointerdown", this.#handleThumbHeld);
		this.#player.addEventListener("click", this.#handleState);
		this.#player.addEventListener("play", this.#handlePlay);
		this.#player.addEventListener("pause", this.#handlePause);
		this.#player.addEventListener("ended", this.#handleEnded);
		this.#player.addEventListener("volumechange", this.#handleVolumeChange);
		this.#player.addEventListener("loadedmetadata", this.#handleLoadedMetadata);
		this.#player.addEventListener("error", this.#handleError);
		this.#player.addEventListener("timeupdate", this.#updateSeekBar);
		this.#player.addEventListener("progress", this.#updateSeekBar);
		this.#player.addEventListener("durationchange", this.#updateSeekBar);
		this.#player.addEventListener("loadedmetadata", this.#updateSeekBar);
		this.#player.addEventListener("emptied", this.#updateSeekBar);
		this.#updatePlaybackState();
	}

	disconnectedCallback() {
		if (!this.#connected) return;
		this.#connected = false;
		this.#stateButton.removeEventListener("click", this.#handleState);
		this.removeEventListener("keydown", this.#handleKeyDown);
		this.removeEventListener("keyup", this.#handleKeyUp);
		this.#seekTrackBar.removeEventListener("pointerdown", this.#handleSeekHeld);
		this.#seekTrackBar.removeEventListener("pointermove", this.#handleSeekMove);
		this.#seekTrackBar.removeEventListener("pointerup", this.#handleSeekReleased);
		this.#seekTrackBar.removeEventListener("pointercancel", this.#handleSeekReleased);
		this.#seekThumb.removeEventListener("pointerdown", this.#handleThumbHeld);
		this.#player.removeEventListener("click", this.#handleState);
		this.#player.removeEventListener("play", this.#handlePlay);
		this.#player.removeEventListener("pause", this.#handlePause);
		this.#player.removeEventListener("ended", this.#handleEnded);
		this.#player.removeEventListener("volumechange", this.#handleVolumeChange);
		this.#player.removeEventListener("loadedmetadata", this.#handleLoadedMetadata);
		this.#player.removeEventListener("error", this.#handleError);
		this.#player.removeEventListener("timeupdate", this.#updateSeekBar);
		this.#player.removeEventListener("progress", this.#updateSeekBar);
		this.#player.removeEventListener("durationchange", this.#updateSeekBar);
		this.#player.removeEventListener("loadedmetadata", this.#updateSeekBar);
		this.#player.removeEventListener("emptied", this.#updateSeekBar);
		if (this.#stateHoldTimer !== null) {
			clearTimeout(this.#stateHoldTimer);
			this.#stateHoldTimer = null;
		}
	}

	pause() { this.#player.pause(); }

	togglePlayback() {
		if (this.#player.paused || this.#player.ended) {
			void this.play();
			return;
		}
		this.pause();
	}

	get currentTime() { return this.#player.currentTime; }

	set currentTime(value) { this.#player.currentTime = value; }

	get duration() {
		var dur = this.#player.duration;
		return Number.isFinite(dur) && dur > 0 ? dur : 0;
	}

	get ended() { return this.#player.ended; }

	get muted() { return this.#player.muted; }

	set muted(value) {
		const boolValue = Boolean(value)
		this.#player.muted = boolValue;
	}

	get playbackRate() { return this.#player.playbackRate; }

	set playbackRate(value) {
		const numValue = Number(value);
		if (!Number.isFinite(numValue)) throw new TypeError("Playback Rate must be a finite number.");
		this.#player.playbackRate = SulvicMath.clamp(numValue, 0.25, 4);
	}

	get paused() { return this.#player.paused; }

	get volume() { return this.#player.volume; }

	set volume(value) {
		const numValue = Number(value);
		if (!Number.isFinite(numValue)) throw new TypeError("Volume must be a finite number.");
		this.#player.volume = SulvicMath.clamp(numValue, 0, 1);
	}

}

customElements.define("sulvic-video", SulvicVideoElement);
