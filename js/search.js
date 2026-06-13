/*
 Pharmora Search Engine
 Client side search system
*/


let pharmoraIndex=[];




async function buildSearchIndex(){


pharmoraIndex=[];




/* Courses */


const courses=[

"bpharm",
"dpharm",
"mpharm",
"pharmd"

];



for(const item of courses){


try{


let response =
await fetch(
`../data/courses/${item}.json`
);



let data =
await response.json();



pharmoraIndex.push({

title:data.course.name,

type:"Course",

description:data.course.description

});



}


catch(e){}



}









/* B.Pharm Curriculum */


try{


let response =
await fetch(
"../data/curriculum/bpharm-pci.json"
);


let data =
await response.json();



data.curriculum.semesters.forEach(sem=>{


sem.subjects.forEach(subject=>{


pharmoraIndex.push({

title:subject.name,

type:"Subject",

description:
subject.code+" | Semester "+sem.semester

});



});


});


}


catch(e){}







console.log(
"Search Ready:",
pharmoraIndex.length
);


}










function pharmoraSearch(query){



const box =
document.getElementById(
"search-results"
);



if(!box){

return;

}



if(query.length < 2){


box.innerHTML="";

return;


}






let results =
pharmoraIndex.filter(item=>{


return (

item.title
.toLowerCase()
.includes(query.toLowerCase())


||

item.description
.toLowerCase()
.includes(query.toLowerCase())

);


});







box.innerHTML="";




results.forEach(item=>{


box.innerHTML += `


<div class="card">


<h3>

${item.title}

</h3>



<p>

${item.type}

<br>

${item.description}

</p>


</div>


`;



});




}







buildSearchIndex();