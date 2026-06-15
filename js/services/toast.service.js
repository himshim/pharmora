/*
 Pharmora Toast Notification Service
*/



function showToast(
message,
type="info"
){



let old =
document.getElementById(
"toast-container"
);



if(!old){



old =
document.createElement(
"div"
);



old.id =
"toast-container";



document.body.appendChild(
old
);



}






let toast =
document.createElement(
"div"
);



toast.className =

"toast toast-" + type;





toast.innerHTML =
message;





old.appendChild(
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