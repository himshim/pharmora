/*
 Pharmora Audit Service v2
 Database Provider Based
*/


/* ======================
 SAVE AUDIT
====================== */


async function saveAudit(
type,
data={}
){


let entry={


type,


data,


user:

typeof currentUser==="function"
?
currentUser()
:
null,


time:

new Date()
.toISOString()


};



return await createRecord(

"audit",

entry

);


}








/* ======================
 GET AUDIT
====================== */


async function getAudit(){


let logs =
await getRecords(
"audit"
);


return logs

.sort((a,b)=>

new Date(
b.time ||
b.createdAt ||
0
)

-

new Date(
a.time ||
a.createdAt ||
0
)

);


}








/* ======================
 CLEAR AUDIT
====================== */


async function clearAudit(){


let logs =
await getRecords(
"audit"
);



for(let log of logs){


await deleteRecord(

"audit",

log.id

);


}



return true;


}







/*
 Export
*/


window.saveAudit =
saveAudit;


window.getAudit =
getAudit;


window.clearAudit =
clearAudit;


console.log(
"✓ PharmoraAudit service ready"
);