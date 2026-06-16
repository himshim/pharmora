/*
 Pharmora Profile Service
 Identity + Public Profiles
*/


async function createUserProfile(user){


if(!user){
return null;
}


let profiles =
await getRecords("profiles");


let existing =
profiles.find(
x=>x.userId===user.id
);


if(existing){
return existing;
}



return createRecord(

"profiles",

{

userId:user.id,


displayName:user.name,


/*
 A user can be multiple:
 student + educator
 educator + professional
 etc.
*/

types:[
"member"
],



headline:"",



positions:[

/*

Example:

{
 category:"professional",
 title:"Hospital Pharmacist",
 organization:"ABC Hospital",
 current:true,
 startYear:2024
}

*/

],



education:[

/*

Example:

{
 degree:"B.Pharm",
 institute:"ABC College",
 year:"2026"
}

*/

],



specializations:[],


skills:[],


bio:"",



contact:{


email:{

value:user.email,

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




verification:{


verified:false,


verifiedTypes:[],


verifiedAt:null


},




contributor:{


enabled:false,


approvedAt:null,


totalSubmissions:0


},




stats:{


reputation:0,


answers:0,


verifiedAnswers:0,


articles:0,


notes:0


},




badges:[],




createdAt:

new Date()
.toISOString()



}

);



}







async function getProfile(userId){


let profiles =
await getRecords(
"profiles"
);


return (

profiles.find(

x=>x.userId===userId

)

||

null

);


}








async function updateUserProfile(updates){



let user =
currentUser();



if(!user){

return null;

}



let profile =
await getProfile(
user.id
);



if(!profile){


profile =
await createUserProfile(user);


}




return updateRecord(

"profiles",

profile.id,

{

...profile,

...updates

}

);



}










async function getPublicProfile(userId){



let profile =
await getProfile(userId);



if(!profile){

return null;

}




let publicProfile =
structuredClone(profile);




// privacy filtering


if(

publicProfile.contact?.email?.visible

!==

true

){

delete publicProfile.contact.email;

}




if(

publicProfile.contact?.linkedin?.visible

!==

true

){

delete publicProfile.contact.linkedin;

}



if(

publicProfile.contact?.website?.visible

!==

true

){

delete publicProfile.contact.website;

}



return publicProfile;



}









async function getUserContributions(userId){



let result = {


articles:[],


answers:[],


notes:[]


};






let collections = [

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

}


];








for(

let item of collections

){



try{



let data =

await getRecords(

item.name

);





result[item.key] =

data.filter(

x=>

x.author?.id===userId

||

x.userId===userId

);




}

catch(e){}




}






return result;



}