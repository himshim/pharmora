/*
 Pharmora Data Loader

 Connects static JSON data
 with the user interface
*/


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
            "Pharmora Data Error:",
            error
        );


        return null;


    }


}






/*
 Load course information
*/


async function loadCourses(){


    const courses = [

        "../data/courses/bpharm.json",

        "../data/courses/dpharm.json",

        "../data/courses/mpharm.json",

        "../data/courses/pharmd.json"

    ];



    let output = [];



    for(const item of courses){



        const data =
        await loadJSON(item);



        if(data){

            output.push(
                data.course
            );

        }


    }



    return output;


}






/*
 Render course cards automatically
*/


async function renderCourses(containerId){


    const container =
    document.getElementById(
        containerId
    );



    if(!container){

        return;

    }



    const courses =
    await loadCourses();





    container.innerHTML = "";





    courses.forEach(course=>{



        container.innerHTML += `


        <div class="card">


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