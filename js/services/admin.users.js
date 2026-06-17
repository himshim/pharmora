async function renderUserManager(){



let box =
document.getElementById(
"admin-actions"
);



document.getElementById(
"section-title"
).innerHTML =
"👥 User Management";





box.innerHTML = `


<div class="card">


<h2>

Find User

</h2>


<input

id="searchUserId"

placeholder="Search ID, name or email">


<br><br>


<button

class="btn btn-primary"

onclick="adminFindUser()">


Search


</button>


<div id="found-user"></div>


</div>


`;



}









async function adminFindUser(){



let query =

searchUserId.value

.trim()

.toLowerCase();




let users =
getDemoUsers();





let user =
users.find(

x=>

x.id===query

||

x.email?.toLowerCase()===query

||

x.name?.toLowerCase()

.includes(query)

);




let box =
document.getElementById(
"found-user"
);




if(!user){


box.innerHTML =
"<p>User not found</p>";


return;


}





box.innerHTML = `


<br>


<div class="card">


<h2>

👤 ${user.name}

</h2>



<p>

<b>ID:</b>

<br>

${user.id}

</p>



<p>

<b>Email:</b>

<br>

${user.email}

</p>



<p>

<b>Role:</b>

${user.role}

</p>



<p>

<b>Status:</b>

${

user.disabled

?

"🚫 Disabled"

:

"✅ Active"

}

</p>



<p>

<b>Joined:</b>

${

user.createdAt

?

new Date(user.createdAt)

.toLocaleDateString()

:

"Unknown"

}

</p>



<button

class="btn"

onclick="navigator.clipboard.writeText('${user.id}')">

📋 Copy ID

</button>




<button

class="btn"

onclick="location.href='../profile.html?id=${user.id}'">

👤 View Profile

</button>


<br><br>



<button

class="btn"

onclick="adminVerifyUser('${user.id}','educator')">


✔ Verify Educator


</button>



<button

class="btn"

onclick="adminVerifyUser('${user.id}','professional')">


✔ Verify Professional


</button>



<br><br>


<button

class="btn"

onclick="adminDisableUser('${user.id}')">


🚫 Ban User


</button>

<button

class="btn"

onclick="adminRestoreUser('${user.id}')">


🔓 Restore User


</button>

${

currentUser().role==="owner"

?

`

<br><br>


<button

class="btn"

onclick="ownerChangeRole('${user.id}','admin')">

👑 Make Admin

</button>



<button

class="btn"

onclick="ownerChangeRole('${user.id}','member')">

⬇ Remove Admin

</button>

`

:

""

}


</div>

`;



}





async function adminVerifyUser(
id,
type
){



await verifyUser(

id,

[
type
],

"manual"

);

if(

typeof saveAudit==="function"

){



saveAudit(

"user.verify",

{

target:id,

type:type

}

);



}

if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Verification approved ✔",


message:

"Your "

+

type

+

" status has been verified.",


type:"success"

}

);



}

alert(

"User verified as "

+

type

);



adminFindUser();



}

async function ownerChangeRole(
id,
role
){



if(

changeUserRole(
id,
role
)

){

if(

typeof saveAudit==="function"

){



saveAudit(

"user.role.change",

{

target:id,

role:role

}

);



}

if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Account role updated 👑",


message:

"Your account role changed to "

+

role,


type:"info"

}

);



}

alert(

"Role changed to "

+

role

);



adminFindUser();



}


else{


alert(

"Only owner can do this"

);


}



}

async function adminDisableUser(id){



let reason =
prompt(
"Reason for ban?"
);



if(

disableUser(
id,
reason || ""
)

){

if(

typeof saveAudit==="function"

){



saveAudit(

"user.ban",

{

target:id,

reason:reason

}

);



}

if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Account disabled 🚫",


message:

reason ||

"Your account was disabled by administration.",


type:"warning"

}

);



}

alert(
"User banned"
);


adminFindUser();


}


else{


alert(

"Cannot disable this user"

);


}



}

async function adminRestoreUser(id){



if(

restoreUser(id)

){





if(

typeof saveAudit==="function"

){


saveAudit(

"user.restore",

{

target:id

}

);


}






if(

typeof notifyUser==="function"

){



await notifyUser(

id,

{

title:"Account restored 🔓",

message:

"Your account access has been restored.",


type:"success"

}

);



}







alert(

"User restored"

);



adminFindUser();



}



else{



alert(

"Cannot restore this user"

);



}



}