/*
 Pharmora Global Footer Component v3
 Ecosystem Footer
 Uses Pharmora UI Engine
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
appPath("config/site.json")
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

tagline:"Open Pharmacy Knowledge Ecosystem"

};


}




root.innerHTML = `


<footer class="footer">


<div class="container">


<div class="grid">





<div class="card glass">


<a
href="${appPath("")}"
class="footer-brand"
>


${

site.logo

?

`

<img
class="footer-logo"
src="${appPath(site.logo)}"
alt="${site.name}">

`

:

"⚕"

}


<span>

${site.name}

</span>


</a>



<div class="badge">

Open Source

</div>



<p>

${site.tagline || "Open Pharmacy Knowledge Ecosystem"}

</p>


<p>

Built for pharmacy students, educators,
researchers and professionals.

</p>


</div>









<div class="card">


<h3>

📚 Explore

</h3>


<div class="footer-links">


<a href="${appPath("learn/")}">

Learn

</a>


<a href="${appPath("tools/")}">

Tools

</a>


<a href="${appPath("library/")}">

Library

</a>


<a href="${appPath("community/")}">

Community

</a>


</div>


</div>










<div class="card">


<h3>

🌱 Community

</h3>



<div class="footer-links">


<a href="${appPath("teach/")}">

Teach

</a>


<a href="${appPath("community/")}">

Contributors

</a>


<a href="${appPath("auth/login.html")}">

Join Pharmora

</a>


</div>


</div>









<div class="card">


<h3>

⚙ Platform

</h3>


<p>

🧬 Database Engine

<br>

🕘 Version System

<br>

🛡 Community Moderation

<br>

☁ Cloud Ready

</p>


</div>





</div>






<div class="footer-text">


© ${new Date().getFullYear()}

${site.name}


<br>


Built openly for the pharmacy community


</div>



</div>


</footer>


`;



}



loadFooter();