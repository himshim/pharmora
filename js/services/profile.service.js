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