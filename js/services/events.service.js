/*
 Events Service v2

 Database-first
 JSON fallback
*/


async function getEvents(){



try{


let events =
await getRecords("events");



if(
events &&
events.length
){


return events;


}



}


catch(e){


console.warn(
"Events database unavailable, using JSON fallback"
);


}







const response =
await fetch(
"/data/events.json"
);



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

📅 ${event.title || ""}

</h2>



<p>

${event.description || ""}

</p>




<br>




<div class="badge">

${event.type || event.category || ""}

</div>






<br><br>




<small>

${event.date || ""}

•

${event.mode || ""}

</small>



</div>



`).join("");



}









/*
 Export Service
*/


window.PharmoraEvents = {


getEvents,


renderEvents


};