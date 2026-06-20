/*
 Resource Service v2

 Database-first
 JSON fallback
*/



async function getResources(){



try{


let resources =
await getRecords("resources");



if(
resources &&
resources.length
){


return resources;


}



}

catch(e){



console.warn(
"Resources database unavailable, using JSON fallback"
);



}






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

resources.filter(r=>{


return (

r.status==="approved"

||

r.lifecycle?.status==="published"

||

!r.status

);


});








root.innerHTML =

approved.map(r=>`



<div class="card">


<h2>

📄 ${r.title || ""}

</h2>




<p>

${r.description || ""}

</p>




<br>



<div class="badge">

${r.subject || ""}

</div>






<br><br>




<p>

${r.course || ""}
•
${r.semester || ""}
•
${r.unit || ""}

</p>






<p>

👤 ${
r.author?.name ||
r.author ||
"Unknown"
}

</p>







${
r.file?.url

?

`

<br>

<a

class="btn btn-primary"

onclick="
trackEvent(
'resource_download',
'${r.id}'
)
"

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