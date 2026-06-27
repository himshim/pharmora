
/*
 Generated Pharmora Bundle
 Do not edit directly
*/



/* ===== js/services/verification.service.js ===== */


;
/*
 Pharmora Verification Service

 Handles:
 - Educator verification
 - Professional verification
 - Manual admin verification
 - Verification history
*/





async function requestVerification(data){



let user =
currentUser();



if(!user){

return null;

}




let existing =
await getRecords(
"verification-requests"
);




let active =
existing.find(

x=>

x.userId===user.id

&&

x.status==="pending"

);




if(active){



showToast(

"Verification request already pending",

"info"

);



return active;



}






return createRecord(

"verification-requests",

{


userId:user.id,


name:user.name,


email:user.email,


types:

data.types || [],



details:{


title:data.title || "",


organization:data.organization || "",


description:data.description || ""


},




proof:

data.proof || null,




status:"pending",


attempt:

existing.filter(
x=>x.userId===user.id
).length + 1,


history:[

{

action:"submitted",

date:new Date()
.toISOString()

}

],


snapshot:{


name:user.name,

email:user.email,

types:data.types || [],


details:{


title:data.title || "",

organization:data.organization || ""

}


},


createdAt:

new Date()
.toISOString()


}

);



}









async function getVerificationRequests(){



let requests =
await getRecords(
"verification-requests"
);



return requests.filter(

x=>x.status==="pending"

);



}









async function approveVerification(
requestId
){



let requests =
await getRecords(
"verification-requests"
);




let request =
requests.find(

x=>x.id===requestId

);




if(!request){

return;

}




await verifyUser(

request.userId,

request.types,

"request"

);





await updateRecord(

"verification-requests",

requestId,

{

status:"approved",


history:[

...(request.history || []),

{

action:"approved",

admin:

currentUser()?.id,

date:

new Date()
.toISOString()

}

],


reviewedAt:

new Date()
.toISOString()

}

);



showToast(

"User verified",

"success"

);



}









async function rejectVerification(
requestId,
reason=""
){



let requests =
await getRecords(
"verification-requests"
);



let request =
requests.find(
x=>x.id===requestId
);



if(!request){

return;

}



await updateRecord(

"verification-requests",

requestId,

{


status:"rejected",


rejectionReason:

reason || "Not specified",



history:[

...(request.history || []),

{

action:"rejected",

reason:

reason || "Not specified",


admin:

currentUser()?.id,


date:

new Date()
.toISOString()

}

],



reviewedAt:

new Date()
.toISOString()


}

);




await createRecord(

"verification-logs",

{

targetUser:

request.userId,


action:"reject",


reason:

reason || "Not specified",


createdAt:

new Date()
.toISOString()

}

);





if(

request?.userId

&&

typeof notifyUser==="function"

){



notifyUser(

request.userId,

{

title:"Verification rejected",

message:

"Reason: "

+

(reason || "Not specified")

+

". Update details and submit again.",


type:"info"

}

);



}




showToast(

"Verification rejected",

"info"

);



}










/*
 Manual admin verification
*/

async function verifyUser(
userId,
types,
method="manual",
note=""
){



let profile =
await getProfile(
userId
);



if(!profile){

return null;

}




let admin =
currentUser();




await updateRecord(

"profiles",

profile.id,

{


verification:{


verified:true,


verifiedTypes:

types,



method:method,



verifiedBy:{


id:admin?.id,


name:admin?.name


},



note:note,



verifiedAt:

new Date()
.toISOString()


}


}

);







await createRecord(

"verification-logs",

{


targetUser:userId,


action:"verify",


types:types,


method:method,


admin:{


id:admin?.id,


name:admin?.name


},



note:note,



createdAt:

new Date()
.toISOString()


}

);

if(

typeof notifyUser==="function"

){



notifyUser(

userId,

{

title:"✔ Verification Approved",

message:

"Your Pharmora profile is now verified as: "

+

types.join(", "),

type:"success"

}

);



}



}









async function removeVerification(
userId,
reason=""
){



let profile =
await getProfile(
userId
);



if(!profile){

return;

}




await updateRecord(

"profiles",

profile.id,

{


verification:{


verified:false,


verifiedTypes:[],


removedAt:

new Date()
.toISOString()


}


}

);






await createRecord(

"verification-logs",

{


targetUser:userId,


action:"remove",


reason:reason,


createdAt:

new Date()
.toISOString()


}

);



}

