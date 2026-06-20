/*
 Pharmora Activity Service v2

 Database Provider Based
*/







async function logActivity(
action,
message,
data={}
){



return await createRecord(

"activity",

{


action:action,


message:message,


level:

data.level || "info",



user:

typeof currentUser==="function"

?

currentUser()

:

null,



details:data,



time:

new Date()
.toISOString()


}


);



}










async function getActivities(
limit=20
){



let logs =
await getRecords(
"activity"
);





return logs


.sort((a,b)=>{


return new Date(

b.time || b.metadata?.createdAt

)

-

new Date(

a.time || a.metadata?.createdAt

);


})


.slice(

0,

limit

);



}











async function clearActivities(){



let logs =
await getRecords(
"activity"
);




for(
let item of logs
){


await deleteRecord(
item.id
);


}



}









async function getUserActivities(
userId,
limit=20
){



let logs =
await getActivities(
1000
);




return logs


.filter(x=>{


return (

x.data?.user?.id===userId

||

x.user?.id===userId

);


})


.slice(
0,
limit
);



}









/*
 Export
*/


window.PharmoraActivity = {


logActivity,


getActivities,


clearActivities,


getUserActivities


};





console.log(
"✓ PharmoraActivity ready"
);