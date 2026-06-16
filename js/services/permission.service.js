/*
 Pharmora Permission Service
 Role Based Access Control
*/





let cachedPermissions=null;

let cachedRole=null;









async function getPermissions(role){





try{



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






if(!user){



clearPermissionCache();



return [];



}









if(

cachedPermissions

&&

cachedRole===user.role

){


return cachedPermissions;


}








cachedRole =

user.role;




let rolePermissions =

await getPermissions(

user.role

);






let userSpecific =

user.permissions || [];







cachedPermissions =

[

...new Set([

...rolePermissions,

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









function clearPermissionCache(){



cachedPermissions=null;


cachedRole=null;



}