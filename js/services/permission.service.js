/*
 Pharmora Permission Service
 Role Based Access Control
*/





let cachedPermissions=null;

let cachedRole=null;

let cachedUser=null;

let cachedTime=null;









async function getPermissions(role){


try{


/*
 Future:
 database roles collection
*/


if(
typeof getRecords==="function"
){


try{


let dynamicRoles =
await getRecords("roles");


let foundDynamic =
dynamicRoles.find(
x=>

x.id===role

||

x.role===role

||

x.name===role

);


if(foundDynamic){

return foundDynamic.permissions || [];

}


}catch(e){}


}




/*
 Current fallback
*/


const roles =

await fetch(

appPath(
"config/roles.json"
)

)

.then(r=>r.json());



let found =

roles.find(

item=>item.role===role

);



return found

?

found.permissions

:

[];



}


catch(error){


return [];


}


}









async function userPermissions(){





if(

typeof currentUser !== "function"

){


return [];


}







let user =
currentUser();

/*
 Owner root protection
*/

if(isOwner(user)){


cachedRole =
"owner";


cachedUser =
user.id;


cachedTime =
Date.now();


cachedPermissions =
["*"];


return cachedPermissions;


}




if(!user){



clearPermissionCache();



return [];



}









if(

cachedPermissions

&&

cachedRole===user.role

&&

cachedUser===user.id

&&

Date.now()-cachedTime < 30000

){


return cachedPermissions;


}








cachedRole =

user.role;



cachedUser =

user.id;



cachedTime =

Date.now();




let rolePermissions=[];


for(
let role of normalizeRoles(user)
){


rolePermissions.push(

...(await getPermissions(role))

);


}






let userSpecific =

user.permissions || [];






let profilePermissions=[];





if(

typeof getProfile==="function"

){



let profile =

await getProfile(

user.id

);






if(profile){





if(

profile.contributor?.enabled

){



profilePermissions.push(

"content.submit"

);



}






if(

profile.verification?.verified

&&

(

(

profile.verification.verifiedTypes || []

)

.includes(

"educator"

)

||

(

profile.verification.verifiedTypes || []

)

.includes(

"professional"

)

)

){



profilePermissions.push(

"forum.verify");



profilePermissions.push(

"verified.creator"

);



}



}



}







cachedPermissions =

[

...new Set([


...rolePermissions,


...profilePermissions,


...userSpecific


])

];








return cachedPermissions;





}











async function hasPermission(permission){







let permissions =

await userPermissions();








return (

permissions.includes("*")

||

permissions.includes(permission)

);






}












async function applyPermissions(){







let permissions =

await userPermissions();








document

.querySelectorAll(

"[data-permission]"

)

.forEach(item=>{







let required =

item.dataset.permission;








if(

permissions.includes("*")

||

permissions.includes(required)

){



item.style.display="";



}







else{



item.remove();



}





});





}













async function requirePermission(permission){



let allowed =
await hasPermission(
permission
);



if(!allowed){



if(
typeof showToast==="function"
){


showToast(

"You do not have permission",

"error"

);


}





location.href =

typeof appPath==="function"

?

appPath("dashboard/")

:

"../dashboard/";




return false;



}





return true;



}





async function canEntityAction(
entity,
action
){


let user =
currentUser();


if(!user){

return false;

}



if(isOwner(user)){

return true;

}



if(

entity?.ownership?.ownerId
===
user.id

||

entity?.userId
===
user.id

){

return true;

}



return await hasPermission(

"content."+action+".any"

) || await hasPermission(

"content."+action

);


}



function clearPermissionCache(){



cachedPermissions=null;


cachedRole=null;


cachedUser=null;


cachedTime=null;



}

/*
 Pharmora Permission Engine v3 helpers
 Backward compatible
*/


function normalizeRoles(user){


if(!user){

return [];

}


return [

user.role,

...(user.roles || [])

]

.filter(Boolean);


}




function isOwner(user){


return normalizeRoles(user)

.includes("owner");


}

window.userPermissions = userPermissions;
window.hasPermission = hasPermission;
window.applyPermissions = applyPermissions;
window.requirePermission = requirePermission;
window.canEntityAction = canEntityAction;
window.clearPermissionCache = clearPermissionCache;
window.normalizeRoles = normalizeRoles;
window.isOwner = isOwner;