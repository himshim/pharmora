/*
 Global Header Component
*/


async function loadHeader(){


const root =
document.getElementById("site-header");


if(!root){
return;
}




const base =
location.pathname.split("/").length > 2
?
"../"
:
"";





const site =
await fetch(
base+"config/site.json"
)
.then(r=>r.json());




const nav =
await fetch(
base+"config/navigation.json"
)
.then(r=>r.json());






let desktopLinks="";

let mobileLinks="";





nav.forEach(item=>{


let url =
base + item.url.replace("/","");



desktopLinks += `


<a href="${url}">

${item.title}

</a>


`;




mobileLinks += `


<a href="${url}">


${item.icon}
${item.title}


</a>


`;



});








root.innerHTML = `


<header class="container">


<nav class="navbar">






<a href="${base}" class="logo">



<img

src="${base}${site.logo}"

height="32"

style="vertical-align:middle;">


${site.name}



</a>







<div
class="menu-toggle"
onclick="toggleMenu()">


☰


</div>








<div class="nav-links">



${desktopLinks}




<button

class="notification-btn"

onclick="toggleNotifications()">


🔔


</button>



</div>






</nav>







<div class="mobile-menu">


${mobileLinks}



<div

class="mobile-notice"

onclick="toggleNotifications()">


🔔 Updates


</div>




</div>








<div id="notification-panel">


Loading...


</div>






</header>


`;



loadNotifications();



}






async function loadNotifications(){



const panel =
document.getElementById(
"notification-panel"
);



if(!panel){

return;

}



try{


const notices =
await fetch(
"/config/notices.json"
)
.then(r=>r.json());




if(notices.length===0){


panel.innerHTML = `

<p>No updates</p>

`;


return;

}






panel.innerHTML =
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


catch(e){



panel.innerHTML = `

<p>No notices available</p>

`;


}



}









function toggleNotifications(){



const panel =
document.getElementById(
"notification-panel"
);



if(panel){


panel.classList.toggle("show");


}



}







loadHeader();