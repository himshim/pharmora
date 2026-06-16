/*
 Pharmora Contributor Management
*/


async function renderContributorApplications(){



let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}

let title =
document.getElementById(
"section-title"
);



if(title){


title.innerHTML =
"🌱 Contributor Applications";


}


let applications =
await getRecords(
"contributor-applications"
);



applications =
applications.filter(
x=>x.status==="pending"
);






if(applications.length===0){


box.innerHTML=`

<div class="card">

<h2>
🌱 Contributors
</h2>

<p>
No pending applications
</p>

</div>

`;


return;


}






box.innerHTML =

applications.map(app=>`

<div class="panel">


<div>


<h3>

🌱 ${app.name}

</h3>


<p>

${app.reason || ""}

</p>


<small>

🎓 ${app.education || ""}

<br>

📧 ${app.email}

</small>


</div>





<div>


<button

onclick="approveContributor('${app.id}','${app.userId}')">

✅

</button>



<button

onclick="rejectContributor('${app.id}','${app.userId}')">

❌

</button>


</div>



</div>


`).join("");



}











async function approveContributor(
applicationId,
userId
){



let users =
await getRecords(
"users"
);



let user =
users.find(
x=>x.id===userId
);



if(user){


await updateRecord(

"users",

userId,

{


permissions:[

...new Set([

...(user.permissions || []),

"content.submit"

])

]


}

);

if(
typeof getProfile==="function"
){



let profile =
await getProfile(userId);



if(profile){


await updateRecord(

"profiles",

profile.id,

{

contributor:{


enabled:true,


approvedAt:

new Date()
.toISOString()


}


}

);


}



}

if(

typeof refreshCurrentUser==="function"

){


refreshCurrentUser();


}

}







await updateRecord(

"contributor-applications",

applicationId,

{

status:"approved",

approvedAt:

new Date()
.toISOString()

}

);


if(

typeof logActivity==="function"

){


logActivity(

"contributor",

"Approved contributor",

{
userId:userId
}

);


}

if(

typeof notifyUser==="function"

){



notifyUser(

userId,

{

title:"🌱 Contributor Approved",

message:

"You can now submit educational content on Pharmora.",

type:"success"

}

);



}


showToast(

"Contributor approved",

"success"

);



renderContributorApplications();



}









async function rejectContributor(
id,
userId
){



await updateRecord(

"contributor-applications",

id,

{

status:"rejected"

}

);

if(

typeof logActivity==="function"

){


logActivity(

"contributor",

"Rejected contributor application",

{
id:id
}

);


}

if(

typeof notifyUser==="function"

){



notifyUser(

userId,

{

title:"Contributor Application Update",

message:

"Your contributor application was not approved. You may improve your profile and try again later.",

type:"info"

}

);



}


showToast(

"Application rejected",

"info"

);



renderContributorApplications();



}