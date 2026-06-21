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

x=>x.author?.id===user.id

)

);



}

catch(e){}



}







let approved =

uploads.filter(

x=>x.status==="approved"

)
.length;





let pending =

uploads.filter(

x=>x.status==="pending"

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

onclick="location.href='../profile.html?id='+currentUser().id">


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

user.role==="owner"

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
(user.name || user.email);

}


if(welcome){

welcome.innerHTML =
"Welcome back, "+
(user.name || "User")+
" 👋";

}


await loadContributorDashboard();

await loadSmartDashboard();

await loadManagementPanel();

};


loadDashboard();