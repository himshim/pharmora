/*
 Pharmora User Notification Service
*/



async function sendNotification(
userId,
data
){



return createRecord(

"notifications",

{

userId:userId,


title:data.title,


message:data.message,


type:

data.type || "info",


read:false,


createdAt:

new Date()
.toISOString()


}

);



}









async function getMyNotifications(){



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

.filter(

x=>x.userId===user.id

)

.sort(

(a,b)=>

new Date(b.createdAt)

-

new Date(a.createdAt)

);



}









async function markNotificationRead(id){



return updateRecord(

"notifications",

id,

{

read:true

}

);



}









async function unreadNotifications(){



let list =
await getMyNotifications();



return list.filter(

x=>!x.read

);



}