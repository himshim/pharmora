/*
 Pharmora Home Renderer v2

 Powered by PharmoraUI
*/



async function renderHomeStats(id){


let box =
document.getElementById(id);


if(!box)return;



PharmoraUI.safeRender(

box,

async()=>{


let stats =
await getHomeStats();



return `

<div class="grid">


${

[
["Resources",stats.resources],
["Books",stats.books],
["Events",stats.events],
["Members",stats.users]

]

.map(x=>

PharmoraUI.card({

title:x[1] + "+",

body:x[0],

badge:"Stats"

})

)

.join("")


}


</div>

`;


});


}









async function renderHomeContent(
id,
mode
){


let box =
document.getElementById(id);


if(!box)return;




PharmoraUI.safeRender(

box,

async()=>{


let data =
mode==="trending"

?

await getTrendingContent()

:

await getLatestContent();




return PharmoraUI.list(

data,

item=>

PharmoraUI.entityCard(item)

);


});


}