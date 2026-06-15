/*
 Admin Service
*/



async function loadData(path){


return await fetch(path)

.then(response=>response.json());


}








async function renderAdminStats(){



const resources =
await loadData(
"/data/resources.json"
);



const events =
await loadData(
"/data/events.json"
);



const users =
await loadData(
"/data/users.json"
);







const pendingResources =
resources.filter(
item=>item.status==="pending"
).length;




const pendingEvents =
events.filter(
item=>item.status==="pending"
).length;








document
.getElementById("admin-stats")
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

${pendingEvents}

</h2>


<p>

Pending Events

</p>


</div>






<div class="card">


<h2>

${users.length}

</h2>


<p>

Registered Users

</p>


</div>



`;



}









async function renderAdminActions(){



const box =
document.getElementById(
"admin-actions"
);




const resources =
await loadData(
"/data/resources.json"
);



const events =
await loadData(
"/data/events.json"
);






let actions = [];






resources

.filter(
item=>item.status==="pending"
)

.forEach(item=>{


actions.push({

icon:"📚",

title:item.title,

type:"Resource"

});


});






events

.filter(
item=>item.status==="pending"
)

.forEach(item=>{


actions.push({

icon:"📅",

title:item.title,

type:"Event"


});


});







if(actions.length===0){



box.innerHTML = `


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
actions.map(item=>`



<div class="panel">


<span>


${item.icon}

${item.title}


</span>




<span class="status">


${item.type}


</span>



</div>



`).join("");



}