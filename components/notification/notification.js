/*
 Pharmora Notification Component v3
 Responsive Notification UI
 Compatible with PharmoraNotification API
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
let personal=[];



try{


notices =
await fetch(
appPath("config/notices.json")
)
.then(r=>r.json());


}
catch(e){

notices=[];

}




try{


if(typeof getMyNotifications==="function"){


personal =
await getMyNotifications();


}


}
catch(e){

personal=[];

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






<div class="badge">

👤 Personal

</div>


<br><br>



${
personal.length

?

personal.map(renderNotice).join("")

:

`

<div class="empty-state">

No personal notifications

</div>

`

}







<br>






<div class="badge">

📢 Platform Updates

</div>



<br><br>




${
notices.length

?

notices.map(renderNotice).join("")

:

`

<div class="empty-state">

No announcements

</div>

`

}








<div class="notification-footer">


<a
class="btn btn-primary btn-small"
href="${appPath("notifications/")}
>

View all →

</a>


</div>


`;






boxes.forEach(box=>{


box.innerHTML=html;


});



}









function toggleNotifications(id){



let panel =
document.getElementById(id);



if(!panel){

return;

}




document

.querySelectorAll(
".notification-panel"
)

.forEach(item=>{


if(item!==panel){


item.classList.remove(
"show"
);


}


});





panel.classList.toggle(
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
 Global Notification API
*/


window.PharmoraNotification={




refresh:


async function(){



await loadNotifications();




if(

typeof PharmoraNotify==="undefined"

){


return;


}





let unread=[];



try{


unread =
await PharmoraNotify.unread();


}
catch(e){

unread=[];

}






document

.querySelectorAll(
".notification-dot"
)

.forEach(dot=>dot.remove());







if(unread.length){



document

.querySelectorAll(
".notification-link"
)

.forEach(link=>{





let badge =
document.createElement(
"span"
);




badge.className =
"notification-dot";



badge.innerText =
unread.length;




link.appendChild(
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




try{



let unread =
await PharmoraNotify.unread();



return unread.length;



}


catch(e){


return 0;


}



}



};










function renderNotice(item){



let data={

...item,

...item.data

};




return `



<div class="notice-item">



<strong>

${data.title || "Notification"}

</strong>




<p>

${data.message || ""}

</p>




<small>

${

data.createdAt

||

data.date

||

""

}

</small>




</div>



`;



}