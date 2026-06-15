/*
 Pharmora Permission Service
 Role Based Access Control
*/








let cachedPermissions=null;









async function getPermissions(role){





const roles =

await fetch(

"/config/roles.json"

)

.then(r=>r.json());









let found =

roles.find(

item=>item.role===role

);








if(!found){


return [];


}








return found.permissions;




}









async function userPermissions(){





if(cachedPermissions){


return cachedPermissions;


}







if(

typeof currentUser!=="function"

){


return [];


}








let user =
currentUser();






if(!user){


return [];


}








cachedPermissions =

await getPermissions(

user.role

);






return cachedPermissions;



}









async function hasPermission(
permission
){






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



item.style.display="block";



}







else{



item.remove();



}





});




}











async function requirePermission(
permission
){







let allowed =

await hasPermission(

permission

);








if(!allowed){






showToast(

"You do not have permission"

);






location.href="/dashboard/";







return false;



}









return true;



}











function clearPermissionCache(){



cachedPermissions=null;



}