/*
 Pharmora Activity Service
 Platform Timeline
*/



function logActivity(
action,
message,
data={}
){



let logs =
JSON.parse(

localStorage.getItem(
"activity"
)

||

"[]"

);





logs.push({


id:

crypto.randomUUID(),


action:action,


message:message,


data:data,


level:

data.level || "info",


user:

typeof currentUser==="function"

?

currentUser()

:

null,


time:

new Date()
.toISOString()


});






logs =
logs.slice(-1000);






localStorage.setItem(

"activity",

JSON.stringify(logs)

);



}










function getActivities(
limit=20
){



return JSON.parse(

localStorage.getItem(
"activity"
)

||

"[]"

)

.reverse()

.slice(

0,

limit

);



}










function clearActivities(){



localStorage.removeItem(

"activity"

);



}
function getUserActivities(
userId,
limit=20
){



return getActivities(

1000

)

.filter(

x=>x.user?.id===userId

)

.slice(

0,

limit

);



}