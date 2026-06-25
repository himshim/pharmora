/*
 Admin Audit Logs
 Pharmora UI v3
*/


async function renderAuditLogs(){



let box =
document.getElementById(
"admin-actions"
);



document.getElementById(
"section-title"
)
.innerHTML =
"🧾 Audit Logs";




let logs =
typeof getAudit==="function"

?

await getAudit()

:

[];





if(!logs.length){



box.innerHTML =

PharmoraUI.empty(

"No audit records yet."

);



return;



}







box.innerHTML =

logs.map(log=>


PharmoraUI.card({


title:

"🧾 " +

(
log.type ||
log.action ||
"Audit Event"
),



html:true,



body:


PharmoraUI.panel({

left:

`

<b>User</b>

<br>

${

log.user?.name ||

log.admin?.name ||

"System"

}

`,

right:

log.time

?

new Date(
log.time
)
.toLocaleString()

:

""

})


+


PharmoraUI.panel({

left:

"<b>Details</b>",


right:

`

<pre>

${

JSON.stringify(

log.data ||

log,

null,

2

)

}

</pre>

`

})



})


)
.join("");



}