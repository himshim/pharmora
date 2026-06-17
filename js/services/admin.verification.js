async function renderVerificationCenter(){



let box =
document.getElementById(
"admin-actions"
);



document.getElementById(
"section-title"
).innerHTML =
"✔ Verification Requests";





let requests =
await getVerificationRequests();





if(!requests.length){



box.innerHTML = `

<div class="card">

No pending verification requests.

</div>

`;



return;



}








box.innerHTML =

requests.map(req=>`


<div class="panel">


<div>


<h3>

${req.name}

</h3>


<p>

${req.email}

</p>


<p>

<b>Type:</b>

${req.types.join(", ")}

</p>



<p>

<b>Title:</b>

${req.details?.title || ""}

<br>

<b>Organization:</b>

${req.details?.organization || ""}

</p>



<button

class="btn"

onclick="location.href='../profile.html?id=${req.userId}'">


👤 View Profile


</button>


</div>





<div>



<button

class="btn btn-primary"

onclick="adminApproveVerification('${req.id}')">


✔ Approve


</button>



<br><br>



<button

class="btn"

onclick="adminRejectVerification('${req.id}')">


❌ Reject


</button>



</div>



</div>


`)

.join("");



}









async function adminApproveVerification(id){



await approveVerification(id);





if(

typeof saveAudit==="function"

){



saveAudit(

"verification.approve",

{

request:id

}

);



}




alert(

"Verification approved"

);



renderVerificationCenter();



}










async function adminRejectVerification(id){



await rejectVerification(id);





if(

typeof saveAudit==="function"

){



saveAudit(

"verification.reject",

{

request:id

}

);



}




alert(

"Verification rejected"

);



renderVerificationCenter();



}