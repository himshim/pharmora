/*
 Pharmora Learn Service
 Full CMS Learning Engine
*/



let learningPath = {

course:"",
curriculum:"",
semester:"",
subject:"",
unit:""

};





function updateLearningPath(){


let box =
document.getElementById(
"learning-path"
);


if(!box){

return;

}



box.innerHTML =

Object.values(learningPath)

.filter(Boolean)

.join(" → ")

||

"Select course";


}










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




courses =
courses.filter(
x=>x.active!==false
);





if(courses.length===0){


box.innerHTML = `

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
onclick="openCourse('${course.id}','${course.name}')">


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









async function openCourse(
id,
name
){



learningPath.course=name;

learningPath.curriculum="";
learningPath.semester="";
learningPath.subject="";
learningPath.unit="";


updateLearningPath();





let view =
document.getElementById(
"curriculum-view"
);





let data =
await getRecords(
"curriculums"
);




data =
data.filter(
x=>x.course===id
);






if(data.length===0){



view.innerHTML=

"<div class='card'>No curriculum added</div>";



return;


}






view.innerHTML="";






data.forEach(cur=>{



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

onclick="openCurriculum('${cur.id}','${cur.name}')">


Explore


</button>


</div>


`;



});



}









async function openCurriculum(
id,
name
){



learningPath.curriculum=name;

learningPath.semester="";
learningPath.subject="";
learningPath.unit="";


updateLearningPath();






let view =
document.getElementById(
"semester-view"
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



let title =

sem.name ||

(
sem.system +

" " +

sem.count

);





view.innerHTML += `



<div class="card">


<h2>

📅 ${title}

</h2>



<button

class="btn"

onclick="openSemester('${sem.id}','${title}')">


Subjects


</button>


</div>


`;



});



}









async function openSemester(
id,
name
){



learningPath.semester=name;

learningPath.subject="";
learningPath.unit="";


updateLearningPath();






let view =
document.getElementById(
"subject-view"
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



<div class="card">


<h2>

🧪 ${sub.code || ""}

</h2>



<h3>

${sub.name}

</h3>



<p>

${sub.description || ""}

</p>



<button

class="btn"

onclick="openSubject('${sub.id}','${sub.name}')">


Open


</button>


</div>


`;



});



}










async function openSubject(
id,
name
){



learningPath.subject=name;

learningPath.unit="";


updateLearningPath();






let view =
document.getElementById(
"unit-view"
);






let units =
await getRecords(
"units"
);




units =
units.filter(
x=>x.subject===id
);






view.innerHTML="";






units.forEach(unit=>{



view.innerHTML += `


<div class="card">


<h2>

📄 ${unit.name}

</h2>


<p>

${unit.description || ""}

</p>



<button

class="btn"

onclick="openUnit('${unit.id}','${unit.name}')">


Study


</button>


</div>


`;



});





loadMaterials(
"subject",
id
);



}











async function openUnit(
id,
name
){


learningPath.unit=name;


updateLearningPath();



loadMaterials(
"unit",
id
);



}









async function loadMaterials(
field,
id
){



let box =
document.getElementById(
"learning-materials"
);



if(!box){

return;

}



box.innerHTML="";





let collections=[

["resources","📚"],

["teaching-materials","👨‍🏫"],

["question-bank","❓"],

["assignments","📝"]

];







for(let item of collections){



let data =
await getRecords(
item[0]
);





data =
data.filter(x=>{


return (

x.status==="approved"

&&

x[field]===id

);


});







data.forEach(content=>{



box.innerHTML += `


<div class="card">


<h2>

${item[1]}

${

content.title ||

content.question ||

"Untitled"

}

</h2>


<p>

${content.description || ""}

</p>


<a

class="btn"

href="${appPath(`library/view.html?id=${content.id}&type=${item[0]}`)}">


Open


</a>


</div>


`;



});



}








if(box.innerHTML===""){



box.innerHTML = `

<div class="card">

No study material uploaded yet

</div>

`;


}



}