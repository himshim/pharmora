/*
 Universal Search Service
*/


let searchIndex = [];





async function buildSearchIndex(){



searchIndex = [];




const sources = [

{
path:"/data/resources.json",
type:"📄 Resource"
},


{
path:"/data/books.json",
type:"📚 Book"
},


{
path:"/data/events.json",
type:"📅 Event"
},


{
path:"/data/forum.json",
type:"💬 Discussion"
}


];








for(
const source of sources
){


try{


const data =
await fetch(source.path)
.then(r=>r.json());






data.forEach(item=>{



searchIndex.push({


title:
item.title || "",


description:
item.description || "",


type:
source.type,


url:
getSearchURL(
source.type,
item.id
)


});



});



}


catch(e){


console.log(
"Skipped",
source.path
);


}



}



}










function getSearchURL(
type,
id
){


if(type.includes("Resource")){

return "/library/";

}


if(type.includes("Book")){

return "/books/";

}


if(type.includes("Event")){

return "/events/";

}


if(type.includes("Discussion")){

return "/community/";

}



return "/";


}











async function pharmoraSearch(query){



if(
searchIndex.length===0
){

await buildSearchIndex();

}




const box =
document.getElementById(
"search-results"
);




if(!box){

return;

}





if(
query.length < 2
){


box.innerHTML="";


return;


}








const results =
searchIndex.filter(item=>{



let text =
(
item.title +
item.description +
item.type
)
.toLowerCase();



return text.includes(
query.toLowerCase()
);



});










box.innerHTML =

results.length

?

results.map(item=>`



<a
href="${item.url}"
class="card">


<h3>

${item.type}

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

<div class="card">

No results found

</div>

`;




}








buildSearchIndex();