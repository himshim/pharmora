/*
 Pharmora Dashboard Helpers v2
 DB entity compatibility layer
*/
/*
 Dashboard UI helpers
*/


function dashboardCard(
title,
body,
icon="",
action=""
){


let html =
PharmoraUI.card({

title:

(icon ? icon+" " : "")
+
title,


body,

actions:""

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




function dashboardStat(
title,
value
){


return PharmoraUI.card({

title:value,

body:title,

badge:"Stats"

});


}

function dashboardOwnerId(item){


return (

item.userId

||

item.author?.id

||

item.ownership?.ownerId

||

item.data?.userId

||

item.data?.author?.id

||

null

);


}





function dashboardStatus(item){


return (

item.moderation?.status

||

item.lifecycle?.status

||

item.status

||

item.data?.status

||

"draft"

);


}





function dashboardUserRoles(user){


return [

user?.role,

...(user?.roles || [])

]

.filter(Boolean);


}

async function loadContributorDashboard(){



let box =
document.getElementById(
"contributor-panel"
);



if(!box){

return;

}




let user =
currentUser();



if(!user){

return;

}




let permissions =
await userPermissions();






if(

!permissions.includes("content.submit")

&&

!permissions.includes("*")

){



box.innerHTML = `


<div class="card">


<h2>

🌱 Become a Contributor

</h2>


<p>

Share pharmacy knowledge and help learners.

</p>


<br>


<a

href="../contribute/"

class="btn btn-primary">

Apply Now

</a>


</div>


`;



return;


}








let collections=[

"resources",
"books",
"events",
"jobs",
"articles",
"tools",

"teaching-materials",
"question-bank",
"assignments"

];






let uploads=[];





for(let col of collections){



try{


let data =
await getRecords(col);



uploads.push(

...data.filter(

x=>

dashboardOwnerId(x)

===

user.id

)

);



}

catch(e){}



}







let approved =

uploads.filter(

x=>

dashboardStatus(x)

===

"approved"

)
.length;





let pending =

uploads.filter(

x=>

dashboardStatus(x)

===

"pending"

)
.length;






let score =

uploads.length

?

Math.round(

(approved/uploads.length)

*

100

)

:

0;








box.innerHTML = `



<div class="card">


<div class="contributor-badge">

⭐ Contributor Dashboard

</div>


<br><br>


<div class="grid">

${dashboardStat(
"Total Uploads",
uploads.length
)}

${dashboardStat(
"Approved",
approved
)}

${dashboardStat(
"Reviewing",
pending
)}

</div>





<br>



<h3>

Trust Score: ${score}%

</h3>



<progress

value="${score}"

max="100">

</progress>



</div>


`;



}

async function loadSmartDashboard(){
  let box = document.getElementById("smart-dashboard");
  if(!box){
    return;
  }
  let user = currentUser();
  if(!user){
    return;
  }
  let profile = await getProfile(user.id);
  let types = profile?.types || [];

  let cards = dashboardCard(
    "My Workspace",
    "View achievements, reputation and credentials.",
    "👤",
    "openMyProfile()"
  ) + dashboardCard(
    "Learning Track",
    "Courses, subject notes and study resources.",
    "🎓",
    "location.href='../learn/'"
  ) + dashboardCard(
    "Discussions",
    "Consult community questions and help others.",
    "🌐",
    "location.href='../community/'"
  ) + dashboardCard(
    "Knowledge Base",
    "Reference books, notes and databases.",
    "📚",
    "location.href='../library/'"
  ) + dashboardCard(
    "Calculators",
    "Calculators and clinical pharmacy utilities.",
    "🧪",
    "location.href='../tools/'"
  );

  if(types.includes("educator")){
    cards += dashboardCard(
      "Teaching Studio",
      "Manage lectures and academic courses.",
      "👨‍🏫",
      "location.href='../teach/'"
    );
  }

  if(types.includes("professional")){
    cards += dashboardCard(
      "Practice Hub",
      "Share professional insights and verify cases.",
      "💊",
      "location.href='../community/'"
    );
  }

  box.innerHTML = cards;
}

async function loadManagementPanel(){



let box =
document.getElementById(
"management-panel"
);



if(!box){

return;

}




let user =
currentUser();



if(!user){

return;

}




let permissions =
await userPermissions();





let cards="";






if(

permissions.includes("*")

||

permissions.includes("content.review")

){


cards += dashboardCard(

"Admin Panel",

"Review content and manage platform.",

"🛡",

"location.href='../admin/'"

);


}









if(

permissions.includes("*")

||

permissions.includes("analytics.view")

){


cards += dashboardCard(

"Analytics",

"Platform insights and activity.",

"📈",

"location.href='../admin/?view=analytics'"

);


}









if(

dashboardUserRoles(user)
.includes("owner")

||

permissions.includes("*")

){


cards += dashboardCard(

"Owner Console",

"System configuration and control.",

"👑",

"location.href='../admin/?view=owner'"

);


}







if(!cards){

return;

}





box.innerHTML=`


<h2>

⚙ Management

</h2>


<br>


<div class="grid">


${cards}


</div>


`;



}


async function openMyProfile(){


let profile =
await getProfile(
currentUser().id
);


if(profile){

location.href =

"../profile.html?id=" +

(

profile.publicId

||

profile.refId

||

profile.id

);


}


}


async function loadDashboardInsights(){


let box =
document.getElementById(
"dashboard-insights"
);


if(!box){

return;

}



let user =
currentUser();


if(!user){

return;

}



let profile =
await getProfile(
user.id
);





/*
 PROFILE COMPLETION
*/


let complete =

typeof profileCompletion==="function"

?

profileCompletion(profile)

:

0;





/*
 NOTIFICATIONS
*/


let unread = 0;


try{


if(window.PharmoraNotify){


unread =

(
await PharmoraNotify.unread()
)

.length;


}


}catch(e){}








/*
 ACTIVITY
*/


let activity=[];


try{


if(
typeof getProfileActivity==="function"
){


activity =
await getProfileActivity(
user.id,
3
);


}


}catch(e){}







box.innerHTML =


dashboardStat(

"Profile Strength",

complete + "%"

)


+

dashboardStat(

"Unread updates",

unread

)


+

dashboardStat(

"Community points",

profile?.stats?.reputation || 0

)


+

PharmoraUI.card({

title:"⚡ Activity",

body:

activity.length

?

activity
.map(a=>a.message || a.action)
.join(" | ")

:

"No recent activity"

});


}

window.loadDashboard =
async function(){

let user =
typeof currentUser==="function"
? currentUser()
: null;

[
"dashboard-insights",
"smart-dashboard",
"contributor-panel",
"management-panel"
]
.forEach(id=>{

if(
window.PharmoraUI
&&
PharmoraUI.loading
){

PharmoraUI.loading(
id,
2
);

}

});

let box =
document.getElementById("dashboard-user");

let welcome =
document.getElementById("welcome-title");

let subtitle =
document.getElementById(
"dashboard-subtitle"
);

if(!user){

if(box){
box.innerHTML="👤 Guest";
}

return;

}


let profile =
typeof getProfile==="function"
?
await getProfile(user.id)
:
null;


if(box){


box.innerHTML =

"👤 " +

(

profile?.displayName

||

profile?.username

||

user.name

||

user.email

||

"User"

);


}


if(welcome){

welcome.innerHTML =

"Welcome back, "+

(

profile?.displayName

||

profile?.username

||

"User"

)

+

" 👋";

}


if(subtitle && profile){


let identity = [

...(profile.types || []),

...(profile.specializations || [])

];


subtitle.innerHTML =

identity.length

?

identity.join(" • ")

:

"Continue learning, teaching and building knowledge.";



let badge =

typeof profileBadge==="function"

?

profileBadge(profile)

:

"";


if(badge){


subtitle.innerHTML +=

"<br>" + badge;


}



else if(
profile.verification?.requiresReview
){


subtitle.innerHTML +=

"<br>⚠ Verification requires review";


}


}

await loadDashboardInsights();

await loadContributorDashboard();

await loadSmartDashboard();

await loadManagementPanel();

};


window.addEventListener(
"pharmora-ready",
loadDashboard
);