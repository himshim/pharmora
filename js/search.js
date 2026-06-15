/*
 Pharmora Universal Search Engine
 Dynamic Database Version
 Hierarchy Optimized
*/



let searchIndex=[];

let relationCache={};







const searchableCollections=[


{
name:"resources",
icon:"📚",
page:"library/view.html"
},


{
name:"books",
icon:"📖",
page:"library/view.html"
},


{
name:"events",
icon:"📅",
page:"library/view.html"
},


{
name:"tools",
icon:"🧰",
page:"library/view.html"
},


{
name:"courses",
icon:"🎓",
page:"learn/"
},


{
name:"curriculums",
icon:"📘",
page:"learn/"
},


{
name:"semesters",
icon:"📅",
page:"learn/"
},


{
name:"subjects",
icon:"🧪",
page:"learn/"
},


{
name:"units",
icon:"📄",
page:"learn/"
}, 

{
name:"teaching-materials",
icon:"👨‍🏫",
page:"library/view.html"
},


{
name:"question-bank",
icon:"❓",
page:"library/view.html"
},


{
name:"assignments",
icon:"📝",
page:"library/view.html"
},


];









async function loadRelation(
collection
){



if(

relationCache[collection]

){


return relationCache[collection];


}





try{



relationCache[collection] =

await getRecords(

collection

);



}



catch(error){



relationCache[collection]=[];



}





return relationCache[collection];



}









async function resolveName(
collection,
id
){



if(!id){

return "";

}





let records =
await loadRelation(
collection
);





let item =
records.find(

x=>x.id===id

);





return item

?

(

item.name ||

item.title ||

item.code ||

""

)

:

"";



}









async function buildSearchIndex(){





searchIndex=[];

relationCache={};







for(

let source of searchableCollections

){





try{





let data =
await getRecords(

source.name

);








for(

let item of data

){









if(

item.status

&&

![

"approved",

"active"

]

.includes(

item.status

)

){


continue;


}










let hierarchy=[



await resolveName(
"courses",
item.course
),



await resolveName(
"curriculums",
item.curriculum
),



await resolveName(
"semesters",
item.semester
),



await resolveName(
"subjects",
item.subject
),



await resolveName(
"units",
item.unit
)



];











let keywords=[



item.title,


item.name,


item.description,


item.code,


item.type,


item.category,


item.author?.name,


...hierarchy,


...(item.tags || [])



]

.flat()

.filter(Boolean)

.join(" ")

.toLowerCase();









let url =

[

"resources",

"books",

"events",

"tools"

]

.includes(

source.name

)

?

appPath(

`library/view.html?id=${item.id}&type=${source.name}`

)

:

appPath(

source.page

);











searchIndex.push({



title:

item.title ||

item.name ||

item.code ||

"Untitled",




description:

item.description || "",





icon:

source.icon,





url:url,





keywords:keywords




});






}





}





catch(error){



/* ignore missing collections */



}





}





}









window.pharmoraSearch =

async function(query){








let box =
document.getElementById(

"search-results"

);




if(!box){

return;

}








if(

typeof trackSearch==="function"

){



trackSearch(query);



}










if(

searchIndex.length===0

){


await buildSearchIndex();


}









query =

query

.trim()

.toLowerCase();









if(query.length < 2){



box.innerHTML="";

return;



}











let results =
searchIndex.filter(

item=>

item.keywords.includes(

query

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