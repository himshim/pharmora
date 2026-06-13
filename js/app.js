/*
 Pharmora App Script
 Open Pharmacy Learning Network
*/


console.log(
    "⚕ Pharmora Initialized"
);



/* =========================

   THEME SYSTEM

========================= */


const savedTheme =

    localStorage.getItem(
        "pharmora-theme"
    );



if(savedTheme){

    document.documentElement
    .setAttribute(
        "data-theme",
        savedTheme
    );

}



/* Toggle theme function
   (button will be added later)
*/


function toggleTheme(){


    const current =

    document.documentElement
    .getAttribute(
        "data-theme"
    );



    const next =

    current === "light"
    ? "dark"
    : "light";



    document.documentElement
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

   SEARCH PLACEHOLDER

========================= */


function pharmoraSearch(query){


    console.log(

        "Searching Pharmora:",

        query

    );


}






/* =========================

   UI READY

========================= */


document.addEventListener(

    "DOMContentLoaded",

    ()=>{


        console.log(

        "Interface Ready"

        );


    }

);

/* =========================

 MOBILE NAVIGATION

========================= */


function toggleMenu(){


const menu =

document.querySelector(
".mobile-menu"
);



if(menu){


menu.classList.toggle(
"active"
);


}


}