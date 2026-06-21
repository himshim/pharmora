/*
 Pharmora Notification Service v2
 Entity based
*/


const PharmoraNotify = (()=>{


async function send(
userId,
data={}
){


if(!userId){

return null;

}


return createRecord(

"notifications",

{

userId,


title:
data.title || "Notification",


message:
data.message || "",


type:
data.type || "info",


read:false,


target:
data.target || null,


targetId:
data.targetId || null,


createdAt:
new Date().toISOString()

}

);


}





async function getMine(){


let user =
currentUser();


if(!user){

return [];

}


let all =
await getRecords(
"notifications"
);


return all

.filter(x=>

(x.userId || x.data?.userId)
===
user.id

)

.sort(
(a,b)=>
new Date(
b.createdAt ||
b.data?.createdAt ||
b.metadata?.createdAt
)
-
new Date(
a.createdAt ||
a.data?.createdAt ||
a.metadata?.createdAt
)
);


}






async function unread(){


let data =
await getMine();


return data.filter(x=>

!(x.read ?? x.data?.read)

);


}






async function markRead(id){


let all =
await getRecords(
"notifications"
);


let item =
all.find(
x=>x.id===id
);


if(!item){

return null;

}


return updateRecord(

"notifications",

id,

{

read:true,


data:{

...(item.data || {}),

read:true

}

}

);


}






async function broadcast(data){


let users =
await getRecords(
"users"
);


let sent=[];


for(let u of users){


sent.push(

await send(
u.id,
data
)

);


}


return sent;


}







return{

send,
getMine,
unread,
markRead,
broadcast

};


})();






/*
 Global exports
*/

window.PharmoraNotify =
PharmoraNotify;


window.sendNotification =
PharmoraNotify.send;


window.getMyNotifications =
PharmoraNotify.getMine;


window.unreadNotifications =
PharmoraNotify.unread;


window.markNotificationRead =
PharmoraNotify.markRead;