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


<footer class="container section">


<div class="card">


<h2>

${site.name}

</h2>


<p>

${site.tagline}

</p>



<br>



<p>

© ${new Date().getFullYear()}
${site.name}

</p>



</div>


</footer>


`;



}



loadFooter();