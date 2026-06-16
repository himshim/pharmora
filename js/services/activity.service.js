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
logs.slice(-200);






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