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









let combined = [

...personal,

...notices

];







box.innerHTML =

combined.length

?

combined.map(item=>`



<div class="notice-item">



<strong>

${item.title}

</strong>



<p>

${item.message}

</p>



<small>

${

item.createdAt ||

item.date ||

""

}

</small>



</div>



`).join("")


:


`

<div class="notice-item">

No notifications

</div>

`;



}










function toggleNotifications(){



document

.getElementById(

"notification-panel"

)

.classList

.toggle(

"show"

);



}






loadNotifications();

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