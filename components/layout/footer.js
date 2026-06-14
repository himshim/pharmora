/*
 Global Footer Component
*/


async function loadFooter(){



const root =
document.getElementById("site-footer");



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









root.innerHTML = `



<footer class="footer">





<div class="footer-brand">


⚕ ${site.name}


</div>








<div class="footer-links">





<a href="${base}about/">

About

</a>






<a href="${base}learn/">

Learn

</a>






<a href="${base}tools/">

Tools

</a>







<a href="${base}contribute/">

Contribute

</a>








</div>









<div class="footer-text">





© ${new Date().getFullYear()}

${site.name}





<br>




${site.tagline}






</div>






</footer>



`;




}




loadFooter();