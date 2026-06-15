/*
 Pharmora Dynamic Data System
*/


let activeCurriculum=null;




async function loadJSON(path){


try{


const response =
await fetch(path);


if(!response.ok){

throw new Error(
"Unable to load data"
);

}


return await response.json();


}



catch(error){


console.error(
"Pharmora Data:",
error
);


return null;


}


}







/* LOAD COURSES */


async function loadCourses(){


const files=[

"../data/courses/bpharm.json",

"../data/courses/dpharm.json",

"../data/courses/mpharm.json",

"../data/courses/pharmd.json"

];



let courses=[];



for(const file of files){


let data =
await loadJSON(file);



if(data){

courses.push(
data.course
);

}


}



return courses;


}









/* SHOW COURSE CARDS */


async function renderCourses(id){



const box =
document.getElementById(id);



if(!box){

return;

}



const courses =
await loadCourses();



box.innerHTML="";




courses.forEach(course=>{



box.innerHTML += `


<div
class="card course"
onclick="openCourse('${course.id}')">


<h2>

${course.short_name}

</h2>


<p>

${course.description}

</p>


</div>


`;



});



}









/* OPEN COURSE */


async function openCourse(course){



let file=null;




if(course==="bpharm"){


file=
"../data/curriculum/bpharm-pci.json";


}




if(course==="dpharm"){


file=
"../data/curriculum/dpharm-er2020.json";


}




if(!file){


showToast(
"Curriculum coming soon"
);


return;


}





const data =
await loadJSON(file);



if(!data){

return;

}



activeCurriculum =
data.curriculum;



showCurriculum();


}











/* DISPLAY SEMESTERS / YEARS */


function showCurriculum(){



const area =
document.getElementById(
"curriculum-view"
);



if(!area){

return;

}



area.innerHTML="";







if(activeCurriculum.semesters){



activeCurriculum.semesters.forEach((sem,index)=>{



area.innerHTML += `


<div
class="card"
onclick="showSubjects('semester',${index})">


<h2>

Semester ${sem.semester}

</h2>



<p>

${sem.subjects.length}
Subjects

</p>


</div>


`;



});



}









if(activeCurriculum.years){



activeCurriculum.years.forEach((year,index)=>{



area.innerHTML += `


<div
class="card"
onclick="showSubjects('year',${index})">


<h2>

Year ${year.year}

</h2>



<p>

${year.subjects.length}
Subjects

</p>


</div>


`;



});



}



}











/* SHOW SUBJECTS */


function showSubjects(type,index){



const area =
document.getElementById(
"curriculum-view"
);



let subjects=[];



if(type==="semester"){


subjects =
activeCurriculum
.semesters[index]
.subjects;


}




if(type==="year"){


subjects =
activeCurriculum
.years[index]
.subjects;


}







area.innerHTML = `


<div
class="card"
onclick="showCurriculum()">


← Back


</div>


`;










subjects.forEach(subject=>{



area.innerHTML += `


<div 
class="card"
onclick="location.href='../learn/subject.html?id=${subject.code}'">



<h2>

${subject.code}

</h2>




<p>

${subject.name}

<br>

${subject.type}

</p>



</div>


`;



});



}
