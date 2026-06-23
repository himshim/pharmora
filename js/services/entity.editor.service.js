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


metadata:{

...(entity.metadata || {}),

updatedAt:
new Date()
.toISOString(),

updatedBy:
currentUser()?.id

}

};





if(
typeof updateRecord==="function"
){


await updateRecord(
collection,
id,
updated
);


}



return updated;


}