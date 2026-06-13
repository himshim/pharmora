/*
 Pharmora Data System
*/


async function loadJSON(path){


    try{


        const response =
        await fetch(path);


        if(!response.ok){

            throw new Error(
                "Data unavailable"
            );

        }


        return await response.json();


    }


    catch(error){


        console.error(
            "Pharmora:",
            error
        );


        return null;

    }

}






/* LOAD COURSES */


async function loadCourses(){


    const files = [

        "../data/courses/bpharm.json",

        "../data/courses/dpharm.json",

        "../data/courses/mpharm.json",

        "../data/courses/pharmd.json"

    ];



    let courses=[];



    for(const file of files){


        const data =
        await loadJSON(file);


        if(data){

            courses.push(
                data.course
            );

        }

    }



    return courses;


}







/* SHOW COURSES */


async function renderCourses(id){


    const box =
    document.getElementById(id);


    if(!box) return;




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

        file="../data/curriculum/bpharm-pci.json";

    }



    if(course==="dpharm"){

        file="../data/curriculum/dpharm-er2020.json";

    }




    const data =
    await loadJSON(file);



    if(!data){

        alert(
        "Curriculum coming soon"
        );

        return;

    }



    showCurriculum(
        data.curriculum
    );


}








/* DISPLAY CURRICULUM */


function showCurriculum(data){



const area =
document.getElementById(
"curriculum-view"
);



if(!area) return;



area.innerHTML="";





if(data.semesters){



data.semesters.forEach(sem=>{


area.innerHTML += `

<div class="card">


<h2>

Semester ${sem.semester}

</h2>


<p>

${sem.subjects.length}
Subjects Available

</p>


</div>


`;



});


}





if(data.years){



data.years.forEach(year=>{


area.innerHTML += `

<div class="card">


<h2>

Year ${year.year}

</h2>


<p>

${year.subjects.length}
Subjects Available

</p>


</div>


`;



});


}



}