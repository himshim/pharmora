/*
 Events Service
*/


async function getEvents(){


const response =
await fetch("/data/events.json");


return await response.json();


}





async function renderEvents(id){


const root =
document.getElementById(id);



if(!root){

return;

}



const events =
await getEvents();





root.innerHTML =
events.map(event=>`

<div class="card">


<h2>

📅 ${event.title}

</h2>


<p>

${event.description}

</p>


<br>


<div class="badge">

${event.type}

</div>


<br><br>


<small>

${event.date}
•
${event.mode}

</small>



</div>


`).join("");



}