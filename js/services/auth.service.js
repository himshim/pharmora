/*
 Pharmora Authentication Adapter v2
 Database Entity Powered
 Demo + Supabase Ready
*/


let authConfig=null;


/*
=========================
 CONFIG
=========================
*/


async function loadAuthConfig(){


if(authConfig){

return authConfig;

}


try{


authConfig =
await fetch(
"/config/auth.json"
)
.then(r=>r.json());


}


catch(error){


authConfig={

provider:"demo"

};


}


return authConfig;


}






/*
=========================
 AUTH ENTRY POINTS
=========================
*/


async function registerUser(data){


const config =
await loadAuthConfig();



if(config.provider==="demo"){


return await demoRegister(
data
);


}



if(

config.provider==="supabase"

&&

typeof supabaseRegister==="function"

){


return await supabaseRegister(
data
);


}



return null;


}









async function loginUser(
email,
password
){



const config =
await loadAuthConfig();



if(config.provider==="demo"){


return await demoLogin(
email,
password
);


}




if(

config.provider==="supabase"

&&

typeof supabaseLogin==="function"

){


return await supabaseLogin(
email,
password
);


}



return null;


}







/*
=========================
 SESSION
=========================
*/



function currentUser(){


try{


return JSON.parse(

localStorage.getItem(
"currentUser"
)

);


}


catch(error){


return null;


}


}







function setSession(user){


let session={


id:user.id,


name:
user.data?.name ||
user.name ||
user.title,


email:
user.data?.email ||
user.email,


role:
user.data?.role ||
user.role ||
"member"


};



localStorage.setItem(

"currentUser",

JSON.stringify(session)

);



if(
typeof clearPermissionCache==="function"
){

clearPermissionCache();

}



return session;


}








function logoutUser(){



localStorage.removeItem(
"currentUser"
);



if(
typeof clearPermissionCache==="function"
){

clearPermissionCache();

}



showToast?.(
"Logged out",
"info"
);



location.href =
"/auth/login.html";


}









/*
=========================
 PROFILE UPDATE
=========================
*/


async function updateProfile(updates){


let user =
currentUser();



if(!user){

return null;

}



await updateRecord(
user.id,
updates
);



let updated={

...user,

...updates

};



localStorage.setItem(

"currentUser",

JSON.stringify(updated)

);



showToast?.(
"Profile updated",
"success"
);



return updated;


}










/*
=========================
 REFRESH SESSION
=========================
*/


async function refreshCurrentUser(){


let session =
currentUser();



if(!session){

return null;

}



let users =
await getDemoUsers();



let latest =
users.find(

u=>u.id===session.id

);



if(!latest){

return session;

}



if(

latest.data?.disabled ||
latest.disabled

){


logoutUser();


return null;


}



return setSession(
latest
);


}









/*
=========================
 DATABASE USER STORAGE
=========================
*/


async function getDemoUsers(){
  let list = await getRecords("users");
  if (!list || list.length === 0) {
    if (typeof window.createTestAccounts === 'function') {
      await window.createTestAccounts();
      list = await getRecords("users");
    }
  }
  return list;
}








async function saveDemoUsers(){



console.warn(
"saveDemoUsers deprecated - Database v2 active"
);



return true;


}








function cleanEmail(email){


return email
.trim()
.toLowerCase();


}











/*
=========================
 REGISTER
=========================
*/



async function demoRegister(data){



let users =
await getDemoUsers();



let email =
cleanEmail(
data.email
);



let exists =
users.find(

u=>

(
u.data?.email ||
u.email
)

===email

);



if(exists){



showToast?.(
"Account already exists",
"error"
);



return null;


}





let user =
await createRecord(

"users",

{


name:
data.name.trim(),


email,


password:
data.password,


role:
data.role || "member",


permissions:
data.permissions || []


}

);






if(
typeof createUserProfile==="function"
){


await createUserProfile(
user
);


}







let session =
setSession(
user
);




showToast?.(
"Account created successfully",
"success"
);



return session;


}










/*
=========================
 LOGIN
=========================
*/


async function demoLogin(
email,
password
){



let users =
await getDemoUsers();



email =
cleanEmail(email);




let user =
users.find(

u=>

(

u.data?.email ||
u.email

)

===email


&&


(

u.data?.password ||
u.password

)

===password


);





if(!user){


showToast?.(
"Invalid login details",
"error"
);


return null;


}





if(

user.data?.disabled ||
user.disabled

){


showToast?.(
"Account disabled. Contact administrator.",
"error"
);



return null;


}






await updateRecord(

user.id,

{

lastLogin:

new Date()
.toISOString()

}

);




let session =
setSession(
user
);





showToast?.(
"Login successful",
"success"
);




return session;


}









/*
=========================
 ADMIN USER ACTIONS
=========================
*/


async function disableUser(
userId,
reason=""
){



let admin =
currentUser();



if(!admin){

return false;

}




let users =
await getDemoUsers();




let user =
users.find(
x=>x.id===userId
);




if(!user){

return false;

}




let role =
user.data?.role ||
user.role;




if(role==="owner"){

return false;

}




if(

admin.role!=="owner"

&&

role==="admin"

){

return false;

}







await updateRecord(

user.id,

{

data:{

...user.data,

disabled:true,

disabledReason:reason

},


disabledAt:

new Date()
.toISOString(),


disabledBy:

admin.id


}

);




return true;


}










async function restoreUser(
userId
){



let admin =
currentUser();



if(!admin){

return false;

}



let users =
await getDemoUsers();



let user =
users.find(
x=>x.id===userId
);




if(!user){

return false;

}



let role =
user.data?.role ||
user.role;



if(role==="owner"){

return false;

}



await updateRecord(

user.id,

{

data:{

...user.data,

disabled:false,

disabledReason:null

},


restoredAt:

new Date()
.toISOString(),


restoredBy:

admin.id


}

);



return true;


}











async function changeUserRole(
userId,
role
){



let owner =
currentUser();



if(

!owner ||

owner.role!=="owner"

){

return false;

}




let users =
await getDemoUsers();



let user =
users.find(
x=>x.id===userId
);



if(!user){

return false;

}



let oldRole =
user.data?.role ||
user.role;




if(oldRole==="owner"){

return false;

}




await updateRecord(

user.id,

{

data:{

...user.data,

role:role

},


roleUpdatedAt:

new Date()
.toISOString(),


roleUpdatedBy:

owner.id


}

);



return true;
}

// ── Test Accounts Seeding Helper ─────────────────────
window.createTestAccounts = async function() {
  const accounts = [
    { name: "Owner User", email: "owner@example.com", password: "owner123", role: "owner" },
    { name: "Maintainer User", email: "maintainer@example.com", password: "maint123", role: "maintainer" },
    { name: "Admin User", email: "admin@example.com", password: "admin123", role: "admin" },
    { name: "Contributor User", email: "contributor@example.com", password: "contrib123", role: "contributor" },
    { name: "Member User", email: "member@example.com", password: "member123", role: "member" },
    { name: "Student User", email: "student@example.com", password: "student123", role: "student" }
  ];

  async function ensureAccount(acc) {
    if (typeof window.getRecords !== 'function') return;
    const records = await window.getRecords("users").catch(() => []);
    const existing = records.find(u => u.email === acc.email || u.data?.email === acc.email);
    if (!existing) {
      await window.createRecord("users", {
        name: acc.name,
        email: acc.email,
        password: acc.password,
        role: acc.role,
        permissions: []
      });
    }
  }

  for (const acc of accounts) {
    await ensureAccount(acc);
  }
  console.log("✅ Test accounts ensured in local storage.");
};