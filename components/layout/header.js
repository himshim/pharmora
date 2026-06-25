/*
 Pharmora Global Header Component v3
 Responsive Ecosystem Shell
*/


async function loadHeader(){


const root =
document.getElementById(
"site-header"
);


if(!root){
return;
}



let site={};
let nav=[];



try{


site =
await fetch(
appPath("config/site.json")
)
.then(r=>r.json());



nav =
await fetch(
appPath("config/navigation.json")
)
.then(r=>r.json());


}


catch(error){


console.error(
"Header config failed",
error
);


site={

name:"Pharmora",

logo:"",

tagline:"Open Pharmacy Knowledge Ecosystem"

};


nav=[];


}





/*
 NAVIGATION
*/


let desktopLinks="";
let mobileLinks="";



nav.forEach(item=>{


let url =
appPath(
item.url.replace(/^\/+/,"")
);



desktopLinks += `

<a href="${url}">
${item.title}
</a>

`;



mobileLinks += `

<a href="${url}">
${item.icon || ""}
${item.title}
</a>

`;


});







/*
 USER STATE
*/


let user =
typeof currentUser==="function"
?
currentUser()
:
null;



let profile=null;



if(
user &&
window.PharmoraProfile
){


try{


profile =
await PharmoraProfile.getProfile(
user.id
);


}

catch(e){}


}





let desktopAuth="";
let mobileAuth="";




if(user){



let unread="";



try{


if(window.PharmoraNotify){


let count =
(await PharmoraNotify.unread()).length;


if(count){


unread = `

<span class="notification-dot">

${count}

</span>

`;


}


}


}catch(e){}







function authBlock(id){



let name =

profile?.displayName

||

user.name

||

"Profile";



let initial =
name.charAt(0).toUpperCase();




return `




<a
href="${appPath("dashboard/")}"
class="user-chip"
>


<div class="avatar avatar-sm">

${initial}

</div>


<span>

${name}

</span>


</a>





<div class="notification-wrapper">


<a
href="#"
class="notification-link"
onclick="
event.preventDefault();
PharmoraNotification.toggle('${id}');
">

🔔

${unread}

</a>



<div
id="${id}"
class="notification-panel">

</div>



</div>





<a href="${appPath("settings/")}">

⚙ Settings

</a>





<a
href="#"
onclick="
event.preventDefault();
logoutUser();
">

🚪 Logout

</a>



`;



}




desktopAuth =
authBlock(
"notification-panel-desktop"
);



mobileAuth =
authBlock(
"notification-panel-mobile"
);



}






else{



let login=`


<a
href="${appPath("auth/login.html")}"
class="btn btn-primary btn-small"
>

🔑 Login

</a>


`;



desktopAuth=login;

mobileAuth=login;



}









root.innerHTML = `


<header>



<div class="container">



<nav class="navbar">





<a
href="${appPath("")}"
class="logo"
>


${

site.logo

?

`

<img
class="site-logo"
src="${appPath(site.logo)}"
alt="${site.name}">

`

:

"⚕"

}



<span>

${site.name}

</span>



</a>






<div
class="menu-toggle"
onclick="toggleMenu()"
>

☰

</div>






<div class="nav-links">


${desktopLinks}


${desktopAuth}


</div>





</nav>







<div class="mobile-menu">


${mobileLinks}


${mobileAuth}


</div>









<div class="notice-bar">


<span class="notice-title">

🔔 Updates

</span>



<div class="notice-track">


<span id="notice-text">

Loading updates...

</span>


</div>


</div>





</div>


</header>


`;







loadNoticeTicker();





setTimeout(()=>{


if(window.PharmoraNotification){


PharmoraNotification.refresh();


}


},300);



}









async function loadNoticeTicker(){



let box =
document.getElementById(
"notice-text"
);



if(!box){

return;

}




try{



let data =

typeof getRecords==="function"

?

await getRecords(
"notifications"
)

:

[];





data =
data.filter(

x=>x.active!==false

);





if(!data.length){


box.innerHTML =
"Welcome to Pharmora Knowledge Ecosystem";


return;


}





box.innerHTML =

data

.map(

x=>

`🔔 ${x.title || ""} : ${x.message || ""}`

)

.join(

" &nbsp; • &nbsp; "

);



}



catch(e){



box.innerHTML =
"Open Pharmacy Knowledge Ecosystem";



}



}








loadHeader();




window.addEventListener(

"profile-updated",

loadHeader

);