/*
 Pharmora Universal Search Engine
 Dynamic Database Version
*/






let searchIndex=[];









const searchableCollections=[


{
name:"resources",
icon:"📚",
url:"library/"
},



{
name:"books",
icon:"📖",
url:"books/"
},




{
name:"events",
icon:"📅",
url:"events/"
},




{
name:"tools",
icon:"🧰",
url:"tools/"
},




{
name:"courses",
icon:"🎓",
url:"learn/"
},




{
name:"subjects",
icon:"🧪",
url:"learn/"
},




{
name:"categories",
icon:"🏷",
url:"library/"
}



];









function basePath(){



return location.pathname
.split("/")
.length > 2

?

"../"

:

"";



}












async function buildSearchIndex(){



searchIndex=[];








for(

let source of searchableCollections

){








try{






let data=[];






if(

typeof getRecords==="function"

){



data =
await getRecords(
source.name
);



}








data

.filter(item=>{


return (

!item.status

||

item.status==="approved"

);



})


.forEach(item=>{








let text=[


item.title,


item.name,


item.description,


item.author?.name,


item.category,


item.type,


...(item.tags || []),


...(item.subjects || []),


...(item.courses || []),


...(item.semesters || [])


]

.flat()

.filter(Boolean)

.join(" ")

.toLowerCase();










searchIndex.push({



title:

item.title ||

item.name ||

"Untitled",






description:

item.description ||

"",






icon:

source.icon,






url:

basePath()

+

"library/view.html?id="

+

item.id

+

"&type="

+

source.name,






keywords:text






});








});






}




catch(e){



console.log(

"Search skipped:",

source.name

);



}





}









console.log(

"Dynamic Search Loaded",

searchIndex.length

);




}













window.pharmoraSearch =

async function(query){







if(

typeof trackSearch==="function"

){


trackSearch(query);


}









let box =

document.getElementById(

"search-results"

);








if(!box){


return;


}










if(

searchIndex.length===0

){


await buildSearchIndex();


}










if(

query.trim().length < 2

){



box.innerHTML="";


return;



}









let key =

query

.toLowerCase();










let results =

searchIndex.filter(item=>{


return item.keywords.includes(

key

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


<div class="card">


No results found


</div>


`;






};









buildSearchIndex();