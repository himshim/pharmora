/*
 Pharmora Public Content Service
*/






async function getPublished(
collection
){



let data =
await getRecords(
collection
);




return data.filter(

item=>item.status==="approved"

);



}










async function renderContent(
collection,
target
){






let box =
document.getElementById(
target
);





let items =
await getPublished(
collection
);







if(

items.length===0

){



box.innerHTML=`


<div class="card">


<h2>

Nothing published yet

</h2>


<p>

Approved content will appear here.

</p>


</div>


`;



return;



}









box.innerHTML =

items.map(item=>`





<div class="card">



<h2>


${contentIcon(collection)}

${item.title}



</h2>





<p>


${item.description || ""}


</p>






<br>





<small>


🎓 ${(item.courses || []).join(", ")}


<br>


📘 ${(item.semesters || []).join(", ")}


<br>


🧪 ${(item.subjects || []).join(", ")}


<br>


🏷 ${(item.tags || []).join(", ")}



</small>







<br><br>





${

item.content?.link

?

`

<a

class="btn"

target="_blank"

location.href =

"../library/view.html?id="

+

item.id

+

"&type="

+

collection

Open

</a>

`

:

""

}





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