async function verificationHistory(
userId
){


let logs =
await getRecords(
"verification-logs"
);


return logs.filter(
x=>x.targetUser===userId
);


}
;


/* ===== js/services/admin.service.js ===== */


;
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




function escapeHtml(text){


return window.PharmoraUI

?

PharmoraUI.escape(text)

:

String(text || "");


}




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


function adminButton(
text,
action
){


return PharmoraUI.button({

text,

action

});


}

/*
 Admin UI helpers
*/


function adminCard(
title,
body,
icon=""
){


return PharmoraUI.card({

title:

icon+" "+title,

body

});


}




function adminBadge(status){


return PharmoraUI.badge(

status || "unknown"

);


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


if(!item){


showToast(

"Item no longer exists",

"error"

);


closeAdminModal();


return;


}






let review =
item.review ||

{

comments:[]

};







review.comments.push({


message:

box.value.trim(),



reviewer:

typeof currentUser==="function"

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
collection,id
);


if(!item){

showToast(

"Item no longer exists",

"error"

);

return;

}


let user =
typeof currentUser==="function"
?
currentUser()
:
null;



await updateRecord(

collection,
id,

{


moderation:{


...item.moderation,


status:"approved",

reviewedBy:
user?.id || null,

reviewedAt:
new Date().toISOString()


},


lifecycle:{


...item.lifecycle,


status:"published",

publishedAt:
new Date().toISOString()


},


analytics:{


...item.analytics,


history:[

...(item.analytics?.history || []),

{

action:"approved",

by:user?.id || null,

at:new Date().toISOString()

}

]


}


}

);

/*
 Send approval notification
*/

if(
item?.ownership?.ownerId
&&
window.PharmoraNotify
){


await PharmoraNotify.send(

item.ownership.ownerId,

{

title:
"Content approved ✅",

message:
`Your submission "${escapeHtml(item.title || "content")}" is now published.`,

type:
"success",

target:
collection,

targetId:
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
id,
reason=""
){


let item =
await findContent(
collection,id
);


if(!item){

showToast(

"Item no longer exists",

"error"

);

return;

}


let user =
typeof currentUser==="function"
?
currentUser()
:
null;



await updateRecord(

collection,
id,

{


moderation:{


...item.moderation,


status:"rejected",

reason:reason,

reviewedBy:
user?.id || null,

reviewedAt:
new Date().toISOString()


},



lifecycle:{


...item.lifecycle,


status:"rejected"


},



analytics:{


...item.analytics,


history:[

...(item.analytics?.history || []),

{

action:"rejected",

reason:reason,

by:user?.id || null,

at:new Date().toISOString()

}

]


}


}

);



/*
 Send rejection notification
*/

if(
item?.ownership?.ownerId
&&
window.PharmoraNotify
){


await PharmoraNotify.send(

item.ownership.ownerId,

{

title:
"Submission needs changes ⚠️",

message:
escapeHtml(reason) || "Your submission was not approved.",

type:
"warning",

target:
collection,

targetId:
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


return PharmoraUI.confirm({


title:"Delete Content 🗑",


message:

"This will move the content to trash. Continue?",


confirmText:"Delete",


onConfirm:

`deleteContentConfirm('${collection}','${id}')`


});


}


async function deleteContentConfirm(
collection,
id
){






return PharmoraUI.confirm({


title:"Delete Content 🗑",


message:

"This will move the content to trash. Continue?",


confirmText:"Delete",


onConfirm:

`deleteContentConfirm('${collection}','${id}')`


});






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
.toISOString(),



lifecycle:{


status:"deleted"


}


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



async function restoreItem(
collection,
id
){



await updateRecord(

collection,

id,

{


deleted:false,


deletedAt:null,



lifecycle:{


status:"draft"


}


}

);





showToast(

"Restored",

"success"

);




renderTrash();



}






async function dismissReport(id){



await updateRecord(

"reports",

id,

{

moderation:{


status:"dismissed"


},


reviewedAt:

new Date()
.toISOString()


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


deletedAt:
new Date().toISOString(),



lifecycle:{


status:"deleted"


}


}

);



await updateRecord(

"reports",

reportId,

{

moderation:{


status:"removed"


},


reviewedAt:

new Date()
.toISOString()


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
;


/* ===== js/services/admin.dashboard.js ===== */


;
  /*
 Admin UI Helpers
*/


function adminStatCard(
title,
value,
icon,
action=""
){


let html =
PharmoraUI.card({

title:value,

body:

icon+" "+title,

badge:"Admin"

});


if(action){

html =
html.replace(

'class="card',

`onclick="${action}" class="card`

);

}


return html;


}



function adminButton(
text,
action
){


return PharmoraUI.button({

text,

action

});


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
await getAudit();


}


}

catch(e){}










box.innerHTML =

adminStatCard(

"Pending Review",

pending,

"⏳",

"renderAdminActions()"

)

+

adminStatCard(

"Published",

approved,

"📚",

"renderAdminActions()"

)

+

adminStatCard(

"Users",

users.length,

"👥",

"renderUserManager()"

)

+

adminStatCard(

"Verification Requests",

verifications.length,

"✔",

"renderVerificationCenter()"

)

+

adminStatCard(

"Disabled Users",

banned,

"🚫",

"renderUserManager()"

)

+

adminStatCard(

"Audit Events",

audits.length,

"🧾",

"renderAuditLogs()"

);



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



${

PharmoraUI.card({

title:"⚡ Quick Actions",

body:"",

actions:

adminButton(
"📋 Review Queue",
"renderAdminActions()"
)

+

adminButton(
"🎓 Courses",
"loadManager('courses')"
)

+

adminButton(
"🔔 Notifications",
"loadManager('notifications')"
)

+

adminButton(
"🌱 Contributor Applications",
"renderContributorApplications()"
)

+

adminButton(
"🗑 Trash",
"renderTrash()"
)

+

adminButton(
"👥 Users",
"renderUserManager()"
)

})

}








${

PharmoraUI.card({

title:users.length,

body:"👥 Registered Users",

badge:"Community"

})

}




${

PharmoraUI.card({

title:"📈 Platform Insights",

body:

bars.length

?

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

:

"No analytics"

})

}







${

PharmoraUI.card({

title:"🔥 Popular Searches",

body:

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

})

}




</div>







<br>








${

PharmoraUI.card({

title:"🕒 Recent Activity",

body:

latest.length

?

latest.map(item=>

PharmoraUI.panel({

left:

`

<b>

${contentIcon(item._collection)}

${item.title || item.question || item.name || "Untitled"}

</b>

<br>

<small>

${item._collection}

</small>

`,

right:item.status

})

).join("")

:

"No activity"

})

}




${

PharmoraUI.card({

title:"🕒 Activity Feed",

body:

activity.length

?

activity.map(a=>

PharmoraUI.panel({

left:

`

<b>

${a.message}

</b>

<br>

<small>

${new Date(a.time).toLocaleString()}

</small>

`,

right:a.action

})

).join("")

:

"No activity yet"

})

}

`;



}
;


/* ===== js/services/admin.users.js ===== */


;
async function renderUserManager(){


let box =
document.getElementById(
"admin-actions"
);


document.getElementById(
"section-title"
)
.innerHTML =
"👥 User Management";



box.innerHTML =

PharmoraUI.card({

title:"Find User",

html:true,

body:

`

<input

id="searchUserId"

placeholder="Search ID, name or email"

>


<br><br>


<div id="found-user"></div>

`,


actions:

PharmoraUI.button({

text:"Search",

action:"adminFindUser()"

})


});


}








async function adminFindUser(){



let query =

searchUserId.value

.trim()

.toLowerCase();




let users=[];


try{


if(
typeof getRecords==="function"
){


users =
await getRecords(
"users"
);


}


else{


users =
await getDemoUsers();


}


}
catch(e){


users=[];


}


if(
!Array.isArray(users)
){


users =
users.data

||

users.records

||

[];


}





let user =
users.find(

x=>

x.id===query

||

x.email?.toLowerCase()===query

||

x.name?.toLowerCase()

.includes(query)

);




let box =
document.getElementById(
"found-user"
);




if(!user){


box.innerHTML =
"<p>User not found</p>";


return;


}





box.innerHTML =

PharmoraUI.card({


title:

"👤 " + user.name,


html:true,


body:

`

${

PharmoraUI.panel({

left:"<b>ID</b><br>"+user.id

})

}


${

PharmoraUI.panel({

left:"<b>Email</b><br>"+user.email

})

}


${

PharmoraUI.panel({

left:"<b>Role</b>",

right:user.role

})

}


${

PharmoraUI.panel({

left:"<b>Status</b>",

right:

user.disabled

?

"🚫 Disabled"

:

"✅ Active"

})

}


${

PharmoraUI.panel({

left:"<b>Joined</b>",

right:

user.createdAt

?

new Date(user.createdAt)
.toLocaleDateString()

:

"Unknown"

})

}

`,


actions:


PharmoraUI.button({

text:"📋 Copy ID",

action:

`navigator.clipboard.writeText('${user.id}')`

})


+


PharmoraUI.button({

text:"👤 View Profile",

action:

`location.href='../profile.html?id=${user.id}'`

})


+


PharmoraUI.button({

text:"✔ Verify Educator",

action:

`adminVerifyUser('${user.id}','educator')`

})


+


PharmoraUI.button({

text:"✔ Verify Professional",

action:

`adminVerifyUser('${user.id}','professional')`

})


+


PharmoraUI.button({

text:"🚫 Ban User",

action:

`adminDisableUser('${user.id}')`

})


+


PharmoraUI.button({

text:"🔓 Restore User",

action:

`adminRestoreUser('${user.id}')`

})


+

(

currentUser().role==="owner"

?

PharmoraUI.button({

text:"👑 Make Admin",

action:

`ownerChangeRole('${user.id}','admin')`

})


+

PharmoraUI.button({

text:"⬇ Remove Admin",

action:

`ownerChangeRole('${user.id}','member')`

})

:

""

)


});



}





async function adminVerifyUser(
id,
type
){



await verifyUser(

id,

[
type
],

"manual"

);

if(

typeof saveAudit==="function"

){



saveAudit(

"user.verify",

{

target:id,

type:type

}

);



}

if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Verification approved ✔",


message:

"Your "

+

type

+

" status has been verified.",


type:"success"

}

);



}

PharmoraUI.confirm({

title:"Verification Complete ✔",

message:
"User verified as " + type,

confirmText:"OK"

});



adminFindUser();



}

async function ownerChangeRole(
id,
role
){



if(

changeUserRole(
id,
role
)

){

if(

typeof saveAudit==="function"

){



saveAudit(

"user.role.change",

{

target:id,

role:role

}

);



}

if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Account role updated 👑",


message:

"Your account role changed to "

+

role,


type:"info"

}

);



}

PharmoraUI.confirm({

title:"Role Updated 👑",

message:
"Role changed to " + role,

confirmText:"OK"

});



adminFindUser();



}


else{


PharmoraUI.confirm({

title:"Permission denied",

message:"Only owner can do this",

confirmText:"OK"

});


}



}

async function adminDisableUserConfirm(
id,
reason
){



return PharmoraUI.prompt({

title:"Disable User 🚫",

message:"Enter reason for disabling this account",

placeholder:"Reason",

confirmText:"Disable",

onConfirm:

`adminDisableUserConfirm('${id}')`

});



if(

disableUser(
id,
reason || ""
)

){

if(

typeof saveAudit==="function"

){



saveAudit(

"user.ban",

{

target:id,

reason:reason

}

);



}

if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Account disabled 🚫",


message:

reason ||

"Your account was disabled by administration.",


type:"warning"

}

);



}

PharmoraUI.confirm({

title:"User Disabled 🚫",

message:"User banned",

confirmText:"OK"

});


adminFindUser();


}


else{


PharmoraUI.confirm({

title:"Failed",

message:"Cannot disable this user",

confirmText:"OK"

});


}



}

async function adminRestoreUser(id){



if(

restoreUser(id)

){





if(

typeof saveAudit==="function"

){


saveAudit(

"user.restore",

{

target:id

}

);


}






if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Account restored 🔓",

message:

"Your account access has been restored.",


type:"success"

}

);



}







PharmoraUI.confirm({

title:"Restored 🔓",

message:"User restored",

confirmText:"OK"

});



adminFindUser();



}



else{



PharmoraUI.confirm({

title:"Failed",

message:"Cannot restore this user",

confirmText:"OK"

});



}



}
;


/* ===== js/services/admin.audit.js ===== */


;
/*
 Admin Audit Logs
 Pharmora UI v3
*/


async function renderAuditLogs(){



let box =
document.getElementById(
"admin-actions"
);



document.getElementById(
"section-title"
)
.innerHTML =
"🧾 Audit Logs";




let logs =
typeof getAudit==="function"

?

await getAudit()

:

[];





if(!logs.length){



box.innerHTML =

PharmoraUI.empty(

"No audit records yet."

);



return;



}







box.innerHTML =

logs.map(log=>


PharmoraUI.card({


title:

"🧾 " +

(
log.type ||
log.action ||
"Audit Event"
),



html:true,



body:


PharmoraUI.panel({

left:

`

<b>User</b>

<br>

${

log.user?.name ||

log.admin?.name ||

"System"

}

`,

right:

log.time

?

new Date(
log.time
)
.toLocaleString()

:

""

})


+


PharmoraUI.panel({

left:

"<b>Details</b>",


right:

`

<pre>

${

JSON.stringify(

log.data ||

log,

null,

2

)

}

</pre>

`

})



})


)
.join("");



}
;


/* ===== js/services/admin.review.js ===== */


;
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
items.filter(x=>{

return (

x.moderation?.status==="pending"

||

x.status==="pending"

);

});







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

${item.data?.course || item.course || "-"}


<br>


📘

${item.data?.semester || item.semester || "-"}


<br>


🧪

${item.data?.subject || item.subject || "-"}


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

item.data?.description ||

item.data?.answer ||

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

onclick="saveReviewComment('${collection}','${id}')">

Save Comment

</button>



</div>


`;




openAdminModal(

html

);



}

/*
 Review Service Export
*/


window.PharmoraReview = {


getAllReviewItems:function(){

return getAllReviewItems();

},



renderAdminActions:function(){

return renderAdminActions();

},



approveContent:function(
collection,
id
){

return approveContent(
collection,
id
);

},



rejectContent:function(
collection,
id,
reason
){

return rejectContent(
collection,
id,
reason
);

},



viewContent:function(
collection,
id
){

return viewContent(
collection,id
);

}


};



console.log(
"✓ PharmoraReview ready"
);
;


/* ===== js/services/admin.reports.js ===== */


;
/*
 Pharmora Report Moderation
*/


async function renderReports(){

let title =
document.getElementById(
"section-title"
);


if(title){


title.innerHTML =
"🚩 Report Queue";


}

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
;


/* ===== js/services/admin.trash.js ===== */


;
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
;


/* ===== js/services/admin.verification.js ===== */


;
async function renderVerificationCenter(){



let box =
document.getElementById(
"admin-actions"
);



document.getElementById(
"section-title"
)
.innerHTML =
"✔ Verification Requests";





let requests =
await getVerificationRequests();





if(!requests.length){



box.innerHTML =

PharmoraUI.empty(

"No pending verification requests."

);



return;



}







box.innerHTML =

requests.map(req=>


PharmoraUI.card({


title:

"👤 " + req.name,


html:true,


body:

`

${

PharmoraUI.panel({

left:"<b>Email</b>",

right:req.email

})

}


${

PharmoraUI.panel({

left:"<b>Type</b>",

right:req.types.join(", ")

})

}


${

PharmoraUI.panel({

left:"<b>Title</b>",

right:req.details?.title || ""

})

}


${

PharmoraUI.panel({

left:"<b>Organization</b>",

right:req.details?.organization || ""

})

}


${

PharmoraUI.panel({

left:"<b>Attempt</b>",

right:

"#" + (req.attempt || 1)

})

}


${

PharmoraUI.panel({

left:"<b>Proof</b>",

right:req.proof || "<i>No proof provided</i>"

})

}


${

PharmoraUI.panel({

left:"<b>History</b>",

right:

(req.history || [])

.map(h=>

(h.action || "")

+

(h.reason ? " : "+h.reason : "")

)

.join("<br>")

||

"No history"

})

}

`,


actions:


PharmoraUI.button({

text:"👤 View Profile",

action:

`location.href='../profile.html?id=${req.userId}'`

})


+


PharmoraUI.button({

text:"✔ Approve",

type:"primary",

action:

`adminApproveVerification('${req.id}')`

})


+


PharmoraUI.button({

text:"❌ Reject",

action:

`adminRejectVerification('${req.id}')`

})



})


)
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



PharmoraUI.confirm({

title:"Approved ✔",

message:"Verification approved",

confirmText:"OK"

});



renderVerificationCenter();



}










async function adminRejectVerification(id){



return PharmoraUI.prompt({


title:"Reject Verification ❌",


message:

"Enter rejection reason",


placeholder:

"Reason",


confirmText:"Reject",


onConfirm:

`adminRejectVerificationConfirm('${id}')`


});



}




async function adminRejectVerificationConfirm(
id,
reason
){



if(!reason){

return;

}



await rejectVerification(
id,
reason
);




if(

typeof saveAudit==="function"

){


saveAudit(

"verification.reject",

{

request:id,

reason:reason

}

);


}




PharmoraUI.confirm({

title:"Rejected",

message:"Verification rejected",

confirmText:"OK"

});



renderVerificationCenter();



}
;
