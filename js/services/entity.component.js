/*
 Pharmora Entity Core v3
 Safe compatibility layer
*/


function entityValue(
entity,
field,
fallback=""
){


if(!entity){

return fallback;

}


return (

entity[field]

??

entity.data?.[field]

??

entity.metadata?.[field]

??

fallback

);


}




function normalizeEntity(entity){


if(!entity){

return null;

}


entity.data =
entity.data || {};


entity.relations =
entity.relations || {
parents:[],
children:[],
linked:[]
};


entity.metadata =
entity.metadata || {};


entity.history =
entity.history || [];


entity.extensions =
entity.extensions || {};


return entity;


}





function entityRelations(
entity,
type="linked"
){


return (

entity?.relations?.[type]

||

[]

);


}




function entityOwner(entity){


return (

entity?.ownership?.ownerId

||

entity?.userId

||

entity?.data?.userId

||

null

);


}





async function entityCanEdit(entity){


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


async function renderEntityPage(route){


if(!route || !route.data){

return false;

}



let main =
document.querySelector("main");


if(!main){

return false;

}



let item =
normalizeEntity(
route.data
);



if(route.type==="books"){

return renderBookPage(main,item);

}



if(route.type==="resources"){

return renderResourcePage(main,item);

}



if(route.type==="profiles"){

return renderProfilePage(main,item);

}



if(route.type==="events"){

return renderEventPage(main,item);

}



return renderDefaultEntity(main,item,route.type);


}








function renderDefaultEntity(main,item,type){


main.innerHTML=`

<section class="container section">

<div class="card">

<h1>
${entityValue(item,"title",
entityValue(item,"name","Untitled")
)}
</h1>

<p>
${entityValue(item,"description")}
</p>

<hr>

<p>
<b>Type:</b> ${type}
</p>

<p>
<b>ID:</b> ${entityValue(item,"refId",item.id)}
</p>

</div>

</section>

`;


return true;


}










function renderBookPage(main,item){


main.innerHTML=`

<section class="container section">

<div class="card">

<div class="badge">
📚 Book
</div>


<h1>
${item.title}
</h1>


<p>
${entityValue(item,"description")}
</p>


<hr>


<p>
<b>Author:</b>
${item.author || item.data?.author || "Unknown"}
</p>


<p>
<b>Reference:</b>
${item.refId}
</p>


</div>

</section>

`;


return true;


}









function renderResourcePage(main,item){


main.innerHTML=`

<section class="container section">

<div class="card">

<div class="badge">
📄 Resource
</div>


<h1>
${item.title}
</h1>


<p>
${entityValue(item,"description")}
</p>


<hr>


<p>
Status:
${item.lifecycle?.status}
</p>


</div>

</section>

`;


return true;


}










function renderProfilePage(main,item){


main.innerHTML=`

<section class="container section">

<div class="card">

<div class="badge">
👤 Profile
</div>


<h1>
${item.title || item.displayName}
</h1>


<p>
${item.headline || ""}
</p>


<hr>


<p>
Reputation:
${item.stats?.reputation || 0}
</p>


</div>

</section>

`;


return true;


}









function renderEventPage(main,item){


main.innerHTML=`

<section class="container section">

<div class="card">

<div class="badge">
📅 Event
</div>


<h1>
${item.title}
</h1>


<p>
${item.description || ""}
</p>


</div>

</section>

`;


return true;


}