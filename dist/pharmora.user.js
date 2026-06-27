
/*
 Generated Pharmora Bundle
 Do not edit directly
*/



/* ===== js/services/auth.service.js ===== */


;
/*
 Pharmora Authentication Adapter v2
 Database Entity Powered
 Demo + Supabase Ready
*/


let authConfig=null;


/*
=========================
 CONFIG
=========================
*/


async function loadAuthConfig(){


if(authConfig){

return authConfig;

}


try{


authConfig =
await fetch(
"/config/auth.json"
)
.then(r=>r.json());


}


catch(error){


authConfig={

provider:"demo"

};


}


return authConfig;


}






/*
=========================
 AUTH ENTRY POINTS
=========================
*/


async function registerUser(data){


const config =
await loadAuthConfig();



if(config.provider==="demo"){


return await demoRegister(
data
);


}



if(

config.provider==="supabase"

&&

typeof supabaseRegister==="function"

){


return await supabaseRegister(
data
);


}



return null;


}









async function loginUser(
email,
password
){



const config =
await loadAuthConfig();



if(config.provider==="demo"){


return await demoLogin(
email,
password
);


}




if(

config.provider==="supabase"

&&

typeof supabaseLogin==="function"

){


return await supabaseLogin(
email,
password
);


}



return null;


}







/*
=========================
 SESSION
=========================
*/



function currentUser(){


try{


return JSON.parse(

localStorage.getItem(
"currentUser"
)

);


}


catch(error){


return null;


}


}







function setSession(user){


let session={


id:user.id,


name:
user.data?.name ||
user.name ||
user.title,


email:
user.data?.email ||
user.email,


role:
user.data?.role ||
user.role ||
"member"


};



localStorage.setItem(

"currentUser",

JSON.stringify(session)

);



if(
typeof clearPermissionCache==="function"
){

clearPermissionCache();

}



return session;


}








function logoutUser(){



localStorage.removeItem(
"currentUser"
);



if(
typeof clearPermissionCache==="function"
){

clearPermissionCache();

}



showToast?.(
"Logged out",
"info"
);



location.href =
"/auth/login.html";


}









/*
=========================
 PROFILE UPDATE
=========================
*/


async function updateProfile(updates){


let user =
currentUser();



if(!user){

return null;

}



await updateRecord(
user.id,
updates
);



let updated={

...user,

...updates

};



localStorage.setItem(

"currentUser",

JSON.stringify(updated)

);



showToast?.(
"Profile updated",
"success"
);



return updated;


}










/*
=========================
 REFRESH SESSION
=========================
*/


async function refreshCurrentUser(){


let session =
currentUser();



if(!session){

return null;

}



let users =
await getDemoUsers();



let latest =
users.find(

u=>u.id===session.id

);



if(!latest){

return session;

}



if(

latest.data?.disabled ||
latest.disabled

){


logoutUser();


return null;


}



return setSession(
latest
);


}









/*
=========================
 DATABASE USER STORAGE
=========================
*/


async function getDemoUsers(){



return await getRecords(
"users"
);



}








async function saveDemoUsers(){



console.warn(
"saveDemoUsers deprecated - Database v2 active"
);



return true;


}








function cleanEmail(email){


return email
.trim()
.toLowerCase();


}











/*
=========================
 REGISTER
=========================
*/



async function demoRegister(data){



let users =
await getDemoUsers();



let email =
cleanEmail(
data.email
);



let exists =
users.find(

u=>

(
u.data?.email ||
u.email
)

===email

);



if(exists){



showToast?.(
"Account already exists",
"error"
);



return null;


}





let user =
await createRecord(

"users",

{


name:
data.name.trim(),


email,


password:
data.password,


role:
data.role || "member",


permissions:
data.permissions || []


}

);






if(
typeof createUserProfile==="function"
){


await createUserProfile(
user
);


}







let session =
setSession(
user
);




showToast?.(
"Account created successfully",
"success"
);



return session;


}










