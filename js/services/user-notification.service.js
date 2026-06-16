/*
 Pharmora User Notification Service
*/



async function notifyUser(
userId,
data
){



return createRecord(

"user-notifications",

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










async function getUserNotifications(){



let user =
currentUser();



if(!user){

return [];

}




let all =
await getRecords(
"user-notifications"
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











async function unreadUserNotifications(){



let data =
await getUserNotifications();



return data.filter(

x=>!x.read

);



}











async function readNotification(id){



return updateRecord(

"user-notifications",

id,

{

read:true

}

);



}