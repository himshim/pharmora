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









<a

href="${appPath("")}"

class="footer-brand"

style="text-decoration:none;display:flex;justify-content:center;align-items:center;gap:10px;"

>








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








</a>











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