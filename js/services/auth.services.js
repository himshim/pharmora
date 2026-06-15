/*
 Authentication Adapter Service
*/


let authConfig=null;






async function loadAuthConfig(){


if(authConfig){

return authConfig;

}



authConfig =
await fetch(
"/config/auth.json"
)
.then(r=>r.json());



return authConfig;


}









async function registerUser(
data
){



const config =
await loadAuthConfig();





console.log(

"Auth provider:",

config.provider

);







if(
config.provider==="demo"
){


return demoRegister(
data
);


}




/*

Future:

if(config.provider==="supabase"){


return supabase.auth.signUp()


}


*/


}









async function loginUser(
email,
password
){



const config =
await loadAuthConfig();





console.log(

"Auth provider:",

config.provider

);






if(
config.provider==="demo"
){


return demoLogin(
email,
password
);


}



}










function demoRegister(
data
){



let user={



id:

crypto.randomUUID(),



name:data.name,



email:data.email,



role:data.role,



createdAt:

new Date()
.toISOString()



};






localStorage.setItem(

"currentUser",

JSON.stringify(user)

);







console.log(

"Registered:",

user

);





return user;


}









function demoLogin(
email,
password
){



let user={



id:"demo-user",


name:"Demo User",


email:email,


role:"student"


};






localStorage.setItem(

"currentUser",

JSON.stringify(user)

);







console.log(

"Logged in:",

user

);




return user;


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



}