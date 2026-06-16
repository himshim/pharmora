/*
 Pharmora Public Content Service
 Universal Content + Filters
*/



async function getPublished(collection){


let data =
await getRecords(
collection
);



return data.filter(item=>{

return (

item.status==="approved"

||

item.status===undefined

);

});


}










async function resolveName(
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









async function renderContent(
collection,
target,
filters={}
){



let box =
document.getElementById(
target
);



if(!box){

return;

}




let items =
await getPublished(
collection
);






items =
applyContentFilters(
items,
filters
);






if(items.length===0){



box.innerHTML = `


<div class="card empty-state">


<h2>

No content found

</h2>


<p>

Try changing filters.

</p>


</div>


`;



return;



}









let html="";






for(let item of items){







let course =
await resolveName(
"courses",
item.course
);



let curriculum =
await resolveName(
"curriculums",
item.curriculum
);



let semester =
await resolveName(
"semesters",
item.semester
);



let subject =
await resolveName(
"subjects",
item.subject
);



let unit =
await resolveName(
"units",
item.unit
);










let title =

item.title ||

item.question ||

item.name ||

"Untitled";







let description =

item.description ||

item.instructions ||

item.answer ||

"";









html += `



<div class="card">






<h2>

${contentIcon(collection)}

${title}

</h2>






<p>

${description}

</p>






<small>



${item.resourceType ? "📂 "+item.resourceType+"<br>" : ""}


${item.materialType ? "👨‍🏫 "+item.materialType+"<br>" : ""}


${item.questionType ? "❓ "+item.questionType+"<br>" : ""}


${item.difficulty ? "⭐ "+item.difficulty+"<br>" : ""}



${course ? "🎓 "+course+"<br>" : ""}


${curriculum ? "📘 "+curriculum+"<br>" : ""}


${semester ? "📅 "+semester+"<br>" : ""}


${subject ? "🧪 "+subject+"<br>" : ""}


${unit ? "📄 "+unit+"<br>" : ""}





${

(item.tags || []).length

?

"🏷 "+item.tags.join(", ")

:

""

}



</small>







<br><br>






<a

class="btn"

href="${

appPath(

`library/view.html?id=${item.id}&type=${collection}`

)

}"

>


Open


</a>






</div>




`;



}






box.innerHTML = html;



}













function applyContentFilters(
items,
filters
){



return items.filter(item=>{



if(

filters.course

&&

item.course!==filters.course

){

return false;

}




if(

filters.semester

&&

item.semester!==filters.semester

){

return false;

}






if(

filters.subject

&&

item.subject!==filters.subject

){

return false;

}






if(

filters.difficulty

&&

item.difficulty!==filters.difficulty

){

return false;

}






if(filters.tags){



let tags =

(item.tags || [])

.join(" ")

.toLowerCase();




if(

!tags.includes(

filters.tags.toLowerCase()

)

){

return false;

}



}







return true;



});



}












async function applyFilters(){



let filters={



course:

document.getElementById(
"filter-course"
)?.value,


semester:

document.getElementById(
"filter-semester"
)?.value,


subject:

document.getElementById(
"filter-subject"
)?.value,


difficulty:

document.getElementById(
"filter-difficulty"
)?.value,


tags:

document.getElementById(
"filter-tags"
)?.value



};







let type =
document.getElementById(
"filter-type"
)?.value;








if(type){



renderContent(
type,
type+"-list",
filters
);



return;



}









renderContent(
"resources",
"resources-list",
filters
);



renderContent(
"books",
"books-list",
filters
);



renderContent(
"teaching-materials",
"teaching-list",
filters
);



renderContent(
"question-bank",
"questions-list",
filters
);



renderContent(
"assignments",
"assignments-list",
filters
);



}









function contentIcon(type){



return {

resources:"📚",

books:"📖",

events:"📅",

tools:"🧰",

"teaching-materials":"👨‍🏫",

"question-bank":"❓",

assignments:"📝"


}[type]

||

"📄";



}