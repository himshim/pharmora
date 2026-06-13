/*
 Pharmora Global Search Engine
*/


let pharmoraIndex=[];





/* Detect correct path */


function dataPath(){


let path =
window.location.pathname;



if(
path.includes("/learn/") ||
path.includes("/teach/") ||
path.includes("/tools/") ||
path.includes("/community/") ||
path.includes("/library/")
){

return "../data/";

}



return "data/";



}









/* Build Index */


async function buildSearchIndex(){



pharmoraIndex=[];



const base =
dataPath();






/* Courses */


const courses=[

"bpharm",

"dpharm",

"mpharm",

"pharmd"

];





for(const course of courses){



try{



let response =
await fetch(

base+
"courses/"+
course+
".json"

);



let data =
await response.json();




pharmoraIndex.push({


title:
data.course.name,


type:
"Course",


description:
data.course.description,


link:
"learn/"


});



}



catch(e){}



}









/* B.Pharm Subjects */


try{



let response =
await fetch(

base+
"curriculum/bpharm-pci.json"

);



let data =
await response.json();




data.curriculum.semesters.forEach(
semester=>{



semester.subjects.forEach(
subject=>{



pharmoraIndex.push({


title:
subject.name,


type:
"Subject",


description:

subject.code+
" | Semester "+
semester.semester,


link:

"learn/subject.html?id="+
subject.code



});



});


});




}



catch(e){}








console.log(

"Pharmora Search Loaded:",

pharmoraIndex.length

);



}









/* Search */


function pharmoraSearch(query){



const resultBox =
document.getElementById(
"search-results"
);



if(!resultBox){

return;

}




if(query.length < 2){


resultBox.innerHTML="";

return;


}






const results =

pharmoraIndex.filter(item=>{


return (

item.title
.toLowerCase()
.includes(
query.toLowerCase()
)


||

item.description
.toLowerCase()
.includes(
query.toLowerCase()
)

);


});







resultBox.innerHTML="";






if(results.length===0){



resultBox.innerHTML=`

<div class="card">

No results found

</div>

`;


return;


}







results.forEach(item=>{



resultBox.innerHTML += `


<div 
class="card"
onclick="location.href='${item.link}'">


<h2>

${item.title}

</h2>


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