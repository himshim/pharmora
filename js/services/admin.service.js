/*
 Pharmora Admin Review Service
 Universal Content Moderation
*/





const reviewCollections = [

"resources",

"books",

"events",

"tools",

"teaching-materials",

"question-bank",

"assignments"

];









async function getAllReviewItems(){



let all=[];





for(let collection of reviewCollections){



try{



let data =
await getRecords(collection);




data

.filter(

x=>!x.deleted

)

.forEach(item=>{



all.push({

...item,

_collection:collection

});



});



}



catch(error){



console.warn(

"Skipped:",
collection

);



}



}





return all;



}









async function renderAdminStats(){



let box =
document.getElementById(
"admin-stats"
);



if(!box){

return;

}





let items =
await getAllReviewItems();




let pending =
items.filter(

x=>x.status==="pending"

).length;




let approved =
items.filter(

x=>x.status==="approved"

).length;







let users=[];


try{


users =
await getRecords(
"users"
);


}

catch(e){}








let banned =

users.filter(

x=>x.disabled

).length;








let verifications=[];


try{


if(

typeof getVerificationRequests==="function"

){


verifications =
await getVerificationRequests();


}


}

catch(e){}









let audits=[];


try{


if(

typeof getAudit==="function"

){


audits =
getAudit();


}


}

catch(e){}










box.innerHTML = `


<div
class="card"
onclick="renderAdminActions()">


<h2>

${pending}

</h2>


<p>

⏳ Pending Review

</p>


</div>








<div
class="card"
onclick="renderAdminActions()">


<h2>

${approved}

</h2>


<p>

📚 Published

</p>


</div>








<div
class="card"
onclick="renderUserManager()">


<h2>

${users.length}

</h2>


<p>

👥 Users

</p>


</div>








<div
class="card"
onclick="renderVerificationCenter()">


<h2>

${verifications.length}

</h2>


<p>

✔ Verification Requests

</p>


</div>








<div
class="card"
onclick="renderUserManager()">


<h2>

${banned}

</h2>


<p>

🚫 Disabled Users

</p>


</div>








<div
class="card"
onclick="renderAuditLogs()">


<h2>

${audits.length}

</h2>


<p>

🧾 Audit Events

</p>


</div>


`;



}









async function renderAdminActions(){



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
"Content Review Queue";


}


let items =
await getAllReviewItems();





let pending =
items.filter(

x=>x.status==="pending"

);







if(pending.length===0){



box.innerHTML=`


<div class="panel">

Everything reviewed

<span class="status">

✓

</span>

</div>


`;



return;



}









box.innerHTML =

pending.map(item=>`





<div class="panel">



<div>



<h3>

${contentIcon(item._collection)}

${

item.title ||

item.question ||

item.name ||

"Untitled"

}

</h3>





<small>


Type:

${item._collection}


<br>


👤

${item.author?.name || "Unknown"}


<br>


🎓

${item.course || "-"}


<br>


📘

${item.semester || "-"}


<br>


🧪

${item.subject || "-"}


<br>


🏷

${(item.tags || []).join(", ")}


</small>




</div>








<div>


<button onclick="viewContent('${item._collection}','${item.id}')">

👁

</button>



<button onclick="commentContent('${item._collection}','${item.id}')">

💬

</button>



<button onclick="approveContent('${item._collection}','${item.id}')">

✅

</button>



<button onclick="rejectContent('${item._collection}','${item.id}')">

❌

</button>



<button onclick="deleteContent('${item._collection}','${item.id}')">

🗑

</button>


</div>





</div>




`).join("");



}









function contentIcon(type){



return {

resources:"📚",

books:"📖",

events:"📅",

tools:"🧰",

"teaching-materials":"👨‍🏫",

"question-bank":"❓",

assignments:"📝"


}[type]

|| "📄";



}











async function findContent(
collection,
id
){



let items =
await getRecords(
collection
);



return items.find(

x=>x.id===id

);



}











