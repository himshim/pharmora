/*
 Pharmora UI Engine v1
 Framework-free component renderer

Uses:
 /css/components/*
*/


(function(){


const UI={};



/* ======================
   UTILITIES
====================== */


function escapeHTML(value){


if(value===null || value===undefined){

return "";

}


return String(value)

.replaceAll("&","&amp;")
.replaceAll("<","&lt;")
.replaceAll(">","&gt;")
.replaceAll('"',"&quot;")
.replaceAll("'","&#039;");


}



UI.escape =
escapeHTML;




/* ======================
   BUTTON
====================== */


UI.button=function({

text="Button",

type="primary",

icon="",

action=""

}={}){


return `

<button
class="btn btn-${type}"
${action ? `onclick="${action}"` : ""}
>

${icon}

${escapeHTML(text)}

</button>

`;


};







/* ======================
   BADGE
====================== */


UI.badge=function(

text=""

){


return `

<span class="badge">

${escapeHTML(text)}

</span>

`;


};








/* ======================
   CARD
====================== */


UI.card=function({

title="",

body="",

badge="",

actions="",

className="",

html=false

}={}){


return `


<div class="card ${className}">


${

badge ?

UI.badge(badge)

:

""

}


<h3>

${escapeHTML(title)}

</h3>



<div>

${html ? body : escapeHTML(body)}

</div>



<div>

${actions}

</div>



</div>


`;


};










/* ======================
   ENTITY CARD
====================== */


UI.entityCard=function(entity){


if(!entity){

return "";

}



let status =

entity.status
||
entity.lifecycle?.status
||
"";




return UI.card({


title:

entity.title
||
entity.name
||
entity.displayName
||
"Untitled",



body:

entity.description
||
entity.bio
||
entity.headline
||
"",



badge:

entity.type
||
entity.collection
||
"",



actions:

`

${

status ?

UI.badge(status)

:

""

}


${

UI.button({

text:"View",

type:"primary"

})

}

`


});


};











/* ======================
   AVATAR
====================== */


UI.avatar=function({

name="",

url="",

size=""

}={}){


let initials =
name
.split(" ")
.map(x=>x[0])
.join("")
.substring(0,2)
.toUpperCase();



return `

<div class="avatar ${size}">


${
url ?

`<img src="${url}">`

:

initials

}


</div>

`;


};









/* ======================
   TABLE
====================== */


UI.table=function(

items=[]

){


if(!items.length){

return `

<div class="empty-state">

No data

</div>

`;

}



let keys =
Object.keys(
items[0]
)
.slice(0,5);



return `

<div class="table-wrapper">

<table class="table">


<thead>

<tr>

${

keys.map(
k=>`<th>${k}</th>`
)
.join("")

}

</tr>

</thead>


<tbody>


${

items.map(row=>`

<tr>

${

keys.map(k=>`

<td>

${escapeHTML(row[k])}

</td>

`)
.join("")

}

</tr>

`)
.join("")

}


</tbody>


</table>

</div>

`;

};









/* ======================
   LOADING
====================== */


UI.loading=function(){


return `

<div class="spinner"></div>

`;


};





/* ======================
   EMPTY STATE
====================== */


UI.empty=function(

message="Nothing here"

){


return `

<div class="empty-state">

${escapeHTML(message)}

</div>

`;


};





/* ======================
   RENDER ENGINE
====================== */


UI.render=function(
target,
content
){


let element =
typeof target==="string"
?
document.querySelector(target)
:
target;



if(!element){

console.warn(
"Render target missing",
target
);

return false;

}



element.innerHTML =
content || "";


return true;


};







UI.append=function(
target,
content
){


let element =
typeof target==="string"
?
document.querySelector(target)
:
target;



if(!element){

return false;

}



element.insertAdjacentHTML(
"beforeend",
content
);


return true;


};









UI.clear=function(
target
){


let element =
typeof target==="string"
?
document.querySelector(target)
:
target;


if(element){

element.innerHTML="";

}


};









UI.list=function(
items=[],
renderer
){



if(
!items ||
!items.length
){


return UI.empty(
"No items found"
);


}



return items

.map(renderer)

.join("");



};

/* ======================
   STATE ENGINE
====================== */


UI.state={};



UI.state.loading=function(
message="Loading..."
){


return `

<div class="card">

${UI.loading()}

<p>${UI.escape(message)}</p>

</div>

`;

};





UI.state.error=function(
message="Something went wrong"
){


return `

<div class="card">

<h3>⚠ Error</h3>

<p>${UI.escape(message)}</p>

</div>

`;

};





UI.state.success=function(
message="Done"
){


return `

<div class="card">

<h3>✅ Success</h3>

<p>${UI.escape(message)}</p>

</div>

`;

};





UI.safeRender=async function(
target,
loader
){



try{


UI.render(
target,
UI.state.loading()
);



let html =
await loader();



UI.render(
target,
html
);



}

catch(error){


console.error(error);


UI.render(
target,

UI.state.error(
error.message
)

);


}



};

/* ======================
   PANEL COMPONENT
====================== */


UI.panel=function({
left="",
right=""
}={}){


return `

<div class="panel">

<div>

${left}

</div>


<span>

${right}

</span>

</div>

`;


};

/*
=========================
 SKELETON LOADER
=========================
*/


UI.skeleton=function(
count=3
){


return Array(count)

.fill(0)

.map(()=>`

<div class="card skeleton-card">

<div class="skeleton-line big"></div>

<div class="skeleton-line"></div>

<div class="skeleton-line small"></div>

</div>

`)

.join("");


};





UI.loading=function(
target,
count=3
){


let box =
typeof target==="string"

?

document.getElementById(target)

:

target;



if(box){

box.innerHTML =
UI.skeleton(count);

}


};

/*
=========================
 MODAL ENGINE
=========================
*/


UI.modal=function({

title="",

body="",

actions=""

}={}){



let old =
document.getElementById(
"pharmora-modal"
);



if(old){

old.remove();

}




let modal =
document.createElement(
"div"
);



modal.id =
"pharmora-modal";



modal.className =
"modal-overlay";



modal.innerHTML = `

<div class="modal">

<h2>

${escapeHTML(title)}

</h2>


<div class="modal-body">

${body}

</div>


<div class="modal-footer">

${actions}

${

UI.button({

text:"Cancel",

action:"PharmoraUI.closeModal()"

})

}

</div>


</div>

`;



document.body.appendChild(
modal
);



};





UI.closeModal=function(){


document
.getElementById(
"pharmora-modal"
)
?.remove();


};





UI.confirm=function({

title="Confirm",

message="",

onConfirm=""

}={}){


UI.modal({

title,

body:

`

<p>

${escapeHTML(message)}

</p>

`,


actions:

UI.button({

text:"Confirm",

type:"primary",

action:

onConfirm

+

";PharmoraUI.closeModal()"

})



});


};

window.PharmoraUI=UI;



console.log(
"✓ PharmoraUI ready"
);



})();