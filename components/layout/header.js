/*
 Pharmora Global Header Component
*/



async function loadHeader(){


const root =
document.getElementById(
"site-header"
);



if(!root){

return;

}




let site={};

let nav=[];




try{



site =
await fetch(

appPath(
"config/site.json"
)

)
.then(r=>r.json());





nav =
await fetch(

appPath(
"config/navigation.json"
)

)
.then(r=>r.json());



}



catch(error){



console.error(

"Header config failed",

error

);



site={

name:"Pharmora",

logo:"",

tagline:"Open Pharmacy Learning Network"

};



nav=[];



}










let desktopLinks="";

let mobileLinks="";





nav.forEach(item=>{



const url =

appPath(

item.url.replace(
"/",
""
)

);






desktopLinks += `


<a href="${url}">

${item.title}

</a>


`;







mobileLinks += `


<a href="${url}">

${item.icon || ""}

${item.title}

</a>


`;



});











root.innerHTML = `




<header class="container">





<nav class="navbar">







<a 
href="${appPath("")}"
class="logo">





${

site.logo

?

`

<img

class="site-logo"

src="${appPath(site.logo)}"

alt="${site.name} logo"

>

`

:

"⚕"

}




<span>

${site.name}

</span>






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



<span id="notice-text">


Loading updates...


</span>



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

appPath(
"config/notices.json"
)

)
.then(r=>r.json());







notice.innerHTML =

data.map(item=>

`${item.title} : ${item.message}`

)

.join(

" &nbsp;&nbsp; • &nbsp;&nbsp; "

);






}




catch(error){



notice.innerHTML =

"No current updates";



}




}









loadHeader();