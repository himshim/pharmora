/*
 Pharmora Home Renderer
*/



async function renderHomeStats(id){



let box =
document.getElementById(id);


if(!box)return;




let stats =
await getHomeStats();



box.innerHTML = `


<div class="card">

<h2>${stats.resources}+</h2>

<p>Resources</p>

</div>



<div class="card">

<h2>${stats.books}+</h2>

<p>Books</p>

</div>



<div class="card">

<h2>${stats.events}+</h2>

<p>Events</p>

</div>



<div class="card">

<h2>${stats.users}+</h2>

<p>Members</p>

</div>


`;



}








async function renderHomeContent(
id,
mode
){



let box =
document.getElementById(id);


if(!box)return;




let data =
mode==="trending"

?

await getTrendingContent()

:

await getLatestContent();




box.innerHTML="";




data.forEach(item=>{


box.innerHTML += `


<div class="card">


<div class="badge">

${item._collection}

</div>



<h2>

${item.title || item.name}

</h2>



<p>

${item.description || ""}

</p>



</div>


`;


});



}