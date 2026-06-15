/*
 Forum Service
*/


async function getQuestions(){


const response =
await fetch(
"/data/forum.json"
);


return await response.json();


}







async function renderForum(id){



const root =
document.getElementById(id);



if(!root){

return;

}



const questions =
await getQuestions();






root.innerHTML =
questions.map(q=>`


<div class="card">


<h2>

💬 ${q.title}

</h2>



<p>

${q.description}

</p>



<br>



<div class="badge">

${q.category}

</div>




<br><br>




<p>

👤 ${q.author.name}
•
${q.author.role}

</p>





<p>

👁 ${q.stats.views}
&nbsp;
⬆ ${q.stats.votes}

</p>






${
q.answers.some(a=>a.verified)

?

`

<br>

<div class="badge">

✓ Verified Answer

</div>

`

:

""

}




</div>


`).join("");



}