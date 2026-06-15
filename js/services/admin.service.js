/*
 Pharmora Admin Review Service
 Universal Content Moderation
*/







const reviewCollections = [

"resources",

"books",

"events",

"tools"

];









async function getAllReviewItems(){



let all=[];






for(

let collection of reviewCollections

){





let data =
await getRecords(
collection
);






data.forEach(item=>{



all.push({

...item,

_collection:

collection

});



});



}





return all;



}









async function renderAdminStats(){






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








document

.getElementById(

"admin-stats"

)

.innerHTML = `




<div class="card">


<h2>

${pending}

</h2>


<p>

Pending Review

</p>


</div>








<div class="card">


<h2>

${approved}

</h2>


<p>

Published

</p>


</div>









<div class="card">


<h2>

${items.length}

</h2>


<p>

Total Content

</p>


</div>



`;




}













async function renderAdminActions(){






let box =
document.getElementById(

"admin-actions"

);








let items =
await getAllReviewItems();







let pending =
items.filter(

x=>x.status==="pending"

);








if(

pending.length===0

){



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


${icon(item._collection)}

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

${(item.courses || []).join(", ")}



<br>



📘

${(item.semesters || []).join(", ")}




<br>



🧪

${(item.subjects || []).join(", ")}




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









function icon(type){



return {

resources:"📚",

books:"📖",

events:"📅",

tools:"🧰"


}[type] || "📄";



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








showToast(`


Title:
${item.title}


Type:
${collection}


Description:
${item.description || ""}


Courses:
${(item.courses || []).join(", ")}


Subjects:
${(item.subjects || []).join(", ")}


Tags:
${(item.tags || []).join(", ")}


Link:
${item.content?.link || "None"}


File:
${item.content?.file?.name || "None"}


`);





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

"Comment saved"

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






renderAdminStats();

renderAdminActions();




}









async function deleteContent(
collection,
id
){






if(

!confirm(

"Delete permanently?"

)

){

return;

}







await deleteRecord(

collection,

id

);







renderAdminStats();

renderAdminActions();




}