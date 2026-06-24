async function renderUserManager(){


let box =
document.getElementById(
"admin-actions"
);


document.getElementById(
"section-title"
)
.innerHTML =
"👥 User Management";



box.innerHTML =

PharmoraUI.card({

title:"Find User",

html:true,

body:

`

<input

id="searchUserId"

placeholder="Search ID, name or email"

>


<br><br>


<div id="found-user"></div>

`,


actions:

PharmoraUI.button({

text:"Search",

action:"adminFindUser()"

})


});


}








async function adminFindUser(){



let query =

searchUserId.value

.trim()

.toLowerCase();




let users=[];


try{


if(
typeof getRecords==="function"
){


users =
await getRecords(
"users"
);


}


else{


users =
await getDemoUsers();


}


}
catch(e){


users=[];


}


if(
!Array.isArray(users)
){


users =
users.data

||

users.records

||

[];


}





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





box.innerHTML =

PharmoraUI.card({


title:

"👤 " + user.name,


html:true,


body:

`

${

PharmoraUI.panel({

left:"<b>ID</b><br>"+user.id

})

}


${

PharmoraUI.panel({

left:"<b>Email</b><br>"+user.email

})

}


${

PharmoraUI.panel({

left:"<b>Role</b>",

right:user.role

})

}


${

PharmoraUI.panel({

left:"<b>Status</b>",

right:

user.disabled

?

"🚫 Disabled"

:

"✅ Active"

})

}


${

PharmoraUI.panel({

left:"<b>Joined</b>",

right:

user.createdAt

?

new Date(user.createdAt)
.toLocaleDateString()

:

"Unknown"

})

}

`,


actions:


PharmoraUI.button({

text:"📋 Copy ID",

action:

`navigator.clipboard.writeText('${user.id}')`

})


+


PharmoraUI.button({

text:"👤 View Profile",

action:

`location.href='../profile.html?id=${user.id}'`

})


+


PharmoraUI.button({

text:"✔ Verify Educator",

action:

`adminVerifyUser('${user.id}','educator')`

})


+


PharmoraUI.button({

text:"✔ Verify Professional",

action:

`adminVerifyUser('${user.id}','professional')`

})


+


PharmoraUI.button({

text:"🚫 Ban User",

action:

`adminDisableUser('${user.id}')`

})


+


PharmoraUI.button({

text:"🔓 Restore User",

action:

`adminRestoreUser('${user.id}')`

})


+

(

currentUser().role==="owner"

?

PharmoraUI.button({

text:"👑 Make Admin",

action:

`ownerChangeRole('${user.id}','admin')`

})


+

PharmoraUI.button({

text:"⬇ Remove Admin",

action:

`ownerChangeRole('${user.id}','member')`

})

:

""

)


});



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