/*
 Permission Service
*/


async function getPermissions(role){


const roles =
await fetch(
"/config/roles.json"
)
.then(r=>r.json());



const found =
roles.find(
item=>item.role===role
);



if(!found){

return [];

}



return found.permissions;


}







async function applyPermissions(){



/*
temporary user

Later Supabase provides this
*/


const currentUser = {

name:"Demo Maintainer",

role:"maintainer"

};






const permissions =
await getPermissions(
currentUser.role
);






document

.querySelectorAll("[data-permission]")

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