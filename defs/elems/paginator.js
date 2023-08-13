class SulvicPaginator extends HTMLElement{

	constructor(){
		super();
		const viewport = document.createElement("div");
		const list = document.createElement("ul");
		var currPage = 0;

		viewport.classList.add("page-view");
		list.classList.add("page-index");

		var noEnds = false;
		if(this.hasAttribute("no-ends")) noEnds = this.getAttribute("no-ends") === "true" || this.getAttribute("no-ends") === "";
		

		if(!noEnds){
			var pageBtn = document.createElement("li");
			pageBtn.dataset.pageId = 0;
			list.append(pageBtn);
			var pageTxt = document.createElement("a");
			pageTxt.innerHTML = "&laquo;";
			pageBtn.append(pageTxt);
		}

		var childElems = [];
		for(var elem of this.children) childElems.push(elem);
		var lastPage = childElems.length;
		for(var i = 0; i < lastPage; i++){
			var viewer = document.createElement("page-viewer");
			var pageBtn = document.createElement("li");
			var pageTxt = document.createElement("a");
			viewer.dataset.pageId = pageBtn.dataset.pageId = i;
			pageTxt.innerHTML = i + 1;
			list.append(pageBtn);
			pageBtn.append(pageTxt);
			viewer.append(childElems[i]);
			viewport.append(viewer);
		}

		if(!noEnds){
			var pageBtn = document.createElement("li");
			pageBtn.dataset.pageId = lastPage - 1;
			list.append(pageBtn);
			var pageTxt = document.createElement("a");
			pageTxt.innerHTML = "&raquo;";
			pageBtn.append(pageTxt);
		}

		for(var elem of list.children) elem.onclick = function(){
			var index = this.dataset.pageId;
			for(var elem1 of list.children) elem1.classList.remove("active");
			for(var elem1 of viewport.children) elem1.classList.remove("opened");
			for(var elem1 of list.children) if(elem1.dataset.pageId == index) elem1.classList.add("active");
			viewport.children[index].classList.add("opened");
		}

		this.innerHTML = "";
		for(var elem of list.children) if(elem.dataset.pageId == 0) elem.classList.add("active");
		viewport.children[0].classList.add("opened");
		this.append(viewport, list);
/*		this.attachShadow({ mode: 'open' });
		const mainElem = this;
		
		for(var elem of list.children) elem.onclick = function(){
			var index = this.dataset.pageId;
			if(mainElem.#currPage != index){
				setPageId(mainElem.#pageData, viewport, index);
				mainElem.#currPage = index;
			}
			for(var elem1 of list.children) elem1.classList.remove("active");
			list.children[index].classList.add("active");
		};

		this.innerHTML = '';
		this.shadowRoot.append(style, viewport, list, script);
		viewport.appendChild(this.#pageData[0]);*/
	}

}

customElements.define('sulvic-paginator', SulvicPaginator);
