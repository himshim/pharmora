/*
 Pharmora Global Header Component
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

appPath(
"config/site.json"
)

)
.then(r=>r.json());





nav =
await fetch(

appPath(
"config/navigation.json"
)

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










let desktopLinks="";

let mobileLinks="";





nav.forEach(item=>{



const url =

appPath(

item.url.replace(
"/",
""
)

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









let authLinks="";


if(

typeof currentUser==="function"

&&

currentUser()

){


let user =
currentUser();


authLinks = `


<a href="${appPath("dashboard/")}">

👤 ${user.name || "Profile"}

</a>


<a href="#"

onclick="logoutUser()">

🚪 Logout

</a>


`;


}



else{


authLinks = `


<a href="${appPath("auth/login.html")}">

🔑 Login

</a>


`;


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


${authLinks}


</div>






</nav>










<div class="mobile-menu">


${mobileLinks}


${authLinks}


</div>










<div class="notice-bar">





<span>

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






/*

CMS DATABASE NOTIFICATIONS

*/


if(

typeof getRecords==="function"

){



data =
await getRecords(

"notifications"

);



}









/*

ONLY ACTIVE + NOT EXPIRED

*/


let today =
new Date();




data =

data.filter(item=>{





if(item.active===false){

return false;

}






if(item.expiry){



let expiryDate =
new Date(
item.expiry
);



if(expiryDate < today){

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









/*

SORT PRIORITY

*/


data.sort((a,b)=>{



let order={

Urgent:3,

High:2,

Normal:1

};



return (

order[b.priority] || 0

)

-

(

order[a.priority] || 0

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