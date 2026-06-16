/*
 Pharmora Authentication Adapter
 Demo + Cloud Ready
*/





let authConfig=null;









async function loadAuthConfig(){



if(authConfig){

return authConfig;

}





try{



authConfig =
await fetch(

appPath(
"config/auth.json"
)

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











async function registerUser(data){






const config =
await loadAuthConfig();







if(config.provider==="demo"){



return demoRegister(
data
);



}








if(

config.provider==="supabase"

&&

typeof supabaseRegister==="function"

){



return supabaseRegister(
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



return demoLogin(

email,

password

);



}








if(

config.provider==="supabase"

&&

typeof supabaseLogin==="function"

){



return supabaseLogin(

email,

password

);



}








return null;



}












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













function logoutUser(){






localStorage.removeItem(

"currentUser"

);







if(

typeof clearPermissionCache==="function"

){



clearPermissionCache();



}








if(typeof showToast==="function"){



showToast(

"Logged out",

"info"

);



}








location.href =

appPath(

"auth/login.html"

);






}












async function updateProfile(updates){






let user =
currentUser();






if(!user){

return null;

}







user={



...user,



...updates,



updatedAt:

new Date()
.toISOString()



};









localStorage.setItem(

"currentUser",

JSON.stringify(user)

);








showToast?.(

"Profile updated",

"success"

);








return user;






}

/*
=========================
 REFRESH CURRENT SESSION
=========================
*/


function refreshCurrentUser(){



let user =
currentUser();



if(!user){

return null;

}




let users =
getDemoUsers();




let latest =
users.find(

x=>x.id===user.id

);



if(!latest){

return user;

}

if(

latest.disabled

){



logoutUser();



return null;



}




let session={

...latest

};



delete session.password;





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











/*

 DEMO AUTH ENGINE

*/










function getDemoUsers(){






try{





return JSON.parse(

localStorage.getItem(

"users"

)

||

"[]"

);





}




catch(error){



return [];



}



}












function saveDemoUsers(users){






localStorage.setItem(

"users",

JSON.stringify(

users

)

);






}












function cleanEmail(email){



return email

.trim()

.toLowerCase();



}













function demoRegister(data){








let users =
getDemoUsers();








let email =
cleanEmail(

data.email

);










let exists =
users.find(

u=>u.email===email

);









if(exists){






showToast?.(

"Account already exists",

"error"

);






return null;





}













let user={






id:

crypto.randomUUID(),






name:

data.name.trim(),






email:email,






password:

data.password,






role:

data.role || "member",







permissions:

data.permissions || [],








createdAt:

new Date()
.toISOString()






};










users.push(

user

);









saveDemoUsers(

users

);








if(
typeof createUserProfile==="function"
){

createUserProfile(user);

}








let session={

...user

};






delete session.password;









localStorage.setItem(

"currentUser",

JSON.stringify(session)

);










showToast?.(

"Account created successfully",

"success"

);










return session;






}














function demoLogin(
email,
password
){








let users =
getDemoUsers();








email =
cleanEmail(email);









let user =
users.find(

u=>

u.email===email

&&

u.password===password

);










if(!user){






showToast?.(

"Invalid login details",

"error"

);






return null;





}

if(

user.disabled

){



showToast?.(

"Account disabled. Contact administrator.",

"error"

);



return null;



}










let session={






...user,







lastLogin:

new Date()
.toISOString()







};










delete session.password;









localStorage.setItem(

"currentUser",

JSON.stringify(session)

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


function disableUser(
userId,
reason=""
){



let admin =
currentUser();



if(!admin){

return false;

}





let users =
getDemoUsers();




let user =
users.find(

x=>x.id===userId

);




if(!user){

return false;

}





// nobody disables owner

if(

user.role==="owner"

){


return false;


}






// admin cannot disable admin

if(

admin.role!=="owner"

&&

user.role==="admin"

){



return false;



}







user.disabled=true;



user.disabledReason =
reason;



user.disabledAt =

new Date()
.toISOString();




user.disabledBy =

admin.id;






saveDemoUsers(
users
);




return true;



}

/*
=========================
 OWNER USER ACTIONS
=========================
*/


function changeUserRole(
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
getDemoUsers();




let user =
users.find(

x=>x.id===userId

);



if(!user){

return false;

}





if(

user.role==="owner"

){


return false;


}





user.role =
role;



user.roleUpdatedAt =

new Date()
.toISOString();




user.roleUpdatedBy =

owner.id;





saveDemoUsers(
users
);




return true;



}