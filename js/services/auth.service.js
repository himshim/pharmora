/*
 Pharmora Authentication Adapter
 Demo + Cloud Ready
*/



let authConfig=null;







async function loadAuthConfig(){



if(authConfig){

return authConfig;

}



authConfig =
await fetch(

appPath(
"config/auth.json"
)

)
.then(r=>r.json());



return authConfig;



}









async function registerUser(
data
){



const config =
await loadAuthConfig();







if(
config.provider==="demo"
){


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



}









async function loginUser(
email,
password
){



const config =
await loadAuthConfig();








if(
config.provider==="demo"
){



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




}









function currentUser(){



return JSON.parse(

localStorage.getItem(

"currentUser"

)

);



}










function logoutUser(){



localStorage.removeItem(

"currentUser"

);



location.href =

appPath(
"auth/login.html"
);



}









async function updateProfile(
updates
){



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





return user;



}









/*

DEMO AUTH ENGINE

*/








function getDemoUsers(){



return JSON.parse(

localStorage.getItem(

"users"

)

||

"[]"

);



}









function saveDemoUsers(
users
){



localStorage.setItem(

"users",

JSON.stringify(users)

);



}










function demoRegister(
data
){



let users =
getDemoUsers();







let exists =
users.find(

u=>u.email===data.email

);







if(exists){


showToast(

"Account already exists",

"error"

);


return null;


}









let user={



id:

crypto.randomUUID(),



name:

data.name,



email:

data.email,



password:

data.password,



role:

data.role || "student",




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








let session={

...user

};



delete session.password;








localStorage.setItem(

"currentUser",

JSON.stringify(session)

);







return session;



}









function demoLogin(
email,
password
){



let users =
getDemoUsers();







let user =
users.find(

u=>

u.email===email

&&

u.password===password

);








if(!user){



showToast(

"Invalid login details",

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








return session;



}