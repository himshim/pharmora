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










async function resolveName(
collection,
id
){



if(!id){

return "";

}




let data =
await getRecords(
collection
);



let item =
data.find(
x=>x.id===id
);




if(!item){

return "";

}



return (

item.name ||

item.title ||

item.code ||

""

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



if(!box){

return;

}





let items =
await getPublished(
collection
);







if(items.length===0){



box.innerHTML=`


<div class="card empty-state">


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










let html="";






for(let item of items){






let course =
await resolveName(
"courses",
item.course
);



let curriculum =
await resolveName(
"curriculums",
item.curriculum
);



let semester =
await resolveName(
"semesters",
item.semester
);



let subject =
await resolveName(
"subjects",
item.subject
);



let unit =
await resolveName(
"units",
item.unit
);








html += `




<div class="card">






<h2>


${contentIcon(collection)}

${item.title}


</h2>







<p>


${item.description || ""}


</p>







<small>


${course ? "🎓 "+course+"<br>" : ""}


${curriculum ? "📘 "+curriculum+"<br>" : ""}


${semester ? "📅 "+semester+"<br>" : ""}


${subject ? "🧪 "+subject+"<br>" : ""}


${unit ? "📄 "+unit+"<br>" : ""}



${

(item.tags || []).length

?

"🏷 "+item.tags.join(", ")

:

""

}



</small>









<br><br>






<a

class="btn"

href="${

appPath(

`library/view.html?id=${item.id}&type=${collection}`

)

}"

>


Open


</a>








</div>




`;



}








box.innerHTML=html;



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