/*
 Universal Admin CRUD Service
 Dynamic Schema Based
*/



let activeCollection=null;

let activeSchema=[];





async function loadSchema(){


return await fetch(

appPath(
"config/admin-schema.json"
)

)
.then(r=>r.json());


}









async function loadManager(collection){



activeCollection=collection;



let schemas =
await loadSchema();



activeSchema =
schemas[collection] || [];




let data =
await getRecords(
collection
);




let area =
document.getElementById(
"admin-actions"
);





let content="";





if(

[
"curriculums",
"semesters",
"subjects",
"units"

].includes(collection)

){



content =
await renderGroupedAdmin(

collection,

data

);



}



else{



content =
renderSimpleAdmin(

data

);



}







area.innerHTML=`


<button

class="btn btn-primary"

onclick="showForm()">


+ Add ${collection}


</button>


<br><br>


${content}


`;



}










function renderSimpleAdmin(data){



return data.map(item=>`

<div class="panel">


<div>


<strong>

${displayName(item)}

</strong>


<br>


<small>

${item.description || ""}

</small>


</div>





<div>


<button onclick="showForm('${item.id}')">

✏

</button>



<button onclick="removeEntry('${item.id}')">

🗑

</button>


</div>



</div>


`).join("");



}










async function renderGroupedAdmin(
collection,
data
){



let courses =
await getRecords(
"courses"
);


let curriculums =
await getRecords(
"curriculums"
);


let semesters =
await getRecords(
"semesters"
);


let subjects =
await getRecords(
"subjects"
);





let html="";






courses.forEach(course=>{



let courseHTML="";







/* CURRICULUM VIEW */


if(collection==="curriculums"){



data

.filter(

x=>x.course===course.id

)

.forEach(item=>{


courseHTML +=

adminRow(item);


});



}









/* SEMESTER VIEW */


if(collection==="semesters"){



curriculums

.filter(

c=>c.course===course.id

)

.forEach(cur=>{



let rows="";



data

.filter(

s=>s.curriculum===cur.id

)

.forEach(s=>{


rows += adminRow(s);


});





if(rows){


courseHTML += `


<div class="card">


<h3>

📂 ${cur.name}

</h3>


${rows}


</div>


`;


}



});



}










/* SUBJECT VIEW */


if(collection==="subjects"){



curriculums

.filter(

c=>c.course===course.id

)

.forEach(cur=>{





semesters

.filter(

s=>s.curriculum===cur.id

)

.forEach(sem=>{





let rows="";



data

.filter(

sub=>sub.semester===sem.id

)

.forEach(sub=>{


rows += adminRow(sub);


});





if(rows){


courseHTML += `


<div class="card">


<h3>

📂 ${cur.name}

→ ${sem.name}

</h3>


${rows}


</div>


`;


}



});



});



}









/* UNIT VIEW */


if(collection==="units"){





curriculums

.filter(

c=>c.course===course.id

)

.forEach(cur=>{





semesters

.filter(

s=>s.curriculum===cur.id

)

.forEach(sem=>{





subjects

.filter(

sub=>sub.semester===sem.id

)

.forEach(subject=>{





let rows="";





data

.filter(

u=>u.subject===subject.id

)

.forEach(unit=>{


rows += adminRow(unit);


});






if(rows){


courseHTML += `


<div class="card">


<h3>

📂 ${cur.name}

→ ${sem.name}

<br>

🧪 ${subject.name}

</h3>


${rows}


</div>


`;


}




});



});



});



}








if(courseHTML){



html += `


<div class="card">


<h2>

📘 ${course.name}

</h2>


${courseHTML}


</div>


`;



}



});






return html ||

`

<div class="card">

No records yet

</div>

`;



}

function adminRow(item){



return `


<div class="panel">



<span>

${displayName(item)}

</span>





<span>


<button onclick="showForm('${item.id}')">

✏

</button>



<button onclick="removeEntry('${item.id}')">

🗑

</button>



</span>



</div>


`;



}









function displayName(item){



return (


item.name ||

item.title ||

item.code ||

(

item.system

?

item.system+" "+item.number

:

"Untitled"

)


);



}