async function viewContent(
collection,
id
){



let item =
await findContent(
collection,
id
);




if(!item){

return;

}




let html = `


<div class="card">


<div class="badge">

${contentIcon(collection)}

${collection}

</div>



<br><br>



<h1>

${

item.title ||

item.question ||

"Untitled"

}

</h1>





<p>

${

item.description ||

item.answer ||

""

}

</p>





<br>



<p>


⭐

${item.difficulty || ""}


<br>


🏷

${(item.tags || []).join(", ")}


</p>




</div>


`;





openAdminModal(

html

);


}










async function commentContent(
collection,
id
){



let html = `


<div class="card">


<h2>

💬 Review Comment

</h2>



<p>

Send feedback to contributor

</p>



<br>



<textarea

id="review-message"

placeholder="Write improvement suggestions, approval notes, or rejection reason..."

></textarea>





<br><br>



<button

class="btn btn-primary"

onclick="saveReviewComment('${collection}','${user.id}')">

Save Comment

</button>



</div>


`;




openAdminModal(

html

);



}

async function saveReviewComment(
collection,
id
){



let box =
document.getElementById(
"review-message"
);



if(

!box ||

!box.value.trim()

){



showToast(

"Write a comment first",

"error"

);



return;



}





let item =
await findContent(
collection,
id
);






let review =
item.review ||

{

comments:[]

};







review.comments.push({


message:

box.value.trim(),



reviewer:

currentUser

?

currentUser()

:

null,



time:

new Date()
.toISOString()


});








await updateRecord(

collection,

id,

{

review:review

}

);

if(

item?.author?.id

&&

typeof notifyUser==="function"

){



notifyUser(

item.author.id,

{

title:"New review feedback 💬",

message:

"A reviewer commented on your submission.",

type:"info"

}

);



}


if(
typeof logActivity==="function"
){


logActivity(

"comment",

"Review comment added",

{
collection,
id
}

);


}




closeAdminModal();






showToast(

"Comment added",

"success"

);



}











async function approveContent(
collection,
id
){



let item =
await findContent(
collection,
id
);

await updateRecord(

collection,

id,

{

status:"approved"

}

);

if(
typeof logActivity==="function"
){


logActivity(

"approve",

"Approved content",

{
collection,
id
}

);


}



showToast(

"Approved",

"success"

);




renderAdminStats();

renderAdminActions();




}











async function rejectContent(
collection,
id
){


let item =
await findContent(
collection,
id
);



await updateRecord(

collection,

id,

{

status:"rejected"

}

);

if(

item?.author?.id

&&

typeof notifyUser==="function"

){



notifyUser(

item.author.id,

{

title:"Submission needs changes",

message:

"Your submission was not approved. Check review comments.",

type:"warning"

}

);



}


if(

item?.author?.id

&&

typeof notifyUser==="function"

){



notifyUser(

item.author.id,

{

title:"Content approved 🎉",

message:

"Your submission has been published.",

type:"success"

}

);



}


if(
typeof logActivity==="function"
){


logActivity(

"reject",

"Rejected content",

{
collection,
id
}

);


}


showToast(

"Rejected",

"info"

);




renderAdminStats();

renderAdminActions();




}











async function deleteContent(
collection,
id
){






let ok =

typeof showConfirm==="function"

?

await showConfirm(
"Delete permanently?"
)

:

confirm(
"Delete permanently?"
);






if(!ok){

return;

}








let item =
await findContent(
collection,
id
);




if(

typeof saveAudit==="function"

){


saveAudit(

"delete",

{

collection:collection,

item:item

}

);


}






await updateRecord(

collection,

id,

{

deleted:true,

deletedAt:

new Date()
.toISOString()

}

);







showToast(

"Deleted",

"success"

);





renderAdminStats();

renderAdminActions();




}

/*
=========================
 ADMIN DASHBOARD HOME
=========================
*/


async function renderAdminHome(){



let title =
document.getElementById(
"section-title"
);



if(title){


title.innerHTML =
"Dashboard Overview";


}






let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}




let items =
await getAllReviewItems();




let users=[];


try{


users =
await getRecords(
"users"
);


}

catch(e){}




let bars=[];

let popular=[];




if(

typeof analyticsBars==="function"

){


bars =
analyticsBars();


}




if(

typeof topAnalyticsTargets==="function"

){


popular =
topAnalyticsTargets(

"search"

);


}



let latest =
items

