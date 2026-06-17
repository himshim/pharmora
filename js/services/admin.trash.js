/*
=========================
 TRASH MANAGER
=========================
*/


async function renderTrash(){



let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}




let deleted=[];




for(let collection of reviewCollections){



let data =
await getRecords(
collection
);



data

.filter(x=>x.deleted)

.forEach(x=>{


deleted.push({

...x,

_collection:collection

});


});


}







box.innerHTML = deleted.length

?

deleted.map(item=>`



<div class="panel">


<div>


<h3>

🗑

${item.title || item.name || "Deleted"}

</h3>



<small>

${item._collection}

</small>


</div>



<button

onclick="restoreItem('${item._collection}','${item.id}')">

♻️ Restore

</button>



</div>



`).join("")


:


`

<div class="card">

Trash empty

</div>

`;



}