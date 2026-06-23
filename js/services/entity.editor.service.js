/*
 Pharmora Entity Editor Service v1
 Universal editing layer
*/


async function loadEditableEntity(
collection,
id
){


let entity =
await getEntity(
collection,
id
);


if(!entity){

return null;

}


if(
typeof normalizeEntity==="function"
){

entity =
normalizeEntity(entity);

}


return entity;


}





async function canEditEntity(entity){


if(!entity){

return false;

}


if(
typeof canEntityAction==="function"
){

return await canEntityAction(
entity,
"edit"
);

}


return false;


}






function createEditHistory(
entity,
changes,
reason=""
){


return {

id:
crypto.randomUUID(),

action:
"edit",

userId:
currentUser()?.id,

reason,

changes,

createdAt:
new Date()
.toISOString()

};


}







async function saveEntityEdit(
collection,
id,
changes,
reason=""
){


let entity =
await loadEditableEntity(
collection,
id
);


if(!entity){

throw Error(
"Entity not found"
);

}




let allowed =
await canEditEntity(entity);



if(!allowed){

throw Error(
"No permission"
);

}



let updated = {

...entity,

...changes,


data:{

...(entity.data || {}),

...(changes.data || {})

},


history:[

...(entity.history || []),

createEditHistory(
entity,
changes,
reason
)

],


relations:{

...(entity.relations || {}),

...(changes.relations || {})

},


extensions:{

...(entity.extensions || {}),

...(changes.extensions || {})

},

metadata:{

...(entity.metadata || {}),

...(changes.metadata || {}),

updatedAt:
new Date()
.toISOString(),

updatedBy:
currentUser()?.id

}

};


Object.keys(
updated.data || {}
)
.forEach(key=>{


if(
key in changes
){


updated.data[key] =
changes[key];


}


});


if(
typeof updateRecord==="function"
){


await updateRecord(
collection,
entity.id,
updated
);


}



return updated;


}

/*
 Dynamic Field Engine v1
*/


function editableFields(entity){


let ignore=[

"id",
"schema",
"history",
"analytics",
"identity",

"refId",
"type",
"subtype",
"collection",

"userId",
"ownership",
"access",
"trust",

"metadata",

"password",

"createdAt",
"updatedAt",
"lastLogin"

];


let user =
currentUser();


let advanced =
user
&&
(
isOwner(user)
||
user.role==="admin"
);


return Object.keys(entity)

.filter(key=>{


if(
ignore.includes(key)
){

return false;

}



if(
!advanced
&&
[
"permissions",
"role",

"lifecycle",
"moderation",

"seo",
"extensions"
]
.includes(key)
){

return false;

}



return true;


})

.map(key=>({

key,

value:entity[key],

type:fieldType(entity[key])

}));


}





function fieldType(value){


if(value===null){

return "null";

}


if(Array.isArray(value)){

return "array";

}


if(typeof value==="object"){

return "object";

}


return typeof value;


}






function buildChangesFromFields(){


let changes={};


document

.querySelectorAll("[data-field]")

.forEach(input=>{


let key =
input.dataset.field;


let type =
input.dataset.type;


let value =
input.value;


if(type==="number"){

value =
Number(value);

}


if(type==="null"){

value=null;

}


if(type==="multi"){

let checked =
[...document.querySelectorAll(
`[data-field="${key}"]:checked`
)]
.map(x=>x.value);


changes[key]=checked;


return;

}


if(type==="array"){

value =
value
.split(",")

.map(x=>x.trim())

.filter(Boolean);

}

if(type==="object"){


try{

value =
JSON.parse(value);

}

catch(e){


console.warn(
"Invalid object:",
key
);


}


}


if(type==="boolean"){

value =
input.checked;

}




changes[key]=value;


});



return changes;


}