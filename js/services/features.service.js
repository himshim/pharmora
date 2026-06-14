/*
 Homepage Feature Renderer
*/


async function renderFeatures(id){


const root =
document.getElementById(id);


if(!root){

return;

}



const features =
await fetch(
"/config/features.json"
)
.then(r=>r.json());





root.innerHTML =
features.map(item=>`


<a 
href="${item.url}"
class="card">


<h2>

${item.icon}
${item.title}

</h2>


<p>

${item.description}

</p>



</a>


`).join("");



}