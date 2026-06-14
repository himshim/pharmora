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



<a href="${base}auth/login.html">

Login

</a>




</div>






</nav>









<div class="mobile-menu">




${mobileLinks}




<a href="${base}auth/login.html">


👤 Login


</a>





</div>







</header>


`;




}



loadHeader();