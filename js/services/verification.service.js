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
requestId
){



await updateRecord(

"verification-requests",

requestId,

{

status:"rejected",

reviewedAt:

new Date()
.toISOString()

}

);




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