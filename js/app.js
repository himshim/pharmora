/*
 Pharmora App Core
 Open Pharmacy Learning Network
*/





/* =========================
   GLOBAL PATH SYSTEM
========================= */


function getBasePath(){



let path =
location.pathname;





if(

path.endsWith("/")

&&

path !== "/"

){


return "../";


}






let depth =
path

.split("/")

.filter(Boolean)

.length;





if(depth>1){


return "../";


}




return "./";



}










function appPath(path=""){



return (

getBasePath()

+

path.replace(/^\/+/,"")

);



}









/* =========================
   THEME SYSTEM
========================= */


function loadTheme(){



let saved =
localStorage.getItem(

"pharmora-theme"

);





if(saved){



document

.documentElement

.setAttribute(

"data-theme",

saved

);



}



}









function toggleTheme(){



let current =

document

.documentElement

.getAttribute(

"data-theme"

);






let next =

current==="light"

?

"dark"

:

"light";







document

.documentElement

.setAttribute(

"data-theme",

next

);






localStorage.setItem(

"pharmora-theme",

next

);



}









/* =========================
   MOBILE MENU
========================= */


function toggleMenu(){



let menu =

document.querySelector(

".mobile-menu"

);





if(menu){


menu.classList.toggle(

"active"

);


}



}









/* =========================
   TOAST SYSTEM
========================= */


function showToast(

message,

type="info"

){





let container =

document.getElementById(

"toast-container"

);






if(!container){



container =

document.createElement(

"div"

);



container.id =

"toast-container";




document.body.appendChild(

container

);



}









let toast =

document.createElement(

"div"

);




toast.className =

"toast toast-" + type;




toast.textContent =

message;







container.appendChild(

toast

);






requestAnimationFrame(()=>{


toast.classList.add(

"show"

);


});








setTimeout(()=>{



toast.classList.remove(

"show"

);




setTimeout(()=>{


toast.remove();


},300);




},3000);



}











/* =========================
   CONFIRM MODAL
========================= */


function showConfirm(

message

){





return new Promise(resolve=>{






let overlay =

document.createElement(

"div"

);






overlay.className =

"confirm-overlay";







overlay.innerHTML = `


<div class="confirm-box">


<h3>

${message}

</h3>


<br>


<button

class="btn btn-primary"

id="confirm-yes">


Yes


</button>




<button

class="btn"

id="confirm-no">


Cancel


</button>


</div>


`;









document.body.appendChild(

overlay

);









let finish = value=>{



overlay.remove();



resolve(value);



};








document

.getElementById(

"confirm-yes"

)

.onclick = ()=>finish(true);








document

.getElementById(

"confirm-no"

)

.onclick = ()=>finish(false);





});



}












/* =========================
   APP INIT
========================= */


document.addEventListener(

"DOMContentLoaded",

()=>{



loadTheme();



console.log(

"⚕ Pharmora Ready"

);



}

);









/* =========================

 PWA SERVICE WORKER

========================= */



if("serviceWorker" in navigator){



window.addEventListener(

"load",

()=>{



navigator.serviceWorker

.register(

appPath("sw.js"),

{

scope:appPath("")

}

)

.then(reg=>{



console.log(

"PWA Ready",

reg.scope

);



})



.catch(error=>{



console.log(

"PWA Disabled",

error

);



});



}



);



}