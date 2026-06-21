/*
 Pharmora Global Header Component v2.1
*/


async function loadHeader(){


const root =
document.getElementById("site-header");


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


catch(e){


console.error(
"Header config failed",
e
);


site={
name:"Pharmora",
logo:""
};


nav=[];


}





/*
 NAV LINKS
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
 USER
*/


let user =
typeof currentUser==="function"
?
currentUser()
:
null;



let desktopAuth="";
let mobileAuth="";



if(user){



let badge="";



try{


if(window.PharmoraNotify){


let count =
(await PharmoraNotify.unread()).length;



if(count){


badge =
`
<span class="notification-dot">
${count}
</span>
`;


}


}


}catch(e){}





function authBlock(id){


return `


<a href="${appPath("dashboard/")}">
👤 ${user.name || "Profile"}
</a>



<a href="${appPath("settings/")}">
⚙ Settings
</a>




<div class="notification-wrapper">


<a
href="#"
class="notification-link"
onclick="
event.preventDefault();
PharmoraNotification.toggle('${id}');
">

🔔${badge}

</a>



<div
id="${id}"
class="notification-panel">

</div>


</div>




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



let login = `

<a href="${appPath("auth/login.html")}">

🔑 Login

</a>

`;



desktopAuth=login;

mobileAuth=login;



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
src="${appPath(site.logo)}">
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
await getRecords("notifications")
:
[];




data =
data.filter(x=>
x.active!==false
);





if(!data.length){


box.innerHTML =
"No current updates";


return;


}




box.innerHTML =
data
.map(x=>
`🔔 ${x.title || ""} : ${x.message || ""}`
)
.join(
" &nbsp; • &nbsp; "
);



}



catch(e){


box.innerHTML =
"No current updates";


}



}




loadHeader();