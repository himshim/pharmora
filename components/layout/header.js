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
${item.icon} ${item.title}
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


</div>






</nav>









<div class="mobile-menu">


${mobileLinks}


</div>







<div class="notice-bar">


<span>

🔔 Latest Updates

</span>



<div class="notice-track">

<div class="notice-track">

<span id="notice-text">

Loading updates...

</span>

</div>

</div>



</div>








</header>


`;




loadNoticeTicker();



}










async function loadNoticeTicker(){


const notice =
document.getElementById(
"notice-text"
);



if(!notice){

return;

}





try{


const data =
await fetch(
"/config/notices.json"
)
.then(r=>r.json());





notice.innerHTML =

data.map(item=>

`${item.title} : ${item.message}`

).join(" &nbsp;&nbsp; • &nbsp;&nbsp; ");




}



catch(error){



notice.innerHTML =

"No current updates";



}



}







loadHeader();