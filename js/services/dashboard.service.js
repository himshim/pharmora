/*
 Pharmora Dashboard Helpers v2
 DB entity compatibility layer
*/


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



<div class="card">

<h2>

${uploads.length}

</h2>

<p>Total Uploads</p>

</div>




<div class="card">

<h2>

${approved}

</h2>

<p>Approved</p>

</div>




<div class="card">

<h2>

${pending}

</h2>

<p>Reviewing</p>

</div>



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



let box =
document.getElementById(
"smart-dashboard"
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



let types =
profile?.types || [];





let cards = `

<div class="card"

onclick="openMyProfile()">


<h2>

👤 My Profile

</h2>


<p>

View achievements, reputation and public profile.

</p>


</div>

<div class="card"
onclick="location.href='../learn/'">


<h2>

🎓 Learning Center

</h2>


<p>

Courses, notes and study resources.

</p>


</div>






<div class="card"
onclick="location.href='../community/'">


<h2>

🌐 Community Q&A

</h2>


<p>

Ask questions and help others.

</p>


</div>






<div class="card"
onclick="location.href='../library/'">


<h2>

📚 Library

</h2>


<p>

Books, notes and references.

</p>


</div>






<div class="card"
onclick="location.href='../tools/'">


<h2>

🧪 Quick Tools

</h2>


<p>

Calculators and pharmacy utilities.

</p>


</div>


`;






if(

types.includes("educator")

){



cards += `


<div class="card"
onclick="location.href='../teach/'">


<h2>

👨‍🏫 Teaching Studio

</h2>


<p>

Create lectures and educational material.

</p>


</div>


`;



}







if(

types.includes("professional")

){



cards += `


<div class="card"
onclick="location.href='../community/'">


<h2>

💊 Professional Corner

</h2>


<p>

Share experience and answer discussions.

</p>


</div>


`;



}





box.innerHTML =
cards;



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


cards += `


<div class="card"

onclick="location.href='../admin/'">


<h2>

🛡 Admin Panel

</h2>


<p>

Review content and manage platform.

</p>


</div>


`;


}









if(

permissions.includes("*")

||

permissions.includes("analytics.view")

){


cards += `


<div class="card"

onclick="location.href='../admin/?view=analytics'">


<h2>

📈 Analytics

</h2>


<p>

Platform insights and activity.

</p>


</div>


`;


}









if(

dashboardUserRoles(user)
.includes("owner")

||

permissions.includes("*")

){


cards += `


<div class="card"

onclick="location.href='../admin/?view=owner'">


<h2>

👑 Owner Console

</h2>


<p>

System configuration and control.

</p>


</div>


`;


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
profile.userId
||
currentUser().id
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


let complete = 0;


if(profile?.displayName){

complete += 20;

}


if(profile?.bio){

complete += 20;

}


if(
(profile?.types || [])
.length
){

complete += 20;

}


if(
(profile?.specializations || [])
.length
){

complete += 20;

}


if(
(profile?.positions || [])
.length
){

complete += 20;

}





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







box.innerHTML = `



<div class="card">


<h2>

👤 Profile Strength

</h2>


<h1>

${complete}%

</h1>


<progress

value="${complete}"

max="100">

</progress>


<p>

Complete your Pharmora identity.

</p>


</div>







<div class="card">


<h2>

🔔 Notifications

</h2>


<h1>

${unread}

</h1>


<p>

Unread updates

</p>


</div>







<div class="card">


<h2>

⭐ Reputation

</h2>


<h1>

${profile?.stats?.reputation || 0}

</h1>


<p>

Community points

</p>


</div>







<div class="card">


<h2>

⚡ Activity

</h2>


${

activity.length

?

activity.map(a=>`

<p>

${a.message || a.action}

</p>

`)
.join("")


:

"<p>No recent activity</p>"

}


</div>



`;


}

window.loadDashboard =
async function(){

let user =
typeof currentUser==="function"
? currentUser()
: null;


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



if(
profile.verification?.verified
){

subtitle.innerHTML +=

"<br>✔ Verified Pharmora Member";

}


}

await loadDashboardInsights();

await loadContributorDashboard();

await loadSmartDashboard();

await loadManagementPanel();

};


loadDashboard();