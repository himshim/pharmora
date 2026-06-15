/*
 Pharmora Universal Search Engine
 Dynamic Database Version
 Hierarchy Ready
*/



let searchIndex=[];







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
}


];










async function resolveSearchName(
collection,
id
){



if(!id){

return "";

}



try{



let data =
await getRecords(
collection
);



let item =
data.find(

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



catch(e){


return "";


}



}









async function buildSearchIndex(){



searchIndex=[];






for(let source of searchableCollections){






try{





let data =
await getRecords(
source.name
);







for(let item of data){







if(

item.status

&&

item.status!=="approved"

&&

item.status!=="active"

){

continue;

}










let course =
await resolveSearchName(

"courses",

item.course

);





let curriculum =
await resolveSearchName(

"curriculums",

item.curriculum

);





let semester =
await resolveSearchName(

"semesters",

item.semester

);





let subject =
await resolveSearchName(

"subjects",

item.subject

);





let unit =
await resolveSearchName(

"units",

item.unit

);









let text=[



item.title,

item.name,

item.description,

item.code,

item.type,

item.category,


course,

curriculum,

semester,

subject,

unit,


item.author?.name,


...(item.tags || [])



]


.flat()

.filter(Boolean)

.join(" ")

.toLowerCase();









let url="";






if(

[
"resources",
"books",
"events",
"tools"

].includes(source.name)

){



url =
appPath(

`library/view.html?id=${item.id}&type=${source.name}`

);



}




else{



url =
appPath(

source.page

);



}










searchIndex.push({



title:

item.title ||

item.name ||

item.code ||

"Untitled",



description:

item.description ||

"",



icon:

source.icon,



url:url,



keywords:text



});








}









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







let key =

query.toLowerCase();







let results =

searchIndex.filter(

item=>

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