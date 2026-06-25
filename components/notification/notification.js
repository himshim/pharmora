/*
 Notification Component
*/


async function loadNotifications(){



const boxes =
document.querySelectorAll(
".notification-panel"
);



if(!boxes.length){

return;

}





let notices=[];





try{


notices =
await fetch(

appPath(
"config/notices.json"
)

)

.then(r=>r.json());


}

catch(e){}







let personal=[];



if(

typeof getMyNotifications==="function"

){



personal =
await getMyNotifications();



}









let html = `


<div class="notification-head">

<strong>
🔔 Notifications
</strong>


<span
class="notification-close"
onclick="
this.closest('.notification-panel')
.classList.remove('show')
">

×


</span>


</div>



<h3>
👤 Your Notifications
</h3>


${
personal.length
?
personal.map(renderNotice).join("")
:
"<p>No personal notifications</p>"
}


<br>


<h3>
📢 Announcements
</h3>


${
notices.length
?
notices.map(renderNotice).join("")
:
"<p>No announcements</p>"
}


<div class="notification-footer">

<a
class="btn"
href="/components/notification/">

View all notifications →

</a>

</div>


`;

boxes.forEach(box=>{

box.innerHTML = html;

});













}










function toggleNotifications(id){


let panel =
document.getElementById(
id
);


if(!panel){

return;

}


document
.querySelectorAll(".notification-panel")
.forEach(x=>{

if(x!==panel){

x.classList.remove("show");

}

});


panel.classList.toggle("show");


}






window.addEventListener(
"pharmora-ready",
()=>{

loadNotifications();

}
);

/*
 Global Notification UI API
*/

window.PharmoraNotification = {


refresh:
async function(){


await loadNotifications();


if(
typeof PharmoraNotify==="undefined"
){

return;

}


let unread =
await PharmoraNotify.unread();



document
.querySelectorAll(
".notification-dot"
)
.forEach(x=>x.remove());



if(unread.length){


document
.querySelectorAll(
".notification-link"
)
.forEach(bell=>{


let badge =
document.createElement(
"span"
);


badge.className =
"notification-dot";


badge.innerText =
unread.length;


bell.appendChild(
badge
);


});


}


},





toggle:
function(id){

return toggleNotifications(id);

},





count:
async function(){


if(
typeof PharmoraNotify==="undefined"
){

return 0;

}


let unread =
await PharmoraNotify.unread();


return unread.length;


}


};

function renderNotice(item){


let data =
{
...item,
...item.data
};


return `

<div class="notice-item">

<strong>
${data.title}
</strong>


<p>
${data.message}
</p>


<small>
${data.createdAt || data.date || ""}
</small>


</div>

`;


}