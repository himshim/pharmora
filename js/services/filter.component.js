function applyContentFilters(
items,
filters
){



return items.filter(item=>{



if(

filters.course

&&

item.course!==filters.course

){

return false;

}




if(

filters.semester

&&

item.semester!==filters.semester

){

return false;

}






if(

filters.subject

&&

item.subject!==filters.subject

){

return false;

}






if(

filters.difficulty

&&

item.difficulty!==filters.difficulty

){

return false;

}






if(filters.tags){



let tags =

(item.tags || [])

.join(" ")

.toLowerCase();




if(

!tags.includes(

filters.tags.toLowerCase()

)

){

return false;

}



}







return true;



});



}

async function applyFilters(){



let filters={



course:

document.getElementById(
"filter-course"
)?.value,


semester:

document.getElementById(
"filter-semester"
)?.value,


subject:

document.getElementById(
"filter-subject"
)?.value,


difficulty:

document.getElementById(
"filter-difficulty"
)?.value,


tags:

document.getElementById(
"filter-tags"
)?.value



};







let type =
document.getElementById(
"filter-type"
)?.value;








if(type){



renderContent(
type,
type+"-list",
filters
);



return;



}









renderContent(
"resources",
"resources-list",
filters
);



renderContent(
"books",
"books-list",
filters
);



renderContent(
"teaching-materials",
"teaching-list",
filters
);



renderContent(
"question-bank",
"questions-list",
filters
);



renderContent(
"assignments",
"assignments-list",
filters
);



}
