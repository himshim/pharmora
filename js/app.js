/*
 Pharmora App Core
 Open Pharmacy Learning Network
*/

console.log("⚕ Pharmora Initialized");

/* =========================

 GLOBAL PATH SYSTEM

========================= */

function getBasePath() {
  let path = location.pathname;

  /*
Folder pages:
learn/
admin/
dashboard/
etc.
*/

  if (path.endsWith("/") && path !== "/") {
    return "../";
  }

  /*
Files inside folders:
auth/login.html
library/view.html
*/

  let depth = path.split("/").filter(Boolean).length;

  if (depth > 1) {
    return "../";
  }

  return "./";
}

function appPath(path) {
  return getBasePath() + path.replace(/^\/+/, "");
}

/* =========================

 THEME SYSTEM

========================= */

function loadTheme() {
  const savedTheme = localStorage.getItem("pharmora-theme");

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");

  const next = current === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", next);

  localStorage.setItem("pharmora-theme", next);
}

/* =========================

 MOBILE MENU

========================= */

function toggleMenu() {
  const menu = document.querySelector(".mobile-menu");

  if (menu) {
    menu.classList.toggle("active");
  }
}

/* =========================

 PHARMORA TOAST SYSTEM

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





toast.innerText =
message;






container.appendChild(
toast
);






setTimeout(()=>{


toast.classList.add(
"show"
);


},50);








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

 APP INIT

========================= */

document.addEventListener(
  "DOMContentLoaded",

  () => {
    loadTheme();

    console.log("Interface Ready");
  },
);

/* =========================

 PWA

========================= */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(appPath("sw.js")).catch(() => {});
}

