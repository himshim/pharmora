/*
 Pharmora Entity Component v2
 Universal Detail Renderer
*/


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
route.data;



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
${item.title || item.name || item.data?.name || "Untitled"}
</h1>

<p>
${item.description || item.data?.description || ""}
</p>

<hr>

<p>
<b>Type:</b> ${type}
</p>

<p>
<b>ID:</b> ${item.refId || item.id}
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
${item.description || item.data?.description || ""}
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
${item.description || item.data?.description || ""}
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