class SulvicPaginator extends HTMLElement{

	constructor(){
		super();
		const viewport = document.createElement("div");
		const indices = document.createElement("ul");
		viewport.classList.add("page-viewer");
		indices.classList.add("page-indices");
		this.currentPage = 0;
		this.includesEndButtons = false;
		let self = this;
		if(this.hasAttribute("add-ends")) this.includesEndButtons = this.getAttribute("add-ends") === "true" || this.getAttribute("add-ends") === "";
		this.maxViewableButtons = 7;
		if(this.hasAttribute("max-buttons")){
			var check = parseInt(this.getAttribute("max-buttons"))
			if(check == Number.NaN) throw Error(`The given value was not a valid number.`);
			var index = check;
			if(index % 2 == 0) throw Error(`The given value is not an odd number`);
			if(index < 5) index = 5;
			if(index > 13) index = 13;
			if(check != index) this.setAttribute("max-buttons", index);
			this.maxViewableButtons = index;
		}

		var childElems = [], lastIndex = 0;
		let endBtn = document.createElement("li"), endTxt = document.createElement("a");
		const firstPageBtn = endBtn.cloneNode(), lastPageBtn = endBtn.cloneNode();
		const prevExtrasLi = endBtn.cloneNode(), nextExtrasLi = endBtn.cloneNode();
		firstPageBtn.append(endTxt.cloneNode());
		firstPageBtn.children[0].innerHTML = "&laquo;";
		prevExtrasLi.classList.add("extras", "hidden");
		prevExtrasLi.append(endTxt.cloneNode());
		nextExtrasLi.classList.add("extras", "hidden");
		nextExtrasLi.append(endTxt.cloneNode());
		prevExtrasLi.children[0].innerHTML = nextExtrasLi.children[0].innerHTML = "&hellip;";
		lastPageBtn.append(endTxt.cloneNode());
		lastPageBtn.children[0].innerHTML = "&raquo;";

		function findViewableRange(){
			var index = self.currentPage;
			var maxBtns = self.maxViewableButtons;
			var midPoint = (maxBtns - 1) / 2;
			let start = Math.max(0, index - midPoint);
			let end = Math.min(lastIndex - 1, start + maxBtns - 1);
			if(end == lastIndex - 1) start = Math.max(0, end - maxBtns + 1);
			return [start, end];
		}

		function updateButtons(){
			var [start, end] = findViewableRange();
			for(var elem of indices.children){
				if(elem.dataset.hasOwnProperty("pageId")){
					var id = elem.dataset.pageId;
					if(id >= start && id <= end) elem.classList.remove("hidden");
					else elem.classList.add("hidden");
				}
				else{
					if(elem == prevExtrasLi) elem.classList.toggle("hidden", start == 0);
					if(elem == nextExtrasLi) elem.classList.toggle("hidden", end == lastIndex - 1);
				}
			}
			if(self.includesEndButtons){
				firstPageBtn.classList.toggle("hidden", start == 0);
				lastPageBtn.classList.toggle("hidden", end == lastIndex - 1);
			}
		}

		function switchPage(){
			var index = this.dataset.pageId;
			for(var elem of indices.children){
				if(elem.dataset.pageId != index) elem.classList.remove("active");
				if(elem.dataset.pageId == index) elem.classList.add("active");
			}
			for(var elem of viewport.children) elem.classList.remove("opened");
			self.currentPage = index;
			viewport.children[self.currentPage].classList.add("opened");
			updateButtons();
		}

		this.appendNewEntry = function(entry){
			childElems.push(entry);
			var index = childElems.indexOf(entry);
			lastIndex = childElems.length;
			lastPageBtn.dataset.pageId = lastIndex;
			var viewer = document.createElement("page-view");
			var pageBtn = document.createElement("li");
			var pageTxt = document.createElement("a");
			viewer.dataset.pageId = pageBtn.dataset.pageId = index;
			pageTxt.innerHTML = lastIndex;
			pageBtn.append(pageTxt);
			indices.append(pageBtn);
			setTimeout(function(){ viewer.append(childElems[index]); }, 10);
			viewport.append(viewer);
			pageBtn.onclick = switchPage;
			updateButtons();
		}

		for(var elem of this.children) this.appendNewEntry(elem);

		firstPageBtn.dataset.pageId = 0;
		lastPageBtn.dataset.pageId = lastIndex - 1;
		firstPageBtn.onclick = switchPage;
		lastPageBtn.onclick = switchPage;
		
		indices.prepend(prevExtrasLi);
		if(this.includesEndButtons) indices.prepend(firstPageBtn);
		indices.append(nextExtrasLi);
		if(this.includesEndButtons) indices.append(lastPageBtn);
		viewport.children[this.currentPage].classList.add("opened");
		for(var elem of indices.children) if(elem.dataset.pageId == this.currentPage) elem.classList.add("active");
		updateButtons();
		this.append(viewport, indices);

	}

}

customElements.define('sulvic-paginator', SulvicPaginator);
