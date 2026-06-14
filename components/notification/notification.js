/*
 Notification Component
*/


async function loadNotifications(){


const box =
document.getElementById("notification-panel");


if(!box){

return;

}



const notices =
await fetch("/config/notices.json")
.then(r=>r.json());





box.innerHTML =
notices.map(item=>`

<div class="notice-item">


<strong>

${item.title}

</strong>


<p>

${item.message}

</p>


<small>

${item.date}

</small>


</div>


`).join("");



}



function toggleNotifications(){


document
.getElementById("notification-panel")
.classList
.toggle("show");


}




loadNotifications();