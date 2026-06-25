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


if(!area){

return;

}





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



if(data.length===0){


return `


<div class="card">

No records yet

</div>


`;


}





return data.map(item=>`

<div class="panel">


<div>


<strong>

${displayName(item)}

</strong>


<br>


<small>


${

clean(

item.message ||

item.description ||

item.question ||

item.author ||

item.type ||

""

)

}


<br>


${

item.active===false

?

"🔴 Disabled"

:

item.active===true

?

"🟢 Active"

:

""

}


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

📂 ${clean(cur.name)}

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

📂 ${clean(cur.name)}

→ ${clean(sem.name)}

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

📂 ${clean(cur.name)}

→ ${clean(sem.name)}

<br>

🧪 ${clean(subject.name)}

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

📘 ${clean(course.name)}

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

<button

onclick="showVersions('${item.id}')">

🕘

</button>

</span>



</div>


`;



}







function clean(text){


return String(

text || ""

)

.replaceAll(

"&",

"&amp;"

)

.replaceAll(

"<",

"&lt;"

)

.replaceAll(

">",

"&gt;"

)

.replaceAll(

'"',

"&quot;"

)

.replaceAll(

"'",

"&#39;"

);



}

function displayName(item){


return clean(


item.name ||

item.title ||

item.question ||

item.code ||

(

item.system

?

item.system+" "+(item.number || item.count)

:

"Untitled"

)


);


}








function openAdminModal(content){


let old =
document.getElementById(
"admin-modal"
);


if(old){

old.remove();

}




let modal =
document.createElement(
"div"
);



modal.id =
"admin-modal";



modal.innerHTML = `


<div class="admin-modal-bg"

onclick="closeAdminModal()">

</div>



<div class="admin-modal-box">


<button

class="admin-modal-close"

onclick="closeAdminModal()">

✕

</button>



${content}



</div>


`;



document.body.appendChild(
modal
);


}









function closeAdminModal(){


let modal =
document.getElementById(
"admin-modal"
);



if(modal){

modal.remove();

}


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

${clean(field.label)}

</label>


`;









if(field.type==="textarea"){



html += `


<textarea

id="field-${field.name}"

>${clean(value)}</textarea>


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

value="${clean(opt)}"

${value===opt?"selected":""}

>


${clean(opt)}


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

data-depends="${clean(field.dependsOn || "")}"

onchange="refreshDependentRelations()"

>


<option value="">

Select

</option>


${


records.map(item=>`



<option


value="${clean(item.id)}"


data-parent="${clean(

field.dependsOn

?

(item[field.dependsOn] || "")

:

""

)}"


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

value="${clean(item.id)}"

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





else if(field.type==="tags"){



html += `


<input

type="text"

id="field-${field.name}"

placeholder="comma,separated,tags"

value="${clean(

Array.isArray(value)

?

value.join(",")

:

value

)}"

>


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









else if(field.type==="readonly"){



html += `


<input

readonly

id="field-${field.name}"

value="${clean(value)}"

>


`;



}










else{



html += `


<input

type="${
field.type==="number"
?
"number"
:
field.type==="date"
?
"date"
:
"text"
}"

id="field-${field.name}"

value="${clean(value)}"

>


`;


}






}









html += `



<br>


<button

id="admin-save-btn"

class="btn btn-primary"

onclick="saveEntry('${id || ""}')"

>


Save


</button>



</div>


`;







openAdminModal(
html
);






refreshDependentRelations();



}








function lockAdminSave(){



let btn =
document.getElementById(
"admin-save-btn"
);



if(!btn){

return;

}



btn.disabled=true;



btn.innerHTML=

"Saving...";



}










function unlockAdminSave(){



let btn =
document.getElementById(
"admin-save-btn"
);



if(!btn){

return;

}




btn.disabled=false;




btn.innerHTML=

"Save";



}





