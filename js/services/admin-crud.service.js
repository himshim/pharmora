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





area.innerHTML = `


<button
class="btn btn-primary"
onclick="showForm()">

+ Add ${collection}

</button>


<br><br>


${

data.map(item=>`


<div class="panel">


<div>


<strong>


${

item.name ||

item.title ||

item.code ||

(item.system ? item.system+" "+item.number : "") ||

"Untitled"

}


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


`).join("")


}


`;



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










/* TEXTAREA */


if(field.type==="textarea"){


html += `

<textarea
id="field-${field.name}"
placeholder="${field.label}"
>${value}</textarea>

`;


}










/* SELECT */


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











/* RELATION */


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


${

item.name ||

item.title ||

item.code ||

(item.system ? item.system+" "+item.number : "") ||

"Unnamed"

}


</option>


`).join("")


}


</select>


`;



}










/* DYNAMIC MULTI */


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


${

item.name ||

item.title ||

item.code

}


</label>


<br>


`).join("")


}


</div>


`;



}










/* BOOLEAN */


else if(field.type==="boolean"){



html += `


<input

type="checkbox"

id="field-${field.name}"

${value ? "checked" : ""}

>


`;



}











/* DEFAULT */


else{



html += `


<input

type="${field.type==="number"?"number":"text"}"

id="field-${field.name}"

value="${

Array.isArray(value)

?

value.join(",")

:

value

}"

placeholder="${field.label}"

>


`;



}



}









html += `


<br>


<button

class="btn btn-primary"

onclick="saveEntry('${id || ""}')">


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





let value;






if(field.type==="boolean"){


value=input.checked;


}


else{


value=input.value;


}








if(

field.type==="tags"

||

field.type==="multi"

){



value = value

.split(",")

.map(x=>x.trim())

.filter(Boolean);



}





data[field.name]=value;




}











/* AUTO GENERATE SEMESTERS / YEARS */


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

old.some(x=>x.curriculum===data.curriculum)

){



showToast(

"Already generated",

"error"

);



return;



}








let total =
Number(data.count);





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


name:

data.system+" "+i,


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