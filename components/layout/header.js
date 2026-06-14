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




let links="";

let mobile="";



nav.forEach(item=>{


links += `

<a href="${base}${item.url.replace("/","")}">

${item.title}

</a>

`;



mobile += `

<a href="${base}${item.url.replace("/","")}">

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


${links}


</div>




</nav>





<div class="mobile-menu">


${mobile}


</div>




</header>


`;



}



loadHeader();