/*
=========================
 LOGIN
=========================
*/


async function demoLogin(
email,
password
){



let users =
await getDemoUsers();



email =
cleanEmail(email);




let user =
users.find(

u=>

(

u.data?.email ||
u.email

)

===email


&&


(

u.data?.password ||
u.password

)

===password


);





if(!user){


showToast?.(
"Invalid login details",
"error"
);


return null;


}





if(

user.data?.disabled ||
user.disabled

){


showToast?.(
"Account disabled. Contact administrator.",
"error"
);



return null;


}






await updateRecord(

user.id,

{

lastLogin:

new Date()
.toISOString()

}

);




let session =
setSession(
user
);





showToast?.(
"Login successful",
"success"
);




return session;


}









/*
=========================
 ADMIN USER ACTIONS
=========================
*/


async function disableUser(
userId,
reason=""
){



let admin =
currentUser();



if(!admin){

return false;

}




let users =
await getDemoUsers();




let user =
users.find(
x=>x.id===userId
);




if(!user){

return false;

}




let role =
user.data?.role ||
user.role;




if(role==="owner"){

return false;

}




if(

admin.role!=="owner"

&&

role==="admin"

){

return false;

}







await updateRecord(

user.id,

{

data:{

...user.data,

disabled:true,

disabledReason:reason

},


disabledAt:

new Date()
.toISOString(),


disabledBy:

admin.id


}

);




return true;


}










async function restoreUser(
userId
){



let admin =
currentUser();



if(!admin){

return false;

}



let users =
await getDemoUsers();



let user =
users.find(
x=>x.id===userId
);




if(!user){

return false;

}



let role =
user.data?.role ||
user.role;



if(role==="owner"){

return false;

}



await updateRecord(

user.id,

{

data:{

...user.data,

disabled:false,

disabledReason:null

},


restoredAt:

new Date()
.toISOString(),


restoredBy:

admin.id


}

);



return true;


}











async function changeUserRole(
userId,
role
){



let owner =
currentUser();



if(

!owner ||

owner.role!=="owner"

){

return false;

}




let users =
await getDemoUsers();



let user =
users.find(
x=>x.id===userId
);



if(!user){

return false;

}



let oldRole =
user.data?.role ||
user.role;




if(oldRole==="owner"){

return false;

}




await updateRecord(

user.id,

{

data:{

...user.data,

role:role

},


roleUpdatedAt:

new Date()
.toISOString(),


roleUpdatedBy:

owner.id


}

);



return true;


}
;


/* ===== js/services/storage.service.js ===== */


;
/*
 Pharmora Storage Adapter
 Demo + Cloud Ready
*/





let storageConfig=null;








async function loadStorageConfig(){



if(storageConfig){

return storageConfig;

}




try{



storageConfig =
await fetch(

appPath(
"config/storage.json"
)

)
.then(r=>r.json());



}



catch(error){



storageConfig={

provider:"demo"

};



}




return storageConfig;



}









async function uploadFile(
file,
folder="uploads/"
){






if(!file){

return null;

}






const config =
await loadStorageConfig();








if(config.provider==="demo"){



return demoUpload(

file,

folder

);



}








if(

config.provider==="supabase"

&&

typeof supabaseUpload==="function"

){



return supabaseUpload(

file,

folder

);



}







return null;



}












async function deleteFile(file){






if(!file){

return false;

}








const config =
await loadStorageConfig();








if(config.provider==="demo"){



return true;



}








if(

config.provider==="supabase"

&&

typeof supabaseDelete==="function"

){



return supabaseDelete(
file
);



}








return false;



}













function getFileUrl(file){






if(!file){

return "";

}







return file.url || "";



}












/*

 DEMO STORAGE ENGINE

*/







async function demoUpload(
file,
folder
){








let safeName =

Date.now()

+

"-"

+

file.name.replace(

/\s+/g,

"_"

);









let record={






id:

crypto.randomUUID(),






name:

file.name,







type:

file.type,







size:

file.size,








path:

folder + safeName,








url:

URL.createObjectURL(

file

),









provider:

"demo",








uploadedAt:

new Date()
.toISOString()








};









return record;






}
;


