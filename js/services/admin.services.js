/*
 Admin Service
 Uses Database Adapter
*/





async function renderAdminStats(){



let resources = [];

let users = [];





if(
typeof getRecords==="function"
){


resources =
await getRecords(
"resources"
);


users =
await getRecords(
"users"
);


}








let pendingResources =

resources.filter(

item=>item.status==="pending"

).length;









document

.getElementById(
"admin-stats"
)

.innerHTML = `





<div class="card">


<h2>

${pendingResources}

</h2>


<p>

Pending Resources

</p>


</div>








<div class="card">


<h2>

0

</h2>


<p>

Reports

</p>


</div>








<div class="card">


<h2>

${users.length}

</h2>


<p>

Users

</p>


</div>




`;



}












async function renderAdminActions(){





let box =
document.getElementById(
"admin-actions"
);







let resources=[];






if(

typeof getRecords==="function"

){



resources =

await getRecords(

"resources"

);



}








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


${

item.author?

item.author.name:

"Unknown"


}


</small>



</span>






<span class="status">


Review


</span>





</div>



`).join("");




}