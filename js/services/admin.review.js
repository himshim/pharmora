async function renderAdminActions(){



let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}


let title =
document.getElementById(
"section-title"
);



if(title){


title.innerHTML =
"Content Review Queue";


}


let items =
await getAllReviewItems();





let pending =
items.filter(x=>{

return (

x.moderation?.status==="pending"

||

x.status==="pending"

);

});







if(pending.length===0){



box.innerHTML=`


<div class="panel">

Everything reviewed

<span class="status">

✓

</span>

</div>


`;



return;



}









box.innerHTML =

pending.map(item=>`





<div class="panel">



<div>



<h3>

${contentIcon(item._collection)}

${

item.title ||

item.question ||

item.name ||

"Untitled"

}

</h3>





<small>


Type:

${item._collection}


<br>


👤

${item.author?.name || "Unknown"}


<br>


🎓

${item.data?.course || item.course || "-"}


<br>


📘

${item.data?.semester || item.semester || "-"}


<br>


🧪

${item.data?.subject || item.subject || "-"}


<br>


🏷

${(item.tags || []).join(", ")}


</small>




</div>








<div>


<button onclick="viewContent('${item._collection}','${item.id}')">

👁

</button>



<button onclick="commentContent('${item._collection}','${item.id}')">

💬

</button>



<button onclick="approveContent('${item._collection}','${item.id}')">

✅

</button>



<button onclick="rejectContent('${item._collection}','${item.id}')">

❌

</button>



<button onclick="deleteContent('${item._collection}','${item.id}')">

🗑

</button>


</div>





</div>




`).join("");



}

async function viewContent(
collection,
id
){



let item =
await findContent(
collection,
id
);




if(!item){

return;

}




let html = `


<div class="card">


<div class="badge">

${contentIcon(collection)}

${collection}

</div>



<br><br>



<h1>

${

item.title ||

item.question ||

"Untitled"

}

</h1>





<p>

${

item.description ||

item.data?.description ||

item.data?.answer ||

item.answer ||

""

}

</p>





<br>



<p>


⭐

${item.difficulty || ""}


<br>


🏷

${(item.tags || []).join(", ")}


</p>




</div>


`;





openAdminModal(

html

);


}










async function commentContent(
collection,
id
){



let html = `


<div class="card">


<h2>

💬 Review Comment

</h2>



<p>

Send feedback to contributor

</p>



<br>



<textarea

id="review-message"

placeholder="Write improvement suggestions, approval notes, or rejection reason..."

></textarea>





<br><br>



<button

class="btn btn-primary"

onclick="saveReviewComment('${collection}','${id}')">

Save Comment

</button>



</div>


`;




openAdminModal(

html

);



}