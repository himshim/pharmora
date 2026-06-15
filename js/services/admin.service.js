/*
 Admin Service
 Uses Database Adapter
*/







async function renderAdminStats(){



let resources =
await getRecords(
"resources"
);





let pending =

resources.filter(

item=>item.status==="pending"

).length;








document
.getElementById(
"admin-stats"
)
.innerHTML = `




<div class="card">


<h2>${pending}</h2>


<p>

Pending Resources

</p>


</div>





<div class="card">


<h2>${resources.length}</h2>


<p>

Total Resources

</p>


</div>




`;



}









async function renderAdminActions(){





let box =
document.getElementById(
"admin-actions"
);






let resources =
await getRecords(
"resources"
);







let pending =
resources.filter(

item=>item.status==="pending"

);









if(
pending.length===0
){


box.innerHTML=`


<div class="panel">


Everything reviewed


<span class="status">

✓

</span>


</div>


`;


return;


}









box.innerHTML =
pending.map(item=>`




<div class="panel">


<span>


📚 ${item.title}


<br>


<small>


${item.author?.name || "Unknown"}


</small>


</span>






<span>



<button onclick="approveResource('${item.id}')">

✅

</button>



<button onclick="rejectResource('${item.id}')">

❌

</button>




</span>


</div>



`).join("");




}










async function approveResource(id){



await updateRecord(

"resources",

id,

{
status:"approved"
}

);





renderAdminStats();

renderAdminActions();



}










async function rejectResource(id){



await updateRecord(

"resources",

id,

{
status:"rejected"
}

);





renderAdminStats();

renderAdminActions();



}