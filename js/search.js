/*
 Universal Search Engine
 Path Safe Version
*/


let searchIndex = [];





function getBasePath(){


return location.pathname.split("/").length > 2

?

"../"

:

"";


}










async function buildSearchIndex(){



searchIndex=[];



const base =
getBasePath();





const sources=[



{
file:"data/resources.json",
type:"📄 Resource",
url:"library/"
},



{
file:"data/books.json",
type:"📚 Book",
url:"books/"
},




{
file:"data/events.json",
type:"📅 Event",
url:"events/"
},




{
file:"data/forum.json",
type:"💬 Forum",
url:"community/"
}



];









for(const source of sources){


try{


let response =
await fetch(
base + source.file
);




if(!response.ok){

continue;

}



let data =
await response.json();







data.forEach(item=>{



searchIndex.push({


title:
item.title || "",


description:
item.description || "",


type:
source.type,


url:
base + source.url,


keywords:[


item.title,


item.description,


item.category,


item.course,


item.semester,


item.subject,


item.unit,


item.author,


item.type,


...(item.tags || [])


]

.flat()

.join(" ")

.toLowerCase()


});



});



}



catch(error){


console.log(
"Search error",
source.file,
error
);


}



}





console.log(
"Universal Search Loaded",
searchIndex.length
);



}









window.pharmoraSearch =
async function(value){





const box =
document.getElementById(
"search-results"
);




if(!box){

return;

}





if(searchIndex.length===0){


await buildSearchIndex();


}






if(value.length < 2){



box.innerHTML="";


return;


}






let keyword =
value.toLowerCase();






let results =
searchIndex.filter(item=>{


return item.keywords.includes(
keyword
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




};







buildSearchIndex();