.sort(

(a,b)=>

new Date(b.createdAt || 0)

-

new Date(a.createdAt || 0)

)

.slice(0,5);



let activity=[];


if(
typeof getActivities==="function"
){

activity =
getActivities(5);

}



box.innerHTML = `



<div class="grid">



<div class="card">

<h2>⚡ Quick Actions</h2>

<br>


<button class="btn"

onclick="renderAdminActions()">

📋 Review Queue

</button>


<br><br>


<button class="btn"

onclick="loadManager('courses')">

🎓 Courses

</button>


<br><br>


<button class="btn"

onclick="loadManager('notifications')">

🔔 Notifications

</button>

<br><br>


<button 
class="btn"

onclick="renderContributorApplications()">

🌱 Contributor Applications

</button>

<br><br>


<button

class="btn"

onclick="renderTrash()">

🗑 Trash

</button>

<br><br>


<button class="btn"

onclick="renderUserManager()">

👥 Users

</button>

</div>








<div class="card">

<h2>👥 Community</h2>


<br>


<h1>

${users.length}

</h1>


<p>

Registered Users

</p>


</div>




<div class="card">



<h2>

📈 Platform Insights

</h2>



<br>



${

bars.map(x=>`



<p>

${x.label}

<b style="float:right">

${x.value}

</b>

</p>


<div class="analytics-bar">

<div style="width:${x.percent}%">

</div>

</div>



`).join("")

}



</div>





<div class="card">



<h2>

🔥 Popular Searches

</h2>



<br>




${

popular.length

?

popular.map(x=>`

<p>

🔎 ${x[0]}

<span style="float:right">

${x[1]}

</span>

</p>

`).join("")


:


"No searches yet"


}



</div>



</div>







<br>








<div class="card">


<h2>

🕒 Recent Activity

</h2>


<br>




${

latest.length

?

latest.map(item=>`

<div class="panel">


<div>


<b>

${contentIcon(item._collection)}

${

item.title ||

item.question ||

item.name ||

"Untitled"

}

</b>


<br>


<small>

${item._collection}

</small>



</div>


<span class="status">

${item.status}

</span>


</div>


`).join("")


:


"No activity"


}




</div>

<div class="card">


<h2>

🕒 Activity Feed

</h2>


<br>


${

activity.length

?

activity.map(a=>`

<div class="panel">

<div>

<b>

${a.message}

</b>

<br>

<small>

${new Date(a.time).toLocaleString()}

</small>

</div>


<span>

${a.action}

</span>


</div>


`).join("")


:


"No activity yet"


}


</div>

`;



}

/*
=========================
 USER CONTROL CENTER
=========================
*/


async function renderUserManager(){



let title =
document.getElementById(
"section-title"
);



if(title){

title.innerHTML =
"User Control Center";

}




let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}





let users=[];



try{


users =
await getRecords(
"users"
);


}

catch(e){}






if(users.length===0){


box.innerHTML = `


<div class="card">

<h2>No users found</h2>

</div>


`;


return;


}









box.innerHTML = `


<div class="card">


<h2>

🚫 Quick Ban

</h2>


<p>

Ban account using User ID

</p>



<input

id="quick-ban-id"

placeholder="Paste user ID">



<br><br>



<button

class="btn"

onclick="banUserById()">


Ban User


</button>



</div>


<br>


`

+

users.map(user=>`



<div class="panel">


<div>


<h2>

👤 ${user.name || "User"}

</h2>


<p>

📧 ${user.email || ""}

<br>

🎭 Role:
<b>${user.role || "student"}</b>


<br>


🛡 Permissions:
${

(user.permissions || [])

.join(", ")

|| "Default"

}


</p>


</div>






<div>


<button

onclick="editUserRole('${user.id}')">

🛡

</button>



<button

onclick="toggleUserStatus('${user.id}')">

${user.disabled ? "✅" : "🚫"}

</button>


</div>



</div>



`).join("");



}

