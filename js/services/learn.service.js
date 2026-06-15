/*
 Pharmora Learn Service
 CMS Powered
*/



async function loadLearn(){



let box =
document.getElementById(
"course-list"
);



if(!box){

return;

}




let courses =
await getRecords(
"courses"
);




if(courses.length===0){


box.innerHTML=`

<div class="card">

No courses added yet

</div>

`;


return;


}







box.innerHTML="";






courses.forEach(course=>{



box.innerHTML += `


<div

class="card"

onclick="openCourse('${course.id}')"

>


<h2>

🎓 ${course.name}

</h2>


<p>

${course.description || ""}

</p>


</div>


`;



});



}









async function openCourse(id){



let view =
document.getElementById(
"curriculum-view"
);




let curriculums =
await getRecords(
"curriculums"
);




curriculums =

curriculums.filter(

x=>x.course===id

);






if(curriculums.length===0){



view.innerHTML=`

<div class="card">

No curriculum added

</div>

`;



return;



}








view.innerHTML="";






curriculums.forEach(cur=>{



view.innerHTML += `



<div class="card">


<h2>

📘 ${cur.name}

</h2>


<p>

${cur.description || ""}

</p>



<button

class="btn"

onclick="openCurriculum('${cur.id}')"

>

Explore

</button>


</div>



`;



});



}










async function openCurriculum(id){



let view =
document.getElementById(
"curriculum-view"
);




let semesters =
await getRecords(
"semesters"
);




semesters =

semesters.filter(

x=>x.curriculum===id

);







view.innerHTML="";






semesters.forEach(sem=>{



view.innerHTML += `


<div class="card">


<h2>

📁 ${sem.name}

</h2>


<button

class="btn"

onclick="openSemester('${sem.id}')"

>

Subjects

</button>


</div>


`;



});



}











async function openSemester(id){



let view =
document.getElementById(
"curriculum-view"
);




let subjects =
await getRecords(
"subjects"
);




subjects =
subjects.filter(

x=>x.semester===id

);






view.innerHTML="";







subjects.forEach(sub=>{



view.innerHTML += `


<a

class="card"

href="subject.html?id=${sub.id}"

>


<h2>

🧪 ${sub.code || ""}

</h2>


<h3>

${sub.name}

</h3>


<p>

${sub.description || ""}

</p>


</a>


`;



});



}