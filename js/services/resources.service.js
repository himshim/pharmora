/*
 Resource Service
*/


async function getResources(){


return await fetch(
"/data/resources.json"
)
.then(r=>r.json());


}






async function renderResources(id){



const root =
document.getElementById(id);



if(!root){

return;

}



const resources =
await getResources();





const approved =
resources.filter(
r=>r.status==="approved"
);






root.innerHTML =
approved.map(r=>`


<div class="card">


<h2>

📄 ${r.title}

</h2>



<p>

${r.description}

</p>




<br>



<div class="badge">

${r.subject}

</div>





<br><br>



<p>

${r.course}
•
${r.semester}
•
${r.unit}

</p>




<p>

👤 ${r.author.name}

</p>





${
r.file.url

?

`

<br>

<a
class="btn btn-primary"
href="${r.file.url}">

Open

</a>

`

:

""

}



</div>


`).join("");




}