async function showForm(id=null){



let existing=null;





if(id){



let records =
await getRecords(
activeCollection
);



existing =
records.find(

x=>x.id===id

);



}







let html=`


<div class="card">


<h2>

${id?"Edit":"Add"}

${activeCollection}

</h2>


<br>


`;









for(let field of activeSchema){





let value =

existing

?

(existing[field.name] ?? "")

:

"";







html += `


<label>

${field.label}

</label>


`;









if(field.type==="textarea"){



html += `


<textarea

id="field-${field.name}"

>${value}</textarea>


`;



}









else if(field.type==="select"){





html += `


<select id="field-${field.name}">


<option value="">

Select

</option>


${


field.options.map(opt=>`


<option

value="${opt}"

${value===opt?"selected":""}

>


${opt}


</option>


`).join("")


}


</select>


`;




}










else if(field.type==="relation"){





let records =
await getRecords(

field.collection

);






html += `



<select

id="field-${field.name}"

data-depends="${field.dependsOn || ""}"

onchange="refreshDependentRelations()"

>


<option value="">

Select

</option>


${


records.map(item=>`



<option


value="${item.id}"


data-parent="${

field.dependsOn

?

(item[field.dependsOn] || "")

:

""

}"


${value===item.id?"selected":""}


>



${displayName(item)}



</option>


`).join("")


}



</select>


`;



}










else if(field.type==="dynamic-multi"){






let records =
await getRecords(

field.source

);





html += `


<div>


${


records.map(item=>`


<label>


<input

type="checkbox"

class="field-${field.name}"

value="${item.id}"

${

Array.isArray(value)

&&

value.includes(item.id)

?

"checked"

:

""

}

>


${displayName(item)}


</label>


<br>


`).join("")


}


</div>


`;



}











else if(field.type==="boolean"){



html += `


<input

type="checkbox"

id="field-${field.name}"

${value?"checked":""}

>


`;



}










else{



html += `


<input

type="${field.type==="number"?"number":"text"}"

id="field-${field.name}"

value="${value}"

>


`;



}






}









html += `



<br>


<button

class="btn btn-primary"

onclick="saveEntry('${id || ""}')"

>


Save


</button>



</div>


`;







document

.getElementById(

"admin-actions"

)

.innerHTML=html;






refreshDependentRelations();



}














async function saveEntry(id){





let data={};






for(let field of activeSchema){







if(field.type==="dynamic-multi"){





let selected=[];






document

.querySelectorAll(

".field-"+field.name+":checked"

)

.forEach(box=>{


selected.push(
box.value
);


});





data[field.name]=selected;



continue;



}








let input =
document.getElementById(

"field-"+field.name

);







let value =

field.type==="boolean"

?

input.checked

:

input.value;







if(

field.type==="tags"

||

field.type==="multi"

){



value =

value

.split(",")

.map(x=>x.trim())

.filter(Boolean);



}







data[field.name]=value;





}









/*

AUTO CREATE SEMESTERS / YEARS

*/



if(

activeCollection==="semesters"

&&

!id

){





let old =
await getRecords(

"semesters"

);






if(

old.some(

x=>x.curriculum===data.curriculum

)

){



showToast(

"Already generated",

"error"

);



return;



}









let total =
Number(

data.count

);








for(

let i=1;

i<=total;

i++

){





await createRecord(

"semesters",

{

course:data.course,

curriculum:data.curriculum,

system:data.system,

number:i,

name:data.system+" "+i,

status:"active"

}

);



}








showToast(

total+" "+data.system+"s created",

"success"

);





loadManager(

activeCollection

);




return;



}









if(id){



await updateRecord(

activeCollection,

id,

data

);



}




else{



await createRecord(

activeCollection,

{

...data,

status:"active"

}

);



}








showToast(

"Saved successfully",

"success"

);






loadManager(

activeCollection

);



}














async function removeEntry(id){





if(

!confirm(

"Delete this item?"

)

){


return;


}






await deleteRecord(

activeCollection,

id

);






loadManager(

activeCollection

);



}












function refreshDependentRelations(){





let selects =

document.querySelectorAll(

"select[data-depends]"

);







selects.forEach(select=>{






let parentName =

select.dataset.depends;






if(!parentName){

return;

}







let parent =
document.getElementById(

"field-"+parentName

);






if(!parent){

return;

}







let parentValue =
parent.value;








select

.querySelectorAll(

"option"

)

.forEach(option=>{






if(!option.dataset.parent){

return;

}







option.hidden =

option.dataset.parent !== parentValue;






});






});





}