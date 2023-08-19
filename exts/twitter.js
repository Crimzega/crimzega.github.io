function useOldTwitter(){
	console.log("SulvicSystems [X to Twitter] {GitHub Website}");
	var currTitle = document.title;
	if(currTitle.includes("on X")) currTitle = currTitle.replaceAll("on X", "on Twitter");
	if(currTitle.includes(" / X")) currTitle = currTitle.replaceAll(" / X", "");
	document.title = currTitle;
	const currSvg = document.querySelector("svg.r-1nao33i.r-4qtqp9.r-yyyyoo.r-16y2uox.r-8kz0gk.r-dnmrzs.r-bnwqim.r-1plcrui.r-lrvibr.r-lrsllp[viewBox=\"0 0 24 24\"] path");
	if(currSvg.getAttribute("d") != "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z") currSvg.setAttribute("d", "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z");
	const currIcon = document.querySelector("link[rel=\"shortcut icon\"]");
	if(currIcon.href.includes("ico")) currIcon.href = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHBhdGggZmlsbD0iaHNsKDIwMywgODkuMSUsIDUzLjElKSIgZD0iTTIzLjY0MyA0LjkzN2MtLjgzNS4zNy0xLjczMi42Mi0yLjY3NS43MzMuOTYyLS41NzYgMS43LTEuNDkgMi4wNDgtMi41NzgtLjkuNTM0LTEuODk3LjkyMi0yLjk1OCAxLjEzLS44NS0uOTA0LTIuMDYtMS40Ny0zLjQtMS40Ny0yLjU3MiAwLTQuNjU4IDIuMDg2LTQuNjU4IDQuNjYgMCAuMzY0LjA0Mi43MTguMTIgMS4wNi0zLjg3My0uMTk1LTcuMzA0LTIuMDUtOS42MDItNC44NjgtLjQuNjktLjYzIDEuNDktLjYzIDIuMzQyIDAgMS42MTYuODIzIDMuMDQzIDIuMDcyIDMuODc4LS43NjQtLjAyNS0xLjQ4Mi0uMjM0LTIuMTEtLjU4M3YuMDZjMCAyLjI1NyAxLjYwNSA0LjE0IDMuNzM3IDQuNTY4LS4zOTIuMTA2LS44MDMuMTYyLTEuMjI3LjE2Mi0uMyAwLS41OTMtLjAyOC0uODc3LS4wODIuNTkzIDEuODUgMi4zMTMgMy4xOTggNC4zNTIgMy4yMzQtMS41OTUgMS4yNS0zLjYwNCAxLjk5NS01Ljc4NiAxLjk5NS0uMzc2IDAtLjc0Ny0uMDIyLTEuMTEyLS4wNjUgMi4wNjIgMS4zMjMgNC41MSAyLjA5MyA3LjE0IDIuMDkzIDguNTcgMCAxMy4yNTUtNy4wOTggMTMuMjU1LTEzLjI1NCAwLS4yLS4wMDUtLjQwMi0uMDE0LS42MDIuOTEtLjY1OCAxLjctMS40NzcgMi4zMjMtMi40MXoiPjwvcGF0aD48L2c+PC9zdmc+";
}

document.querySelector("a[link]").forEach(elem => { elem.onclick = function(){ setTimeout(useOldTwitter, 4000); } });

window.onchange = function(){ setTimeout(useOldTwitter, 4000); }

setTimeout(useOldTwitter, 4000);
