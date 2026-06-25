/*
 Pharmora Dynamic Schema Engine
 v1.0

 Universal form renderer for:
 - Contributions
 - Entity editor
 - Admin editor
 - Profile extensions
*/


(function(){


const schemas={};





/* ======================
 REGISTER SCHEMA
====================== */


function register(
type,
schema
){


schemas[type]={

version:
schema.version || 1,

fields:
schema.fields || []

};


}







/* ======================
 GET SCHEMA
====================== */


function getSchema(type){


return schemas[type] || null;


}










/* ======================
 CREATE FIELD
====================== */


async function createField(
field,
value=""
){



const wrap =
document.createElement("div");


wrap.className =
"form-group";




const label =
document.createElement("label");


label.textContent =
field.label +
(field.required ? " *" : "");



wrap.appendChild(label);




let input;





/* textarea */


if(
field.type==="textarea"
){


input =
document.createElement("textarea");


input.value=value || "";


}






/* select */


else if(
field.type==="select"
){


input =
document.createElement("select");



(field.options || [])

.forEach(opt=>{


let option =
document.createElement("option");


option.value =
opt.value || opt;


option.textContent =
opt.label || opt;


if(
option.value===value
){

option.selected=true;

}



input.appendChild(option);



});


}









/* reference field */


else if(
field.type==="reference"
){



input =
document.createElement("select");



let empty =
document.createElement("option");


empty.textContent =
"Select";


empty.value="";


input.appendChild(empty);




if(
typeof getRecords==="function"
){


try{


let records =
await getRecords(
field.collection
);



records.forEach(item=>{


let option =
document.createElement("option");


option.value=item.id;


option.textContent =
item.name ||
item.title ||
item.label ||
item.id;



if(
item.id===value
){

option.selected=true;

}


input.appendChild(option);



});



}catch(e){


console.warn(
"Reference failed",
field.collection
);


}



}



}





/* default */


else{


input =
document.createElement("input");


input.type =
field.type || "text";


input.value =
value || "";


}





input.dataset.field =
field.key;



if(field.placeholder){

input.placeholder =
field.placeholder;

}



wrap.appendChild(input);



return wrap;


}









/* ======================
 RENDER FORM
====================== */


async function render(
type,
target,
existing={}
){



let schema =
getSchema(type);



let container =
typeof target==="string"
?
document.getElementById(target)
:
target;




if(
!schema ||
!container
){

return;

}



container.innerHTML="";




for(
const field of schema.fields
){



let element =
await createField(

field,

existing[field.key]

);



container.appendChild(
element
);



}



}










/* ======================
 COLLECT DATA
====================== */


function collect(target){



let container =
typeof target==="string"
?
document.getElementById(target)
:
target;




let data={};



container

.querySelectorAll("[data-field]")

.forEach(el=>{


data[
el.dataset.field
]

=

el.value;


});



return data;


}










/* ======================
 VALIDATION
====================== */


function validate(
type,
data
){



let schema =
getSchema(type);


let errors=[];



if(!schema){

return errors;

}



schema.fields.forEach(field=>{



if(
field.required &&
!data[field.key]
){


errors.push(

field.label+
" is required"

);


}



});



return errors;


}











/* ======================
 EXPORT
====================== */


window.PharmoraSchema={


register,

getSchema,

render,

collect,

validate


};



console.log(

"✓ Pharmora Schema Engine Ready"

);



})();