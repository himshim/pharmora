/*
 Pharmora Universal Search Engine
 Works on GitHub Pages, custom domains, Netlify, Vercel
*/


let pharmoraIndex=[];





/* Find project root automatically */


function rootPath(){


let scripts =
document.getElementsByTagName(
"script"
);



for(let script of scripts){


if(
script.src.includes(
"search.js"
)
){


return script.src
.replace(
"js/search.js",
""
);


}


}



return "./";


}









/* Build Search Index */


async function buildSearchIndex(){



pharmoraIndex=[];



const base =
rootPath();








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

"data/courses/"+

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

base+"learn/"



});





}




catch(e){



console.log(

"Course missing:",

course

);



}




}










/* Curriculum Subjects */


try{



let response =
await fetch(

base+

"data/curriculum/bpharm-pci.json"

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

base+

"learn/subject.html?id="+

subject.code




});





});



});





}



catch(e){



console.log(

"Curriculum unavailable"

);



}










console.log(

"Pharmora Search Loaded:",

pharmoraIndex.length

);



}











/* Search Function */


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








query =
query.toLowerCase();







const results =

pharmoraIndex.filter(

item=>


item.title
.toLowerCase()
.includes(query)


||


item.description
.toLowerCase()
.includes(query)



);










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