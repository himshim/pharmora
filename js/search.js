/*
 Pharmora Universal Search Engine
 Dynamic Database Version
*/



let searchIndex=[];






const searchableCollections=[



{
name:"resources",
icon:"📚"
},



{
name:"books",
icon:"📖"
},



{
name:"events",
icon:"📅"
},



{
name:"tools",
icon:"🧰"
},



{
name:"courses",
icon:"🎓"
},



{
name:"subjects",
icon:"🧪"
},



{
name:"categories",
icon:"🏷"
},



{
name:"tags",
icon:"🔖"
}



];











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

item.description || "",






icon:

source.icon,







url:

appPath(

`library/view.html?id=${item.id}&type=${source.name}`

),







keywords:text






});








});







}





catch(error){



console.log(

"Search skipped:",

source.name

);



}




}








console.log(

"Search ready:",

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








const box =

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








const key =

query.toLowerCase();








const results =

searchIndex.filter(item=>


item.keywords.includes(
key
)


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





};










document.addEventListener(

"DOMContentLoaded",

()=>{


buildSearchIndex();


}

);