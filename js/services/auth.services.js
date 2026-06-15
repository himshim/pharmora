/*
 User & Role Service
 Demo Layer
*/


async function getUsers(){


return await fetch(
"/data/users.json"
)
.then(r=>r.json());


}





async function getRoles(){


return await fetch(
"/config/roles.json"
)
.then(r=>r.json());


}






async function checkPermission(
role,
permission
){


const roles =
await getRoles();



const found =
roles.find(
r=>r.role===role
);



if(!found){

return false;

}




return (

found.permissions.includes("*")

||

found.permissions.includes(permission)

);


}