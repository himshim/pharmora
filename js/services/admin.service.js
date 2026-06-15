/*
 Pharmora Admin Review Service
 Universal Content Moderation
*/





const reviewCollections = [

"resources",

"books",

"events",

"tools",

"teaching-materials",

"question-bank",

"assignments"

];









async function getAllReviewItems(){



let all=[];





for(let collection of reviewCollections){



try{



let data =
await getRecords(collection);




data.forEach(item=>{



all.push({

...item,

_collection:collection

});



});



}



catch(error){



console.warn(

"Skipped:",
collection

);



}



}





return all;



}









async function renderAdminStats(){



let box =
document.getElementById(
"admin-stats"
);



if(!box){

return;

}





let items =
await getAllReviewItems();





let pending =
items.filter(
x=>x.status==="pending"
).length;




let approved =
items.filter(
x=>x.status==="approved"
).length;






box.innerHTML = `


<div class="card">

<h2>${pending}</h2>

<p>Pending Review</p>

</div>



<div class="card">

<h2>${approved}</h2>

<p>Published</p>

</div>



<div class="card">

<h2>${items.length}</h2>

<p>Total Content</p>

</div>


`;



}









async function renderAdminActions(){



let box =
document.getElementById(
"admin-actions"
);



if(!box){

return;

}





let items =
await getAllReviewItems();





let pending =
items.filter(

x=>x.status==="pending"

);







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

${item.title}

</h3>





<small>


Type:

${item._collection}


<br>


👤

${item.author?.name || "Unknown"}


<br>


🎓

${item.course || "-"}


<br>


📘

${item.semester || "-"}


<br>


🧪

${item.subject || "-"}


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









function contentIcon(type){



return {

resources:"📚",

books:"📖",

events:"📅",

tools:"🧰"


}[type]

|| "📄";



}











async function findContent(
collection,
id
){



let items =
await getRecords(
collection
);



return items.find(

x=>x.id===id

);



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





showToast(

`${item.title}

${item.description || ""}`,

"info"

);



}









async function commentContent(
collection,
id
){





let message =
prompt(

"Comment for contributor"

);




if(!message){

return;

}





let item =
await findContent(
collection,
id
);





let review =
item.review || {

comments:[]

};





review.comments.push({


message:message,


time:

new Date()
.toISOString()


});






await updateRecord(

collection,

id,

{

review:review

}

);





showToast(

"Comment saved",

"success"

);



}











async function approveContent(
collection,
id
){





await updateRecord(

collection,

id,

{

status:"approved"

}

);





showToast(

"Approved",

"success"

);




renderAdminStats();

renderAdminActions();




}











async function rejectContent(
collection,
id
){






await updateRecord(

collection,

id,

{

status:"rejected"

}

);





showToast(

"Rejected",

"info"

);




renderAdminStats();

renderAdminActions();




}











async function deleteContent(
collection,
id
){






let ok =

typeof showConfirm==="function"

?

await showConfirm(
"Delete permanently?"
)

:

confirm(
"Delete permanently?"
);






if(!ok){

return;

}








await deleteRecord(

collection,

id

);







showToast(

"Deleted",

"success"

);





renderAdminStats();

renderAdminActions();




}