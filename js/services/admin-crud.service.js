/*
 Universal Admin CRUD Service
 Dynamic Schema Based
*/



let activeCollection=null;

let activeSchema=[];








async function loadSchema(){


return await fetch(

"/config/admin-schema.json"

)

.then(r=>r.json());


}









async function loadManager(
collection
){



activeCollection =
collection;




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



<span>


${item.name || item.title || "Untitled"}



<br>


<small>


${

(item.tags || [])

.join(", ")

}


</small>



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




`).join("")


}



`;




}














async function showForm(
id=null
){



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









for(
let field of activeSchema
){






let value =

existing ?

(existing[field.name] || [])

:

[];









html += `


<label>

${field.label}

</label>


`;









if(

field.type==="dynamic-multi"

){





let options =

await getRecords(

field.source

);









options.forEach(option=>{






let checked =

value.includes(option.id)

||

value.includes(option.name)

?

"checked"

:

"";










html += `



<label>


<input

type="checkbox"

class="field-${field.name}"

value="${option.name}"

${checked}

>


${option.name}



</label>


<br>


`;






});







}









else{






html += `



<input

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



}













async function saveEntry(id){





let data={};








for(
let field of activeSchema
){








if(

field.type==="dynamic-multi"

){







let selected=[];






document

.querySelectorAll(

".field-" + field.name + ":checked"

)

.forEach(box=>{


selected.push(

box.value

);


});








data[field.name]=selected;







}










else{






let value =

document.getElementById(

"field-" + field.name

).value;










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