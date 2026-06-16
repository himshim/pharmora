/*
 Pharmora Audit Service
 Recovery + History
*/



function saveAudit(
type,
data
){


let logs =
JSON.parse(

localStorage.getItem(
"audit"
)

||

"[]"

);





logs.push({


id:

crypto.randomUUID(),


type:type,


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
logs.slice(-300);




localStorage.setItem(

"audit",

JSON.stringify(logs)

);



}









function getAudit(){



return JSON.parse(

localStorage.getItem(
"audit"
)

||

"[]"

)

.reverse();



}










function clearAudit(){



localStorage.removeItem(

"audit"

);



}