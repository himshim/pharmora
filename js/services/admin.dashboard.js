  /*
 Admin UI Helpers
*/


function adminStatCard(
title,
value,
icon,
action=""
){


let html =
PharmoraUI.card({

title:value,

body:

icon+" "+title,

badge:"Admin"

});


if(action){

html =
html.replace(

'class="card',

`onclick="${action}" class="card`

);

}


return html;


}



function adminButton(
text,
action
){


return PharmoraUI.button({

text,

action

});


}




async async function renderAdminStats(){



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
await getAudit();


}


}

catch(e){}










box.innerHTML =

adminStatCard(

"Pending Review",

pending,

"⏳",

"renderAdminActions()"

)

+

adminStatCard(

"Published",

approved,

"📚",

"renderAdminActions()"

)

+

adminStatCard(

"Users",

users.length,

"👥",

"renderUserManager()"

)

+

adminStatCard(

"Verification Requests",

verifications.length,

"✔",

"renderVerificationCenter()"

)

+

adminStatCard(

"Disabled Users",

banned,

"🚫",

"renderUserManager()"

)

+

adminStatCard(

"Audit Events",

audits.length,

"🧾",

"renderAuditLogs()"

);



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



${

PharmoraUI.card({

title:"⚡ Quick Actions",

body:"",

actions:

adminButton(
"📋 Review Queue",
"renderAdminActions()"
)

+

adminButton(
"🎓 Courses",
"loadManager('courses')"
)

+

adminButton(
"🔔 Notifications",
"loadManager('notifications')"
)

+

adminButton(
"🌱 Contributor Applications",
"renderContributorApplications()"
)

+

adminButton(
"🗑 Trash",
"renderTrash()"
)

+

adminButton(
"👥 Users",
"renderUserManager()"
)

})

}








${

PharmoraUI.card({

title:users.length,

body:"👥 Registered Users",

badge:"Community"

})

}




${

PharmoraUI.card({

title:"📈 Platform Insights",

body:

bars.length

?

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

:

"No analytics"

})

}







${

PharmoraUI.card({

title:"🔥 Popular Searches",

body:

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

})

}




</div>







<br>








${

PharmoraUI.card({

title:"🕒 Recent Activity",

body:

latest.length

?

latest.map(item=>

PharmoraUI.panel({

left:

`

<b>

${contentIcon(item._collection)}

${item.title || item.question || item.name || "Untitled"}

</b>

<br>

<small>

${item._collection}

</small>

`,

right:item.status

})

).join("")

:

"No activity"

})

}




${

PharmoraUI.card({

title:"🕒 Activity Feed",

body:

activity.length

?

activity.map(a=>

PharmoraUI.panel({

left:

`

<b>

${a.message}

</b>

<br>

<small>

${new Date(a.time).toLocaleString()}

</small>

`,

right:a.action

})

).join("")

:

"No activity yet"

})

}

`;



}