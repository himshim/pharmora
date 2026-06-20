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

approved.map(r=>{


let data =
r.data || {};



return `



<div class="card">


<h2>

📄 ${r.title || ""}

</h2>



<p>

${r.description || ""}

</p>




<br>




<div class="badge">

${data.type || r.type || ""}

</div>





<br><br>




<p>

${data.course || r.course || ""}

•

${data.semester || r.semester || ""}

•

${data.unit || r.unit || ""}

</p>





<p>

👤 ${
data.author ||
r.author?.name ||
r.author ||
"Unknown"
}

</p>





${
data.file?.url ||
r.file?.url

?

`

<br>

<a
class="btn btn-primary"

href="${data.file?.url || r.file.url}">

Open

</a>

`

:

""

}



</div>


`;



}).join("");



}