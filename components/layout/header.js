/*
 Pharmora Global Header Component v2
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
tagline:"Open Pharmacy Learning Network"
};

nav=[];

}



/*
 NAVIGATION
*/

let desktopLinks="";
let mobileLinks="";


nav.forEach(item=>{


const url =
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
 AUTH AREA
*/

let desktopAuth="";
let mobileAuth="";


let user =
typeof currentUser==="function"
?
currentUser()
:
null;



if(user){


let badge="";


if(
window.PharmoraNotify
){

try{

let count =
(
await PharmoraNotify.unread()
)
.length;


if(count){

badge =
`
<span class="notification-dot">
${count}
</span>
`;

}

}catch(e){}

}



let authHTML = `


<a href="${appPath("dashboard/")}">

👤 ${user.name || "Profile"}

</a>



<a href="${appPath("settings/")}">

⚙ Settings

</a>



<a 
href="${appPath("components/notification/")}"
class="notification-link">

🔔${badge}

</a>



<a
href="javascript:void(0)"
onclick="logoutUser()">

🚪 Logout

</a>


`;


desktopAuth = authHTML;

mobileAuth = authHTML;


}



else{


let authHTML = `

<a href="${appPath("auth/login.html")}">

🔑 Login

</a>

`;


desktopAuth = authHTML;

mobileAuth = authHTML;


}






root.innerHTML = `


<header class="container">


<nav class="navbar">


<a
href="${appPath("")}"
class="logo">


${
site.logo
?
`
<img
class="site-logo"
src="${appPath(site.logo)}"
alt="${site.name} logo"
>
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
onclick="toggleMenu()">

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

🔔 Latest Updates

</span>


<div class="notice-track">

<span id="notice-text">

Loading updates...

</span>

</div>


</div>



</header>


`;



loadNoticeTicker();


}









async function loadNoticeTicker(){


const notice =
document.getElementById(
"notice-text"
);


if(!notice){

return;

}


try{


let data=[];


if(
typeof getRecords==="function"
){

data =
await getRecords(
"notifications"
);

}



let today =
new Date();



data =
data.filter(item=>{


if(item.active===false){

return false;

}


if(item.expiry){


let expiry =
new Date(item.expiry);


if(expiry < today){

return false;

}


}


return true;


});



if(data.length===0){

notice.innerHTML =
"No current updates";

return;

}




data.sort((a,b)=>{


let priority={

Urgent:3,

High:2,

Normal:1

};


return(
priority[b.priority] || 0
)
-
(
priority[a.priority] || 0
);


});





notice.innerHTML =
data.map(item=>{


let icon={

Urgent:"🚨",

High:"⚠️",

Normal:"🔔"

}[item.priority]
||
"🔔";



let text =
`${icon} ${item.title} : ${item.message}`;



if(item.link){


return `

<a href="${item.link}">
${text}
</a>

`;

}



return text;


})
.join(
" &nbsp;&nbsp; • &nbsp;&nbsp; "
);



}


catch(error){


console.error(
"Notification loading failed",
error
);


notice.innerHTML =
"No current updates";


}


}





loadHeader();