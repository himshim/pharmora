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