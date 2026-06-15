/*
 Pharmora Global Footer Component
*/



async function loadFooter(){



const root =
document.getElementById(

"site-footer"

);




if(!root){

return;

}







let site={};






try{



site =
await fetch(

appPath(
"config/site.json"
)

)
.then(r=>r.json());



}





catch(error){



console.error(

"Footer config failed",

error

);




site={

name:"Pharmora",

logo:"",

tagline:"Open Pharmacy Learning Network"

};



}









root.innerHTML = `






<footer class="footer">








<div class="footer-brand">







${

site.logo

?

`

<img

class="footer-logo"

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








</div>











<div class="footer-links">







<a href="${appPath("about/")}">

About

</a>








<a href="${appPath("learn/")}">

Learn

</a>








<a href="${appPath("tools/")}">

Tools

</a>









<a href="${appPath("contribute/")}">

Contribute

</a>









</div>













<div class="footer-text">







© ${new Date().getFullYear()}

${site.name}







<br>







${site.tagline || ""}








</div>









</footer>






`;




}









loadFooter();