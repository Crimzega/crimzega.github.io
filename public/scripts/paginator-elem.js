class SulvicPaginatorElement extends HTMLElement {

	#viewport;
	#indices;
	#children = [];
	#lastIndex = 0;

	#firstPageBtn;
	#lastPageBtn;
	#prevExtrasLi;
	#nextExtrasLi;

	constructor() {
		super();
		this.currentPage = 0;
		this.includesEndButtons = this.hasAttribute("add-ends") && (this.getAttribute("add-ends") === "true" || this.getAttribute("add-ends") === "");
		this.maxViewableButtons = this.#getMaxButtons();
		this.#viewport = document.createElement("div");
		this.#viewport.classList.add("page-viewer");
		this.#indices = document.createElement("ul");
		this.#indices.classList.add("page-indices");
		this.#createNavControls();
		const entries = [...this.children];
		for (const entry of entries) this.appendNewEntry(entry);
		this.#firstPageBtn.dataset.pageId = '0';
		this.#lastPageBtn.dataset.pageId = String(this.#lastIndex - 1);
		this.#indices.prepend(this.#prevExtrasLi);
		if (this.includesEndButtons) this.#indices.prepend(this.#firstPageBtn);
		this.#indices.append(this.#nextExtrasLi);
		if (this.includesEndButtons) this.#indices.append(this.#lastPageBtn);
		if (this.#viewport.children.length > 0) this.#switchPage(0);
		this.append(this.#viewport, this.#indices);
	}

	#createNavControls() {
		const createButton = (label, classes = []) => {
			const item = document.createElement("li");
			const link = document.createElement('a');
			item.classList.add(...classes);
			link.href = '#';
			link.textContent = label;
			item.append(link);
			return item;
		};
		this.#firstPageBtn = createButton('\u00AB');
		this.#lastPageBtn = createButton('\u00BB');
		this.#prevExtrasLi = createButton("\u2026", ["extras", "hidden"]);
		this.#nextExtrasLi = createButton("\u2026", ["extras", "hidden"]);
		this.#firstPageBtn.addEventListener("click", (evt) => {
			evt.preventDefault();
			this.#switchPage(0);
		});
		this.#lastPageBtn.addEventListener("click", (evt) => {
			evt.preventDefault();
			this.#switchPage(this.#lastIndex - 1);
		});
	}

	#findViewableRange() {
		const midpoint = (this.maxViewableButtons - 1) / 2;
		let start = Math.max(this.currentPage - midpoint, 0), end = Math.min(start + this.maxViewableButtons - 1, this.#lastIndex - 1);
		if (end === this.#lastIndex - 1) start = Math.max(end - this.maxViewableButtons + 1, 0);
		return [start, end];
	}

	#getMaxButtons() {
		const defValue = 7;
		if (!this.hasAttribute("max-buttons")) return defValue;
		let value = Number.parseInt(this.getAttribute("max-buttons"), 10);
		if (Number.isNaN(value)) throw new Error("The given value was not a valid number.");
		if (value % 2 === 0) throw new Error("The given value is not an odd number");
		let clampValue = Math.max(Math.min(value, 19), 3);
		if (clampValue !== value) this.setAttribute("max-buttons", String(clampValue));
		return clampValue;
	}

	#switchPage(index) {
		if (index < 0 || index >= this.#lastIndex) return;
		this.currentPage = index;
		for (const btn of this.#indices.children) {
			const pageId = Number(btn.dataset.pageId);
			btn.classList.toggle("active", btn !== this.#firstPageBtn && btn !== this.#lastPageBtn && pageId === index);
		}
		for (const page of this.#viewport.children) page.classList.toggle("opened", Number(page.dataset.pageId) === index);
		this.#updateButtons();
	}

	#updateButtons() {
		if (this.#lastIndex === 0) return;
		const [start, end] = this.#findViewableRange();
		for (const elem of this.#indices.children) {
			const pageId = elem.dataset.pageId;
			if (pageId !== undefined) {
				const pageNum = Number(pageId);
				if (elem === this.#firstPageBtn || elem === this.#lastPageBtn) continue;
				elem.classList.toggle("hidden", pageNum < start || pageNum > end);
			}
		}
		this.#prevExtrasLi.classList.toggle("hidden", start === 0);
		this.#nextExtrasLi.classList.toggle("hidden", end === this.#lastIndex - 1);
		if (this.includesEndButtons) {
			this.#firstPageBtn.classList.toggle("hidden", start === 0);
			this.#lastPageBtn.classList.toggle("hidden", end === this.#lastIndex - 1);
		}
	}

	appendNewEntry(entry) {
		const index = this.#children.length;
		this.#children.push(entry);
		this.#lastIndex = this.#children.length;
		const viewer = document.createElement("page-view");
		viewer.dataset.pageId = String(index);
		const pageBtn = document.createElement("li");
		pageBtn.dataset.pageId = String(index);
		const pageLink = document.createElement('a');
		pageLink.href = '#';
		pageLink.textContent = String(index + 1);
		pageBtn.append(pageLink);
		this.#indices.append(pageBtn);
		viewer.append(entry);
		this.#viewport.append(viewer);
		pageBtn.addEventListener("click", (evt) => {
			evt.preventDefault();
			this.#switchPage(index);
		});
		this.#lastPageBtn.dataset.pageId = String(this.#lastIndex - 1);
		this.#updateButtons();
	}

}

customElements.define("sulvic-paginator", SulvicPaginatorElement);
