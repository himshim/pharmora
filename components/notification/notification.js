/*
 Notification Component
*/


async function loadNotifications(){



const box =
document.getElementById(
"notification-panel"
);



if(!box){

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









box.innerHTML = `


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


`;















}










function toggleNotifications(){


let panel =
document.getElementById(
"notification-panel"
);


if(!panel){

return;

}


panel
.classList
.toggle(
"show"
);


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


let bell =
document.querySelector(
".notification-link"
);


if(bell){


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


}


}


},





toggle:
function(){

return toggleNotifications();

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