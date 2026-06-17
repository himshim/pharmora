/*
 Pharmora Report Moderation
*/


async function renderReports(){

let title =
document.getElementById(
"section-title"
);


if(title){


title.innerHTML =
"🚩 Report Queue";


}

const app =
document.getElementById("admin-actions");


if(!app){
return;
}



let reports =
await getRecords("reports");



reports =
reports.filter(
r=>r.status==="pending"
);



app.innerHTML = `

<h2>
🚩 Report Queue
</h2>


${
reports.length ?

reports.map(report=>`

<div class="panel">


<div>

<strong>
${report.collection}
</strong>

<p>
${report.reason}
</p>


<small>
Reported by:
${report.reportedBy?.name || "Unknown"}
</small>


</div>


<div>


<button
onclick="dismissReport('${report.id}')">

Dismiss

</button>


<button
onclick="removeReportedContent('${report.id}')">

Remove

</button>


</div>


</div>


`).join("")


:

`

<div class="card">

🎉 No pending reports

</div>

`

}


`;



}