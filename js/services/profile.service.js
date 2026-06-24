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

||

x.data?.userId===userId

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
 VERIFICATION CHANGE CHECK
====================== */


function verificationSensitiveChange(
oldProfile,
updates
){


let fields=[

"displayName",
"education",
"positions",
"specializations"

];



return fields.some(

key=>

updates[key]

&&

JSON.stringify(updates[key])

!==

JSON.stringify(oldProfile[key])

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



let verificationReset={};


if(

profile.verification?.verified

&&

verificationSensitiveChange(
profile,
updates
)

){


verificationReset={


verification:{


...profile.verification,


verified:false,


requiresReview:true,


previousVerifiedAt:

profile.verification.verifiedAt,


changedAt:

new Date()
.toISOString()


}


};


}




let merged =
deepMergeProfile(

profile,

{

...updates,


...verificationReset,


updatedAt:

new Date()
.toISOString()

}

);




let updated =
await updateRecord(

"profiles",

profile.id,

{

...merged,


data:{

...(profile.data || {}),


/*
 Public identity
*/

displayName:
merged.displayName,


username:
merged.username,


avatar:
merged.avatar,


headline:
merged.headline,


bio:
merged.bio,



/*
 User identity
*/

types:
merged.types,


specializations:
merged.specializations,


skills:
merged.skills,



/*
 Career
*/

education:
merged.education,


positions:
merged.positions,



/*
 Contact + trust
*/

contact:
merged.contact,


verification:
merged.verification


}

}

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


let checks=[

profile.displayName,

profile.avatar?.initials,

profile.headline,

profile.bio,

profile.education?.length,

profile.specializations?.length,

profile.skills?.length

];


let done =
checks.filter(Boolean)
.length;


return Math.round(

(done / checks.length) * 100

);


}







/* ======================
 PROFILE TYPE HELPERS
====================== */


function hasProfileType(
profile,
type
){


return (

profile?.types || []

)
.includes(type);


}







/* ======================
 VERIFICATION BADGE
====================== */


function profileBadge(profile){


if(

profile?.verification?.verified

){


return "✔ Verified";


}



if(

profile?.verification?.requiresReview

){


return "⏳ Review Required";


}



return "";



}


/* ======================
 EXPORT
====================== */


window.PharmoraProfile={


createUserProfile,

getProfile,

updateUserProfile,

getPublicProfile,

getUserContributions,

getProfileActivity,

profileCompletion,

hasProfileType,

profileBadge


};



window.getProfile=getProfile;

window.updateUserProfile=updateUserProfile;

window.getPublicProfile=getPublicProfile;

window.profileCompletion=profileCompletion;

window.profileBadge=profileBadge;




console.log(

"✓ PharmoraProfile ready"

);