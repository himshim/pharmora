/*
 Universal Admin CRUD Service
*/







let activeCollection=null;










async function loadManager(
collection
){



activeCollection =
collection;





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

onclick="addEntry()">


+ Add ${collection}


</button>


<br><br>



${


data.map(item=>`



<div class="panel">


<span>


${item.name || item.title}


</span>





<span>


<button onclick="editEntry('${item.id}')">

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












async function addEntry(){



let name =
prompt(
"Enter name"
);





if(!name){

return;

}





await createRecord(

activeCollection,

{

name:name,

status:"active"

}

);





loadManager(
activeCollection
);



}












async function editEntry(
id
){



let value =
prompt(
"Enter updated name"
);




if(!value){

return;

}






await updateRecord(

activeCollection,

id,

{

name:value

}

);






loadManager(
activeCollection
);



}












async function removeEntry(
id
){



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