async function editUserRole(id){



let users =
await getRecords(
"users"
);



let user =
users.find(
x=>x.id===id
);




if(!user){

return;

}




let html = `


<div class="card">


<h2>

🛡 Permissions

</h2>



<br>



<label>

Role

</label>



<select id="new-role">


${[

"member",

"moderator",

"maintainer",

"admin",

"owner"

].map(role=>`

<option

value="${role}"

${

user.role===role

?

"selected"

:

""

}

>

${role}

</option>

`).join("")}


</select>






<br><br>






${

permissionMatrix.map(p=>`


<label>


<input

class="permission-check"

type="checkbox"

value="${p.key}"

${

(user.permissions || [])
.includes(p.key)

?

"checked"

:

""

}

>

${p.label}


</label>


<br>


`).join("")


}







<br>



<button

class="btn btn-primary"

onclick="saveUserRole('${user.id}')">


Save Permissions


</button>



</div>


`;




openAdminModal(

html

);



}










async function saveUserRole(id){



let role =
document.getElementById(
"new-role"
)
.value;





let permissions = [];



document

.querySelectorAll(

".permission-check:checked"

)

.forEach(box=>{


permissions.push(

box.value

);


});





if(role==="owner"){


permissions=[

"*"

];


}





await updateRecord(

"users",

id,

{

role,

permissions

}

);

if(

typeof clearPermissionCache==="function"

){


clearPermissionCache();


}





if(

typeof logActivity==="function"

){


logActivity(

"user",

"Changed user role",

{
id,
role
}

);


}






closeAdminModal();



showToast(

"Role updated",

"success"

);




renderUserManager();



}

async function toggleUserStatus(id){



let users =
await getRecords(
"users"
);



let user =
users.find(
x=>x.id===id
);




if(!user){

return;

}




await updateRecord(

"users",

id,

{

disabled:

!user.disabled

}

);






showToast(

"User updated",

"success"

);




renderUserManager();



}

async function banUserById(){



let input =
document.getElementById(
"quick-ban-id"
);



if(
!input ||
!input.value.trim()
){



showToast(

"Enter user ID",

"error"

);



return;



}





let id =
input.value.trim();




let users =
await getRecords(
"users"
);



let user =
users.find(

x=>x.id===id

);




if(!user){



showToast(

"User not found",

"error"

);



return;



}





await updateRecord(

"users",

id,

{

disabled:true

}

);






if(

typeof logActivity==="function"

){



logActivity(

"user.ban",

"User banned",

{

id,

level:"warning"

}

);



}





showToast(

"User banned",

"success"

);



renderUserManager();



}

/*
=========================
 PERMISSION MATRIX
=========================
*/


const permissionMatrix = [


{
key:"content.review",
label:"📋 Review Content"
},


{
key:"content.submit",
label:"🌱 Submit Content"
},


{
key:"content.autoapprove",
label:"⭐ Auto Approve Content"
},


{
key:"contributors.manage",
label:"🌱 Manage Contributors"
},


{
key:"courses.manage",
label:"🎓 Manage Courses"
},


{
key:"curriculum.manage",
label:"📘 Manage Curriculum"
},


{
key:"subjects.manage",
label:"🧪 Manage Subjects"
},


{
key:"books.manage",
label:"📚 Manage Library"
},


{
key:"events.manage",
label:"📅 Manage Events"
},


{
key:"tools.manage",
label:"🧰 Manage Tools"
},


{
key:"notifications.manage",
label:"🔔 Notifications"
},


{
key:"users.manage",
label:"👥 Manage Users"
},


{
key:"analytics.view",
label:"📈 Analytics"
}


];

/*
=========================
 TRASH MANAGER
=========================
*/


async function renderTrash(){



let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}




let deleted=[];




for(let collection of reviewCollections){



let data =
await getRecords(
collection
);



data

.filter(x=>x.deleted)

.forEach(x=>{


deleted.push({

...x,

_collection:collection

});


});


}







box.innerHTML = deleted.length

?

deleted.map(item=>`



<div class="panel">


<div>


<h3>

🗑

${item.title || item.name || "Deleted"}

</h3>



<small>

${item._collection}

</small>


</div>



<button

onclick="restoreItem('${item._collection}','${item.id}')">

♻️ Restore

</button>



</div>



`).join("")


:


`

<div class="card">

Trash empty

</div>

`;



}

async function restoreItem(
collection,
id
){



await updateRecord(

collection,

id,

{

deleted:false,

deletedAt:null

}

);





showToast(

"Restored",

"success"

);




renderTrash();



}

