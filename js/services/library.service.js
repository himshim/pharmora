/*
 Library Service
 Loads Approved Resources
*/





let libraryItems=[];






async function renderLibrary(
target
){



let box =
document.getElementById(
target
);




let resources =
await getRecords(
"resources"
);





libraryItems =

resources.filter(

item=>item.status==="approved"

);







if(

libraryItems.length===0

){


box.innerHTML = `


<div class="card">


<h2>

No resources yet

</h2>


<p>

Approved contributions will appear here.

</p>


</div>


`;



return;


}









box.innerHTML =

libraryItems.map(item=>`




<div class="card">



<h2>

📚 ${item.title}

</h2>




<p>

${item.description || ""}

</p>





<br>





<small>


🎓 ${(item.courses || []).join(", ")}


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

href="${item.content.link}"

target="_blank">

Open Link

</a>

`

:

""

}






${

item.content?.file

?

`

<button

class="btn"

onclick="downloadResource('${item.id}')">

Download

</button>

`

:

""

}





</div>



`).join("");




}










async function downloadResource(id){





let item =

libraryItems.find(

x=>x.id===id

);





if(!item){

return;

}







item.stats =

item.stats || {

views:0,

downloads:0

};






item.stats.downloads++;






await updateRecord(

"resources",

id,

{

stats:item.stats

}

);







alert(

"Download started"

);




console.log(

item.content.file

);



}