/* ===== js/services/profile.service.js ===== */


;
/*
 Pharmora Profile Service v2.1
 Identity + Community Profile Layer

 Rules:
 - Auth owns login/session
 - Profile owns public identity
 - Backend provider independent
*/


/* ======================
 UTILITIES
====================== */


function deepMergeProfile(target={}, source={}){

let output={
...target
};


for(let key in source){

if(

source[key] &&
typeof source[key]==="object" &&
!Array.isArray(source[key])

){

output[key]=deepMergeProfile(
target[key] || {},
source[key]
);

}

else{

output[key]=source[key];

}

}


return output;

}



function createInitials(name=""){

return name
.split(" ")
.map(x=>x[0])
.join("")
.substring(0,2)
.toUpperCase()
||
"PH";

}



/* ======================
 CREATE PROFILE
====================== */


async function createUserProfile(user){


if(!user){

return null;

}


let existing =
await getProfile(user.id);


if(existing){

return existing;

}



let name =
user.data?.name ||
user.name ||
"Pharmora User";


let email =
user.data?.email ||
user.email ||
"";



let profile={


userId:user.id,


/*
 Identity
*/

displayName:name,

username:
name
.toLowerCase()
.replaceAll(" ","-"),

avatar:{

url:"",

initials:createInitials(name)

},


headline:"",

bio:"",



/*
 User category
*/

types:[

"member"

],



/*
 Academic identity
*/

education:[],


specializations:[],


skills:[],



/*
 Professional identity
*/

positions:[],



/*
 Contact privacy
*/

contact:{


email:{

value:email,

visible:false

},


linkedin:{

value:"",

visible:false

},


website:{

value:"",

visible:false

}


},




/*
 Trust system
*/

verification:{


verified:false,

verifiedTypes:[],

verifiedAt:null


},



/*
 Contributor system
*/

contributor:{


enabled:false,

approvedAt:null,

totalSubmissions:0


},




/*
 Reputation
*/

stats:{


reputation:0,

answers:0,

verifiedAnswers:0,

articles:0,

notes:0,

uploads:0


},



badges:[],


preferences:{


theme:"system",

notifications:true


},



createdAt:

new Date()
.toISOString(),


updatedAt:

new Date()
.toISOString()


};




let created =
await createRecord(

"profiles",

profile

);




if(

typeof PharmoraActivity !== "undefined"

){


PharmoraActivity.logActivity(

"profile.created",

"Profile created",

{

userId:user.id

}

);


}




return created;


}







/* ======================
 GET PRIVATE PROFILE
====================== */


async function getProfile(userId){


if(!userId){

return null;

}


let profiles =
await getRecords(
"profiles"
);



let profile =

profiles.find(

x=>

x.userId===userId
|| x.data?.userId===userId
|| x.publicId===userId
|| x.data?.publicId===userId
|| x.refId===userId
|| x.data?.refId===userId
|| x.id===userId

);



if(!profile){

return null;

}



/*
 DB v2 compatibility
 merge entity.data into profile root
*/

return deepMergeProfile(

profile,

profile.data || {}

);


}









/* ======================
 UPDATE PROFILE
====================== */


async function updateUserProfile(updates={}){


let user =
typeof currentUser==="function"
?
currentUser()
:
null;



if(!user){

return null;

}



let profile =
await getProfile(
user.id
);



if(!profile){

profile =
await createUserProfile(
user
);

}



let merged =
deepMergeProfile(

profile,

{

...updates,

updatedAt:

new Date()
.toISOString()

}

);




let updated =
await updateRecord(

"profiles",

profile.id,

merged

);



if(

typeof PharmoraActivity !== "undefined"

){


PharmoraActivity.logActivity(

"profile.updated",

"Profile updated",

{

userId:user.id

}

);


}




return updated;


}










/* ======================
 PUBLIC PROFILE
====================== */


