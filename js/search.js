/*
 Pharmora Search UI
*/


window.pharmoraSearch =
async function(query){



let box =
document.getElementById(
"search-results"
);



if(!box){

return await PharmoraSearchEngine.search(query);

}




if(

typeof trackSearch==="function"

){

trackSearch(query);

}





query =
query.trim();




if(query.length<2){

box.innerHTML="";

return [];

}





box.innerHTML=

`
<div class="card">

Searching...

</div>
`;






let results =

await PharmoraSearchEngine.search(
query
);






box.innerHTML =

results.length

?


results.map(item=>`

<a

href="${item.url}"

class="card"

>


<h3>

${item.icon}

</h3>


<h2>

${item.title}

</h2>


<p>

${item.description}

</p>


</a>


`).join("")


:


`

<div class="card empty-state">

No results found

</div>

`;


return results;


};