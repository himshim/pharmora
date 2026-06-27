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
<a href="${item.url || '#'}" class="card glass search-result" style="text-decoration: none; color: inherit;">
<h3>${item.icon || ''} ${item.title || item.name || "Untitled"}</h3>
<p>${item.description || item.summary || ""}</p>
</a>
  `).join("");

}

window.pharmoraSearch = pharmoraSearch;