async function getPublicProfile(userId){


let profile =
await getProfile(userId);



if(!profile){

return null;

}




let publicProfile =
structuredClone(profile);



/*
 Remove private contacts
*/


if(

publicProfile.contact?.email?.visible
!==true

){

delete publicProfile.contact.email;

}



if(

publicProfile.contact?.linkedin?.visible
!==true

){

delete publicProfile.contact.linkedin;

}



if(

publicProfile.contact?.website?.visible
!==true

){

delete publicProfile.contact.website;

}




/*
 Never expose preferences
*/

delete publicProfile.preferences;



return publicProfile;


}









/* ======================
 USER CONTRIBUTIONS
====================== */


async function getUserContributions(userId){



let result={


articles:[],

answers:[],

notes:[],

uploads:[]


};




let collections=[


{

name:"resources",

key:"articles"

},


{

name:"forum-replies",

key:"answers"

},


{

name:"notes",

key:"notes"

},


{

name:"books",

key:"uploads"

},


{

name:"teaching-materials",

key:"uploads"

}


];






for(let item of collections){


try{


let data =
await getRecords(
item.name
);



let mine =
data.filter(x=>{

return (

x.userId===userId

||

x.author?.id===userId

||

x.ownership?.ownerId===userId

);

});




result[item.key].push(

...mine

);



}

catch(e){}


}




return result;


}










/* ======================
 PROFILE ACTIVITY
====================== */


async function getProfileActivity(
userId,
limit=10
){


if(

typeof PharmoraActivity==="undefined"

){

return [];

}



return await PharmoraActivity
.getUserActivities(

userId,

limit

);


}




/* ======================
 PROFILE COMPLETION
====================== */


function profileCompletion(profile){


if(!profile){

return 0;

}


let fields=[

"displayName",

"headline",

"bio"

];


let done=0;


fields.forEach(x=>{

if(profile[x]){

done++;

}

});


if(
profile.avatar?.url
){

done++;

}


if(
profile.education?.length
){

done++;

}


if(
profile.positions?.length
){

done++;

}


if(
profile.specializations?.length
){

done++;

}



return Math.round(

(done / 7) * 100

);


}







/* ======================
 PROFILE BADGE
====================== */


function profileBadge(profile){


if(!profile){

return "";

}



if(
profile.verification?.verified
){

return "verified";

}



if(
profile.contributor?.enabled
){

return "contributor";

}



return "";


}








/* ======================
 SENSITIVE CHANGE CHECK
====================== */


function verificationSensitiveChange(

oldProfile={},

newProfile={}

){


let fields=[

"displayName",

"types",

"education",

"positions",

"specializations"

];



return fields.some(key=>{

return JSON.stringify(
oldProfile[key]
)
!==

JSON.stringify(
newProfile[key]
);

});


}



/* ======================
 EXPORT
====================== */


/*
 Direct v2 exports
*/

window.createUserProfile =
createUserProfile;


window.getProfile =
getProfile;


window.updateUserProfile =
updateUserProfile;


window.getPublicProfile =
getPublicProfile;


window.getUserContributions =
getUserContributions;


window.getProfileActivity =
getProfileActivity;

window.profileCompletion =
profileCompletion;


window.profileBadge =
profileBadge;


window.verificationSensitiveChange =
verificationSensitiveChange;

/*
 Namespace export
*/

window.PharmoraProfile={


createUserProfile,

getProfile,

updateUserProfile,

getPublicProfile,

getUserContributions,

getProfileActivity,

profileCompletion,

profileBadge,

verificationSensitiveChange

};



console.log(

"✓ PharmoraProfile ready"

);
;


/* ===== js/services/notification.service.js ===== */


;
/*
 Pharmora Notification Service v2
 Entity based
*/


