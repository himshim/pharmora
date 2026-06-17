function renderAuditLogs(){



let box =
document.getElementById(
"admin-actions"
);



document.getElementById(
"section-title"
).innerHTML =
"🧾 Audit Logs";




let logs =
typeof getAudit==="function"

?

getAudit()

:

[];





if(!logs.length){



box.innerHTML = `

<div class="card">

No audit records yet.

</div>

`;


return;



}






box.innerHTML =

logs.map(log=>`


<div class="panel">


<div>


<b>

${log.type}

</b>


<br>


${

log.user?.name ||

"System"

}


<br>


<small>

${

new Date(log.time)

.toLocaleString()

}

</small>


</div>





<div>


<pre>

${

JSON.stringify(
log.data,
null,
2
)

}

</pre>


</div>


</div>


`)

.join("");



}