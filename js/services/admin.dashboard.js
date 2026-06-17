async function renderAdminStats(){



let box =
document.getElementById(
"admin-stats"
);



if(!box){

return;

}





let items =
await getAllReviewItems();




let pending =
items.filter(

x=>x.status==="pending"

).length;




let approved =
items.filter(

x=>x.status==="approved"

).length;







let users=[];


try{


users =
await getRecords(
"users"
);


}

catch(e){}








let banned =

users.filter(

x=>x.disabled

).length;








let verifications=[];


try{


if(

typeof getVerificationRequests==="function"

){


verifications =
await getVerificationRequests();


}


}

catch(e){}









let audits=[];


try{


if(

typeof getAudit==="function"

){


audits =
getAudit();


}


}

catch(e){}










box.innerHTML = `


<div
class="card"
onclick="renderAdminActions()">


<h2>

${pending}

</h2>


<p>

⏳ Pending Review

</p>


</div>








<div
class="card"
onclick="renderAdminActions()">


<h2>

${approved}

</h2>


<p>

📚 Published

</p>


</div>








<div
class="card"
onclick="renderUserManager()">


<h2>

${users.length}

</h2>


<p>

👥 Users

</p>


</div>








<div
class="card"
onclick="renderVerificationCenter()">


<h2>

${verifications.length}

</h2>


<p>

✔ Verification Requests

</p>


</div>








<div
class="card"
onclick="renderUserManager()">


<h2>

${banned}

</h2>


<p>

🚫 Disabled Users

</p>


</div>








<div
class="card"
onclick="renderAuditLogs()">


<h2>

${audits.length}

</h2>


<p>

🧾 Audit Events

</p>


</div>


`;



}

/*
=========================
 ADMIN DASHBOARD HOME
=========================
*/


async function renderAdminHome(){



let title =
document.getElementById(
"section-title"
);



if(title){


title.innerHTML =
"Dashboard Overview";


}






let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}




let items =
await getAllReviewItems();




let users=[];


try{


users =
await getRecords(
"users"
);


}

catch(e){}




let bars=[];

let popular=[];




if(

typeof analyticsBars==="function"

){


bars =
analyticsBars();


}




if(

typeof topAnalyticsTargets==="function"

){


popular =
topAnalyticsTargets(

"search"

);


}



let latest =
items

.sort(

(a,b)=>

new Date(b.createdAt || 0)

-

new Date(a.createdAt || 0)

)

.slice(0,5);



let activity=[];


if(
typeof getActivities==="function"
){

activity =
getActivities(5);

}



box.innerHTML = `



<div class="grid">



<div class="card">

<h2>⚡ Quick Actions</h2>

<br>


<button class="btn"

onclick="renderAdminActions()">

📋 Review Queue

</button>


<br><br>


<button class="btn"

onclick="loadManager('courses')">

🎓 Courses

</button>


<br><br>


<button class="btn"

onclick="loadManager('notifications')">

🔔 Notifications

</button>

<br><br>


<button 
class="btn"

onclick="renderContributorApplications()">

🌱 Contributor Applications

</button>

<br><br>


<button

class="btn"

onclick="renderTrash()">

🗑 Trash

</button>

<br><br>


<button class="btn"

onclick="renderUserManager()">

👥 Users

</button>

</div>








<div class="card">

<h2>👥 Community</h2>


<br>


<h1>

${users.length}

</h1>


<p>

Registered Users

</p>


</div>




<div class="card">



<h2>

📈 Platform Insights

</h2>



<br>



${

bars.map(x=>`



<p>

${x.label}

<b style="float:right">

${x.value}

</b>

</p>


<div class="analytics-bar">

<div style="width:${x.percent}%">

</div>

</div>



`).join("")

}



</div>





<div class="card">



<h2>

🔥 Popular Searches

</h2>



<br>




${

popular.length

?

popular.map(x=>`

<p>

🔎 ${x[0]}

<span style="float:right">

${x[1]}

</span>

</p>

`).join("")


:


"No searches yet"


}



</div>



</div>







<br>








<div class="card">


<h2>

🕒 Recent Activity

</h2>


<br>




${

latest.length

?

latest.map(item=>`

<div class="panel">


<div>


<b>

${contentIcon(item._collection)}

${

item.title ||

item.question ||

item.name ||

"Untitled"

}

</b>


<br>


<small>

${item._collection}

</small>



</div>


<span class="status">

${item.status}

</span>


</div>


`).join("")


:


"No activity"


}




</div>

<div class="card">


<h2>

🕒 Activity Feed

</h2>


<br>


${

activity.length

?

activity.map(a=>`

<div class="panel">

<div>

<b>

${a.message}

</b>

<br>

<small>

${new Date(a.time).toLocaleString()}

</small>

</div>


<span>

${a.action}

</span>


</div>


`).join("")


:


"No activity yet"


}


</div>

`;



}