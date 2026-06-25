/*
 Pharmora Search UI Glue
*/

async function pharmoraSearch(query){

let box = document.getElementById("search-results");

if(!box){ return; }

if(!query || !query.trim()){
box.innerHTML="";
return;
}

if(typeof PharmoraSearchEngine === "undefined"){
return;
}

let results = await PharmoraSearchEngine.search(query);

box.innerHTML = results.map(item=>`
<div class="card">
<h3>${item.title || item.name || "Untitled"}</h3>
<p>${item.description || item.summary || ""}</p>
</div>
`).join("");

}

window.pharmoraSearch = pharmoraSearch;
