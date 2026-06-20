/*
 Pharmora Access Service v2
*/


async function getMyContent(collection){


let user =
currentUser();


if(!user){

return [];

}


let records =
await getRecords(collection);


return records.filter(x=>

x.ownership?.ownerId === user.id

);


}





function canManageContent(item){


let user =
currentUser();


if(!user){

return false;

}



if(
user.role==="owner" ||
user.role==="admin"
){

return true;

}



return (

item.ownership?.ownerId === user.id

);


}






function canModerate(){


let user =
currentUser();


return !!(

user &&

[
"owner",
"admin",
"moderator"
]
.includes(user.role)

);


}