async function saveEntry(id){



lockAdminSave();


try{




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

DUPLICATE CHECK

*/


if(

await isDuplicateEntry(
data,
id
)

){



showToast(

"Duplicate entry found",

"error"

);



unlockAdminSave();



return;



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



unlockAdminSave();



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




unlockAdminSave();




loadManager(

activeCollection

);




return;



}









if(id){

if(

typeof saveVersion==="function"

){



let old =
await getRecords(
activeCollection
);



old =
old.find(
x=>x.id===id
);



if(old){


saveVersion(

activeCollection,

id,

old

);


}



}

await updateRecord(

activeCollection,

id,

data

);



}




else{



let moderatedCollections =

(

typeof reviewCollections !== "undefined"

&&

Array.isArray(reviewCollections)

)

?

reviewCollections

:

[

"resources",
"books",
"events",
"tools",
"teaching-materials",
"question-bank",
"assignments"

];



await createRecord(

activeCollection,

{

...data,

status:

moderatedCollections.includes(activeCollection)

?

"approved"

:

"active"

}

);



}








showToast(

"Saved successfully",

"success"

);




closeAdminModal();




unlockAdminSave();





loadManager(

activeCollection

);



}



catch(error){



console.error(error);



showToast(

"Save failed",

"error"

);



unlockAdminSave();



}



}














async function removeEntry(id){



let ok =
await showConfirm(

"Delete this item?"

);




if(!ok){


return;


}







await deleteRecord(

activeCollection,

id

);






showToast(

"Deleted successfully",

"success"

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
async function isDuplicateEntry(
data,
id
){



let records =
await getRecords(
activeCollection
);





if(id){



records =
records.filter(

x=>x.id!==id

);



}










/*
Courses

same education level cannot have duplicate course
*/


if(activeCollection==="courses"){



return records.some(x=>


x.educationLevel===data.educationLevel

&&

x.name?.toLowerCase()

===

data.name?.toLowerCase()


);



}









/*
Curriculum

same course cannot repeat curriculum
*/


if(activeCollection==="curriculums"){



return records.some(x=>


x.course===data.course

&&

x.name?.toLowerCase()

===

data.name?.toLowerCase()


);



}









/*
Subject

same semester cannot repeat code/name
*/


if(activeCollection==="subjects"){



return records.some(x=>


x.semester===data.semester

&&

(

x.code?.toLowerCase()

===

data.code?.toLowerCase()


||


x.name?.toLowerCase()

===

data.name?.toLowerCase()

)


);



}











/*
Units / Chapters

same subject cannot repeat same unit
*/


if(activeCollection==="units"){



return records.some(x=>


x.subject===data.subject

&&

x.type===data.type

&&

String(x.number)

===

String(data.number)


);



}







/*
Question bank duplicate
*/

if(activeCollection==="question-bank"){


return records.some(x=>


x.subject===data.subject

&&

x.question?.toLowerCase()

===

data.question?.toLowerCase()


);


}



/*
Notifications/books/tools/events fallback
*/


return records.some(x=>


(

x.title

&&

data.title

&&

x.title.toLowerCase()

===

data.title.toLowerCase()


)


||


(

x.name

&&

data.name

&&

x.name.toLowerCase()

===

data.name.toLowerCase()


)


);



}

/*
=========================
 VERSION VIEWER
=========================
*/


async function showVersions(id){



if(

typeof getVersions!=="function"

){


showToast(

"Version system unavailable",

"error"

);


return;


}




let versions =
await getVersions(

activeCollection,

id

);







let html = `


<div class="card">


<h2>

🕘 Version History

</h2>


<br>


${

versions.length

?

versions.map(v=>`


<div class="panel">


<div>


<b>

${new Date(v.time).toLocaleString()}

</b>


<br>


${clean(v.user?.name || "System")}


</div>



<button

onclick="restoreVersion('${v.id}','${id}')">

Restore

</button>



</div>


`).join("")


:


"No versions yet"


}


</div>


`;




openAdminModal(html);



}

async function restoreVersion(
versionId
){



let versions =
await getVersions(activeCollection);



let version =
versions.find(
x=>x.id===versionId
);




if(!version){

return;

}





await updateRecord(

activeCollection,

version.contentId,

version.data

);







closeAdminModal();




showToast(

"Version restored",

"success"

);




loadManager(

activeCollection

);



}