const PharmoraNotify = (()=>{


async function send(
userId,
data={}
){


if(!userId){

return null;

}


return createRecord(

"notifications",

{

userId,


title:
data.title || "Notification",


message:
data.message || "",


type:
data.type || "info",


read:false,


target:
data.target || null,


targetId:
data.targetId || null,


createdAt:
new Date().toISOString()

}

);


}





async function getMine(){


let user =
currentUser();


if(!user){

return [];

}


let all =
await getRecords(
"notifications"
);


return all

.filter(x=>

(x.userId || x.data?.userId)
===
user.id

)

.sort(
(a,b)=>
new Date(
b.createdAt ||
b.data?.createdAt ||
b.metadata?.createdAt
)
-
new Date(
a.createdAt ||
a.data?.createdAt ||
a.metadata?.createdAt
)
);


}






async function unread(){


let data =
await getMine();


return data.filter(x=>

!(x.read ?? x.data?.read)

);


}






async function markRead(id){


let all =
await getRecords(
"notifications"
);


let item =
all.find(
x=>x.id===id
);


if(!item){

return null;

}


return updateRecord(

"notifications",

id,

{

read:true,


data:{

...(item.data || {}),

read:true

}

}

);


}






async function broadcast(data){


let users =
await getRecords(
"users"
);


let sent=[];


for(let u of users){


sent.push(

await send(
u.id,
data
)

);


}


return sent;


}







return{

send,
getMine,
unread,
markRead,
broadcast

};


})();






/*
 Global exports
*/

window.PharmoraNotify =
PharmoraNotify;


window.sendNotification =
PharmoraNotify.send;


window.getMyNotifications =
PharmoraNotify.getMine;


window.unreadNotifications =
PharmoraNotify.unread;


window.markNotificationRead =
PharmoraNotify.markRead;
;


/* ===== js/services/user-notification.service.js ===== */


;
/*
 Pharmora User Notification Service
*/



async function notifyUser(
userId,
data
){



return createRecord(

"user-notifications",

{

userId:userId,


title:data.title,


message:data.message,


type:

data.type || "info",



read:false,


createdAt:

new Date()
.toISOString()


}

);



}










async function getUserNotifications(){



let user =
currentUser();



if(!user){

return [];

}




let all =
await getRecords(
"user-notifications"
);



return all

.filter(

x=>x.userId===user.id

)

.sort(

(a,b)=>

new Date(b.createdAt)

-

new Date(a.createdAt)

);



}











async function unreadUserNotifications(){



let data =
await getUserNotifications();



return data.filter(

x=>!x.read

);



}











async function readNotification(id){



return updateRecord(

"user-notifications",

id,

{

read:true

}

);



}
;


/* ===== js/services/reputation.service.js ===== */


;
/*
 Pharmora Reputation Service
 Trust + Community Quality
*/


const reputationRules={


ANSWER_UPVOTED:5,


ANSWER_DOWNVOTED:-2,


ANSWER_VERIFIED:25,


CONTENT_REMOVED:-20,


ARTICLE_APPROVED:30,


NOTE_APPROVED:15


};







async function addProfileReputation(
userId,
action
){



if(!userId){

return;

}




let points =
reputationRules[action]

||

0;




if(points===0){

return;

}




let profile =
await getProfile(
userId
);




if(!profile){

return;

}




let current =

profile.stats?.reputation

||

0;





let reputation =

current + points;





let badges =
calculateBadges(

reputation

);






await updateRecord(

"profiles",

profile.id,

{


stats:{


...profile.stats,


reputation:reputation


},



badges:badges



}

);






await createRecord(

"reputation_logs",

{


userId:userId,


action:action,


points:points,


createdAt:

new Date()
.toISOString()


}

);



}









function calculateBadges(score){



let badges=[];



if(score>=100){


badges.push(

"⭐ Active Member"

);


}




if(score>=500){


badges.push(

"💎 Trusted Member"

);


}





if(score>=1000){


badges.push(

"🏆 Community Expert"

);


}





return badges;



}








async function getReputationHistory(userId){



let logs =
await getRecords(

"reputation_logs"

);




return logs.filter(

x=>x.userId===userId

);



}
;
