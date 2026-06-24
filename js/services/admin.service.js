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