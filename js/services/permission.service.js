/*
 Permission Service
*/







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












async function applyPermissions(){





if(

typeof currentUser !== "function"

){


return;


}








let user =

currentUser();








if(

!user

){


return;


}









let permissions =

await getPermissions(

user.role

);










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



item.style.display="none";



}







});





}