/*
 Pharmora Report Moderation
*/


async function renderReports(){


const app =
document.getElementById("admin-actions");


if(!app){
return;
}



let reports =
await getRecords("reports");



reports =
reports.filter(
r=>r.status==="pending"
);



app.innerHTML = `

<h2>
🚩 Report Queue
</h2>


${
reports.length ?

reports.map(report=>`

<div class="panel">


<div>

<strong>
${report.collection}
</strong>

<p>
${report.reason}
</p>


<small>
Reported by:
${report.reportedBy?.name || "Unknown"}
</small>


</div>


<div>


<button
onclick="dismissReport('${report.id}')">

Dismiss

</button>


<button
onclick="removeReportedContent('${report.id}')">

Remove

</button>


</div>


</div>


`).join("")


:

`

<div class="card">

🎉 No pending reports

</div>

`

}


`;



}

let title =
document.getElementById(
"section-title"
);


if(title){


title.innerHTML =
"🚩 Report Queue";


}


async function dismissReport(id){



await updateRecord(
"reports",
id,
{
status:"dismissed",
reviewedAt:new Date().toISOString()
}
);

if(
typeof logActivity==="function"
){


logActivity(

"report.dismiss",

"Report dismissed",

{
id,
level:"info"
}

);


}

showToast(
"Report dismissed",
"success"
);



renderReports();



}




async function removeReportedContent(reportId){



let reports =
await getRecords("reports");



let report =
reports.find(
r=>r.id===reportId
);



if(!report){
return;
}




await updateRecord(
report.collection,
report.contentId,
{
deleted:true,
deletedAt:new Date().toISOString()
}
);



await updateRecord(
"reports",
reportId,
{
status:"removed",
reviewedAt:new Date().toISOString()
}
);

if(
typeof logActivity==="function"
){


logActivity(

"report.remove",

"Removed reported content",

{

reportId,

collection:
report.collection,

contentId:
report.contentId,

level:"warning"

}

);


}

showToast(
"Content removed",
"success"
);



renderReports();



}

/*
=========================
 VERIFICATION CENTER
=========================
*/


async function renderVerificationCenter(){


let title =
document.getElementById(
"section-title"
);


if(title){

title.innerHTML =
"✔ Verification Center";

}




let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}



let requests =
await getVerificationRequests();




box.innerHTML = `


<div class="card">


<h2>
Manual Verification
</h2>


<br>


<input
id="verify-search"
placeholder="Search user id / email / name">


<br><br>


<button
class="btn btn-primary"
onclick="searchVerifyUser()">

Search User

</button>


<div id="verify-result"></div>


</div>



<br>



<h2>

Pending Requests

</h2>


${

requests.length

?

requests.map(r=>`

<div class="panel">


<div>


<h3>

${r.name}

</h3>


<p>

${r.types.join(", ")}

<br>

${r.details.title}

<br>

${r.details.organization}

</p>


</div>




<div>


<button
onclick="approveVerification('${r.id}')">

✔

</button>


<button
onclick="rejectVerification('${r.id}')">

❌

</button>


</div>



</div>

`).join("")


:

`

<div class="card">

No verification requests

</div>

`

}


`;



}









async function searchVerifyUser(){



let q =
document

.getElementById(
"verify-search"
)

.value

.toLowerCase();




let users =
await getRecords(
"users"
);




let user =
users.find(

u=>

u.id===q

||

u.email?.toLowerCase()===q

||

u.name?.toLowerCase().includes(q)

);




let box =
document.getElementById(
"verify-result"
);



if(!user){



box.innerHTML =

`

<br>

User not found

`;



return;


}





box.innerHTML = `


<br>


<div class="panel">


<div>


<h3>

👤 ${user.name}

</h3>


<p>

${user.email}

</p>


</div>



<div>


<button
onclick="verifyUser('${user.id}', ['educator'], 'manual')">

✔ Educator

</button>


<button
onclick="verifyUser('${user.id}', ['professional'], 'manual')">

✔ Professional

</button>


<button
onclick="removeVerification('${user.id}')">

Remove

</button>


</div>


</div>


`;



}